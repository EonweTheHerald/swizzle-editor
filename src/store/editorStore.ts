import { create } from 'zustand';
import type { EditorState, EditorConfig, AssetState, TextureAsset, SequenceAsset, LayoutState, HistoryEntry } from './types';
import type { BehaviorConfig, EmitterConfig } from '@eonwetheherald/swizzle';
import { recentreEmittersOnResize } from '@/utils/configTransform';
import { debounce } from '@/lib/utils';

const MAX_HISTORY = 100;
const MIN_TIME_SCALE = 0.1;
const MAX_TIME_SCALE = 4;

/**
 * Default editor configuration
 */
const createDefaultConfig = (): EditorConfig => ({
  system: {
    maxParticles: 1000,
    autoStart: true,
  },
  emitters: [],
});

/**
 * Default layout state
 */
const PANE_MIN_WIDTH = 180;
const createDefaultLayout = (): LayoutState => ({
  leftPaneWidth: 260,
  rightPaneWidth: 320,
  leftPaneCollapsed: false,
  rightPaneCollapsed: false,
  leftPaneLastWidth: 260,
  rightPaneLastWidth: 320,
});

/**
 * Default UI state
 */
const createDefaultUIState = () => ({
  selectedEmitterIndex: null,
  selectedBehaviorIndex: null,
  previewState: 'stopped' as const,
  showDebugMetrics: false,
  timeScale: 1.0,
  backgroundColor: 0x1a1a1a,
  hasUnsavedChanges: false,
  showGrid: true,
  gridSize: 50,
  zoom: 1.0,
  hiddenEmitterIndices: new Set<number>(),
  canvasWidth: 800,
  canvasHeight: 600,
  inspectorSearch: '',
});

/**
 * Default asset state
 */
const createDefaultAssetState = (): AssetState => ({
  textures: new Map(),
  sequences: new Map(),
});

/**
 * IndexedDB utilities for asset persistence
 */
class AssetDB {
  private dbName = 'swizzle-editor';
  private version = 1;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private ensureDB(): Promise<void> {
    if (this.db) return Promise.resolve();
    if (!this.initPromise) this.initPromise = this.init();
    return this.initPromise;
  }

  private async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('textures')) {
          db.createObjectStore('textures', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sequences')) {
          db.createObjectStore('sequences', { keyPath: 'id' });
        }
      };
    });
  }

  async saveTexture(texture: TextureAsset): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['textures'], 'readwrite');
      const store = transaction.objectStore('textures');
      const request = store.put(texture);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTexture(id: string): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['textures'], 'readwrite');
      const store = transaction.objectStore('textures');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveSequence(sequence: SequenceAsset): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sequences'], 'readwrite');
      const store = transaction.objectStore('sequences');
      const request = store.put(sequence);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSequence(id: string): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sequences'], 'readwrite');
      const store = transaction.objectStore('sequences');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const assetDB = new AssetDB();

// -- Persist layout to localStorage --
const LAYOUT_KEY = 'swizzle-editor-layout';
function loadPersistedLayout(): LayoutState {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaults = createDefaultLayout();
      // Validate that numeric fields are actually numbers.
      const merge = { ...defaults, ...parsed };
      for (const key of Object.keys(defaults) as Array<keyof LayoutState>) {
        if (typeof defaults[key] === 'number' && typeof merge[key] !== 'number') {
          merge[key] = defaults[key];
        }
        if (typeof defaults[key] === 'boolean' && typeof merge[key] !== 'boolean') {
          merge[key] = defaults[key];
        }
      }
      return merge;
    }
  } catch { /* ignored */ }
  return createDefaultLayout();
}
function persistLayout(layout: LayoutState) {
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  } catch { /* ignored */ }
}

const debouncedPersistLayout = debounce(persistLayout, 300);

/**
 * Create a history snapshot
 */
