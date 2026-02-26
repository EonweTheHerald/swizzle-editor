import type { BehaviorConfig, EmitterConfig } from '@eonwetheherald/swizzle';

/**
 * Asset types for the editor
 */
export interface TextureAsset {
  id: string;
  name: string;
  file: File;
  dataURL: string;
  width: number;
  height: number;
  createdAt: number;
}

export interface SequenceAsset {
  id: string;
  name: string;
  pattern: string;
  frames: TextureAsset[];
  createdAt: number;
}

/**
 * Editor configuration that mirrors YAML structure
 */
export interface EditorConfig {
  system: {
    maxParticles: number;
    autoStart: boolean;
  };
  emitters: EmitterConfig[];
}

/**
 * UI layout state — pane sizes, collapsed flags, etc.
 */
export interface LayoutState {
  leftPaneWidth: number;
  rightPaneWidth: number;
  leftPaneCollapsed: boolean;
  rightPaneCollapsed: boolean;
  leftPaneLastWidth: number;
  rightPaneLastWidth: number;
}

/**
 * Selection state
 */
export interface SelectionState {
  selectedEmitterIndex: number | null;
  selectedBehaviorIndex: number | null;
}

/**
 * UI state
 */
export interface UIState {
  selectedEmitterIndex: number | null;
  selectedBehaviorIndex: number | null;
  previewState: 'playing' | 'paused' | 'stopped';
  showDebugMetrics: boolean;
  timeScale: number;
  backgroundColor: number;
  hasUnsavedChanges: boolean;
  showGrid: boolean;
  gridSize: number;
  zoom: number;
  hiddenEmitterIndices: Set<number>;
  canvasWidth: number;
  canvasHeight: number;
  inspectorSearch: string;
}

/**
 * Asset management state
 */
export interface AssetState {
  textures: Map<string, TextureAsset>;
  sequences: Map<string, SequenceAsset>;
}

/**
 * Undo/redo history entry
 */
export interface HistoryEntry {
  config: EditorConfig;
  selection: SelectionState;
  label: string;
  timestamp: number;
}

/**
 * Complete editor state
 */
export interface EditorState {
  config: EditorConfig;
  assets: AssetState;
  ui: UIState;
  layout: LayoutState;

  // History
  history: HistoryEntry[];
  historyIndex: number;

  // System actions
  resetToDefault: () => void;
  setMaxParticles: (max: number) => void;
  setAutoStart: (autoStart: boolean) => void;

  // Emitter actions
  addEmitter: (emitter: EmitterConfig) => void;
  updateEmitter: (index: number, emitter: Partial<EmitterConfig>) => void;
  removeEmitter: (index: number) => void;
  duplicateEmitter: (index: number) => void;
  reorderEmitters: (startIndex: number, endIndex: number) => void;
  toggleEmitterVisibility: (index: number) => void;
  renameEmitter: (index: number, name: string) => void;

  // Behavior actions
  addBehavior: (emitterIndex: number, behavior: BehaviorConfig) => void;
  updateBehavior: (emitterIndex: number, behaviorIndex: number, behavior: BehaviorConfig) => void;
  removeBehavior: (emitterIndex: number, behaviorIndex: number) => void;

  // Asset actions
  addTexture: (texture: TextureAsset) => Promise<void>;
  removeTexture: (id: string) => Promise<void>;
  addSequence: (sequence: SequenceAsset) => Promise<void>;
  removeSequence: (id: string) => Promise<void>;

  // Selection actions
  selectEmitter: (index: number | null) => void;
  selectBehavior: (index: number | null) => void;

  // Preview actions
  setPreviewState: (state: 'playing' | 'paused' | 'stopped') => void;
  setShowDebugMetrics: (show: boolean) => void;
  setBackgroundColor: (color: number) => void;
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  setZoom: (zoom: number) => void;
  setCanvasDimensions: (width: number, height: number) => void;
  setTimeScale: (scale: number) => void;

  // Layout actions
  setLeftPaneWidth: (width: number) => void;
  setRightPaneWidth: (width: number) => void;
  toggleLeftPane: () => void;
  toggleRightPane: () => void;

  // Inspector
  setInspectorSearch: (search: string) => void;

  // Persistence
  markUnsaved: () => void;
  markSaved: () => void;

  // Import/Export
  loadConfig: (config: EditorConfig, assets: AssetState) => void;
  getExportData: () => { config: EditorConfig; assets: AssetState };

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  pushHistory: (label: string) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

/**
 * Validation error types
 */
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