function createSnapshot(state: EditorState): HistoryEntry {
  return {
    config: structuredClone(state.config),
    selection: {
      selectedEmitterIndex: state.ui.selectedEmitterIndex,
      selectedBehaviorIndex: state.ui.selectedBehaviorIndex,
    },
    label: '',
    timestamp: Date.now(),
  };
}

/**
 * Zustand store for editor state
 */
export const useEditorStore = create<EditorState>((set, get) => ({
  config: createDefaultConfig(),
  assets: createDefaultAssetState(),
  ui: createDefaultUIState(),
  layout: loadPersistedLayout(),
  history: [],
  historyIndex: -1,

  // ─── History / Undo / Redo ────────────────────────────────────────────────

  pushHistory: (label: string) => {
    const state = get();
    const entry: HistoryEntry = {
      ...createSnapshot(state),
      label,
    };
    // Truncate any "redo" entries beyond current index
    const history = state.history.slice(0, state.historyIndex + 1);
    history.push(entry);
    // Cap at MAX_HISTORY
    if (history.length > MAX_HISTORY) history.shift();
    set({ history, historyIndex: history.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < 0) return;

    // If at the tip, push current state so redo works
    if (historyIndex === history.length - 1) {
      const snapshot = createSnapshot(get());
      snapshot.label = 'current';
      // Clone to avoid mutating live state
      const updatedHistory = [...history, snapshot];
      set({ history: updatedHistory });
    }

    const entry = get().history[historyIndex];
    set((state) => ({
      config: structuredClone(entry.config),
      ui: {
        ...state.ui,
        selectedEmitterIndex: entry.selection.selectedEmitterIndex,
        selectedBehaviorIndex: entry.selection.selectedBehaviorIndex,
        hasUnsavedChanges: true,
      },
      historyIndex: historyIndex - 1,
    }));
  },

  redo: () => {
    const { history, historyIndex } = get();
    const nextIndex = historyIndex + 2; // +1 for the entry ahead, +1 because historyIndex was decremented
    if (nextIndex >= history.length) return;

    const entry = history[nextIndex];
    set((state) => ({
      config: structuredClone(entry.config),
      ui: {
        ...state.ui,
        selectedEmitterIndex: entry.selection.selectedEmitterIndex,
        selectedBehaviorIndex: entry.selection.selectedBehaviorIndex,
        hasUnsavedChanges: true,
      },
      historyIndex: nextIndex - 1,
    }));
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex + 2 < history.length;
  },

  // ─── System actions ───────────────────────────────────────────────────────
  resetToDefault: () => {
    set({
      config: createDefaultConfig(),
      assets: createDefaultAssetState(),
      ui: createDefaultUIState(),
      history: [],
      historyIndex: -1,
    });
  },

  setMaxParticles: (max: number) => {
    const clamped = Math.min(10000, Math.max(1, Math.round(Number.isFinite(max) ? max : 1000)));
    set((state) => ({
      config: {
        ...state.config,
        system: { ...state.config.system, maxParticles: clamped },
      },
      ui: { ...state.ui, hasUnsavedChanges: true },
    }));
  },

  setAutoStart: (autoStart: boolean) => {
    set((state) => ({
      config: {
        ...state.config,
        system: { ...state.config.system, autoStart },
      },
      ui: { ...state.ui, hasUnsavedChanges: true },
    }));
  },

  // Emitter actions
  addEmitter: (emitter: EmitterConfig) => {
    set((state) => ({
      config: {
        ...state.config,
        emitters: [...state.config.emitters, emitter],
      },
      ui: {
        ...state.ui,
        selectedEmitterIndex: state.config.emitters.length,
        hasUnsavedChanges: true,
      },
    }));
  },

  updateEmitter: (index: number, updates: Partial<EmitterConfig>) => {
    set((state) => {
      const emitters = [...state.config.emitters];
      if (index < 0 || index >= emitters.length) return state;
      emitters[index] = { ...emitters[index], ...updates };
      return {
        config: { ...state.config, emitters },
        ui: { ...state.ui, hasUnsavedChanges: true },
      };
    });
  },

  removeEmitter: (index: number) => {
    set((state) => {
      const emitters = state.config.emitters.filter((_emitter, i) => i !== index);
      const selectedIndex = state.ui.selectedEmitterIndex;
      const newSelectedIndex =
        selectedIndex === index
          ? emitters.length > 0
            ? Math.min(index, emitters.length - 1)
            : null
          : selectedIndex !== null && selectedIndex > index
          ? selectedIndex - 1
          : selectedIndex;

      // Adjust hidden indices after removal
      const newHiddenIndices = new Set<number>();
      state.ui.hiddenEmitterIndices.forEach((oldIndex) => {
        if (oldIndex === index) return; // Removed — drop it
        if (oldIndex > index) {
          newHiddenIndices.add(oldIndex - 1);
        } else {
          newHiddenIndices.add(oldIndex);
        }
      });

      return {
        config: { ...state.config, emitters },
        ui: {
          ...state.ui,
          selectedEmitterIndex: newSelectedIndex,
          hiddenEmitterIndices: newHiddenIndices,
          hasUnsavedChanges: true,
        },
      };
    });
  },

  duplicateEmitter: (index: number) => {
    set((state) => {
      const emitter = state.config.emitters[index];
      if (!emitter) return state;

      const duplicate = structuredClone(emitter);
      const emitters = [...state.config.emitters];
      emitters.splice(index + 1, 0, duplicate);

      return {
        config: { ...state.config, emitters },
        ui: {
          ...state.ui,
          selectedEmitterIndex: index + 1,
          hasUnsavedChanges: true,
        },
      };
    });
  },

  reorderEmitters: (startIndex: number, endIndex: number) => {
    set((state) => {
      const emitters = [...state.config.emitters];
      const [removed] = emitters.splice(startIndex, 1);
      emitters.splice(endIndex, 0, removed);

      // Update hidden indices to match new positions
      const newHiddenIndices = new Set<number>();
      state.ui.hiddenEmitterIndices.forEach((oldIndex) => {
        if (oldIndex === startIndex) {
          newHiddenIndices.add(endIndex);
        } else if (startIndex < endIndex && oldIndex > startIndex && oldIndex <= endIndex) {
          newHiddenIndices.add(oldIndex - 1);
        } else if (startIndex > endIndex && oldIndex >= endIndex && oldIndex < startIndex) {
          newHiddenIndices.add(oldIndex + 1);
        } else {
          newHiddenIndices.add(oldIndex);
        }
      });

      return {
        config: { ...state.config, emitters },
        ui: {
          ...state.ui,
          selectedEmitterIndex: endIndex,
          hiddenEmitterIndices: newHiddenIndices,
          hasUnsavedChanges: true,
        },
      };
    });
  },

  toggleEmitterVisibility: (index: number) => {
    set((state) => {
      const newHiddenIndices = new Set(state.ui.hiddenEmitterIndices);
      if (newHiddenIndices.has(index)) {
        newHiddenIndices.delete(index);
      } else {
        newHiddenIndices.add(index);
      }
      return {
        ui: { ...state.ui, hiddenEmitterIndices: newHiddenIndices },
      };
    });
  },

  renameEmitter: (index: number, name: string) => {
    set((state) => {
      const emitters = [...state.config.emitters];
      const emitter = emitters[index];
      if (!emitter) return state;

      emitters[index] = { ...emitter, name };
      return {
        config: { ...state.config, emitters },
        ui: { ...state.ui, hasUnsavedChanges: true },
      };
    });
  },

  // Behavior actions
  addBehavior: (emitterIndex: number, behavior: BehaviorConfig) => {
    set((state) => {
      const emitters = [...state.config.emitters];
      const currentEmitter = emitters[emitterIndex];
      if (!currentEmitter) return state;

      const emitter = { ...currentEmitter };
      emitter.particle = {
        ...emitter.particle,
        behaviors: [...(emitter.particle.behaviors || []), behavior],
      };
      emitters[emitterIndex] = emitter;

      return {
        config: { ...state.config, emitters },
        ui: { ...state.ui, hasUnsavedChanges: true },
      };
    });
  },

  updateBehavior: (emitterIndex: number, behaviorIndex: number, behavior: BehaviorConfig) => {
    set((state) => {
      const emitters = [...state.config.emitters];
      const currentEmitter = emitters[emitterIndex];
      if (!currentEmitter) return state;

      const emitter = { ...currentEmitter };
      const behaviors = [...(emitter.particle.behaviors || [])];
      behaviors[behaviorIndex] = behavior;
      emitter.particle = { ...emitter.particle, behaviors };
      emitters[emitterIndex] = emitter;

      return {
        config: { ...state.config, emitters },
        ui: { ...state.ui, hasUnsavedChanges: true },
      };
    });
  },

  removeBehavior: (emitterIndex: number, behaviorIndex: number) => {
    set((state) => {
      const emitters = [...state.config.emitters];
      const currentEmitter = emitters[emitterIndex];
      if (!currentEmitter) return state;

      const emitter = { ...currentEmitter };
      const behaviors = (emitter.particle.behaviors || []).filter(
        (_, i) => i !== behaviorIndex
      );
      emitter.particle = { ...emitter.particle, behaviors };
      emitters[emitterIndex] = emitter;

      return {
        config: { ...state.config, emitters },
        ui: {
          ...state.ui,
          selectedBehaviorIndex: null,
          hasUnsavedChanges: true,
        },
      };
    });
  },

  // Asset actions
  addTexture: async (texture: TextureAsset) => {
    try {
      await assetDB.saveTexture(texture);
      set((state) => {
        const textures = new Map(state.assets.textures);
        textures.set(texture.id, texture);
        return {
          assets: { ...state.assets, textures },
          ui: { ...state.ui, hasUnsavedChanges: true },
        };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`Failed to save texture: ${msg}`);
    }
  },

  removeTexture: async (id: string) => {
    try {
      await assetDB.deleteTexture(id);
      set((state) => {
        const textures = new Map(state.assets.textures);
        textures.delete(id);
        return {
          assets: { ...state.assets, textures },
          ui: { ...state.ui, hasUnsavedChanges: true },
        };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`Failed to delete texture: ${msg}`);
    }
  },

  addSequence: async (sequence: SequenceAsset) => {
    try {
      await assetDB.saveSequence(sequence);
      set((state) => {
        const sequences = new Map(state.assets.sequences);
        sequences.set(sequence.id, sequence);
        return {
          assets: { ...state.assets, sequences },
          ui: { ...state.ui, hasUnsavedChanges: true },
        };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`Failed to save sequence: ${msg}`);
    }
  },

  removeSequence: async (id: string) => {
    try {
      await assetDB.deleteSequence(id);
      set((state) => {
        const sequences = new Map(state.assets.sequences);
        sequences.delete(id);
        return {
          assets: { ...state.assets, sequences },
          ui: { ...state.ui, hasUnsavedChanges: true },
        };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`Failed to delete sequence: ${msg}`);
    }
  },

  // Selection actions
  selectEmitter: (index: number | null) => {
    set((state) => ({
      ui: {
        ...state.ui,
        selectedEmitterIndex: index,
        selectedBehaviorIndex: null,
      },
    }));
  },

  selectBehavior: (index: number | null) => {
    set((state) => ({
      ui: { ...state.ui, selectedBehaviorIndex: index },
    }));
  },

  // Preview actions
  setPreviewState: (previewState: 'playing' | 'paused' | 'stopped') => {
    set((state) => ({
      ui: { ...state.ui, previewState },
    }));
  },

  setShowDebugMetrics: (showDebugMetrics: boolean) => {
    set((state) => ({
      ui: { ...state.ui, showDebugMetrics },
    }));
  },

  setBackgroundColor: (backgroundColor: number) => {
    set((state) => ({
      ui: { ...state.ui, backgroundColor },
    }));
  },

  setShowGrid: (showGrid: boolean) => {
    set((state) => ({
      ui: { ...state.ui, showGrid },
    }));
  },

  setGridSize: (gridSize: number) => {
    set((state) => ({
      ui: { ...state.ui, gridSize },
    }));
  },

  setZoom: (zoom: number) => {
    set((state) => ({
      ui: { ...state.ui, zoom },
    }));
  },

  setCanvasDimensions: (canvasWidth: number, canvasHeight: number) => {
    set((state) => {
      const oldW = state.ui.canvasWidth;
      const oldH = state.ui.canvasHeight;
      const emitters = recentreEmittersOnResize(
        state.config.emitters,
        oldW,
        oldH,
        canvasWidth,
        canvasHeight,
      );
      return {
        config: emitters !== state.config.emitters
          ? { ...state.config, emitters }
          : state.config,
        ui: { ...state.ui, canvasWidth, canvasHeight },
      };
    });
  },

  setTimeScale: (timeScale: number) => {
    const normalizedTimeScale = Number.isFinite(timeScale)
      ? Math.min(MAX_TIME_SCALE, Math.max(MIN_TIME_SCALE, timeScale))
      : 1;

    set((state) => ({
      ui: { ...state.ui, timeScale: normalizedTimeScale },
    }));
  },

  // Layout actions
  setLeftPaneWidth: (width: number) => {
    set((state) => {
      const layout = { ...state.layout, leftPaneWidth: Math.max(PANE_MIN_WIDTH, width), leftPaneLastWidth: Math.max(PANE_MIN_WIDTH, width) };
      debouncedPersistLayout(layout);
      return { layout };
    });
  },

  setRightPaneWidth: (width: number) => {
    set((state) => {
      const layout = { ...state.layout, rightPaneWidth: Math.max(PANE_MIN_WIDTH, width), rightPaneLastWidth: Math.max(PANE_MIN_WIDTH, width) };
      debouncedPersistLayout(layout);
      return { layout };
    });
  },

  toggleLeftPane: () => {
    set((state) => {
      const layout = {
        ...state.layout,
        leftPaneCollapsed: !state.layout.leftPaneCollapsed,
      };
      persistLayout(layout);
      return { layout };
    });
  },

  toggleRightPane: () => {
    set((state) => {
      const layout = {
        ...state.layout,
        rightPaneCollapsed: !state.layout.rightPaneCollapsed,
      };
      persistLayout(layout);
      return { layout };
    });
  },

  // Inspector
  setInspectorSearch: (inspectorSearch: string) => {
    set((state) => ({
      ui: { ...state.ui, inspectorSearch },
    }));
  },

  // Persistence
  markUnsaved: () => {
    set((state) => ({
      ui: { ...state.ui, hasUnsavedChanges: true },
    }));
  },

  markSaved: () => {
    set((state) => ({
      ui: { ...state.ui, hasUnsavedChanges: false },
    }));
  },

  // Import/Export
  loadConfig: (config: EditorConfig, assets: AssetState) => {
    const { canvasWidth, canvasHeight } = get().ui;
    const defaults = createDefaultUIState();

    // Recentre emitters from the 800×600 authoring canvas to the actual
    // canvas size so loaded examples / imports appear centred immediately.
    const emitters = recentreEmittersOnResize(
      config.emitters,
      defaults.canvasWidth,
      defaults.canvasHeight,
      canvasWidth,
      canvasHeight,
    );

    set({
      config: { ...config, emitters },
      assets,
      ui: {
        ...defaults,
        canvasWidth,
        canvasHeight,
        selectedEmitterIndex: config.emitters.length > 0 ? 0 : null,
      },
    });
  },

  getExportData: () => {
    const state = get();
    return {
      config: state.config,
      assets: state.assets,
    };
  },
}));
