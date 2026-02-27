/**
 * PreviewCanvas – PixiJS host for the Swizzle particle system.
 *
 * Lifecycle:
 *  1. One-time init: PixiApplication is created and the render ticker starts.
 *  2. ResizeObserver keeps the renderer dimensions in sync with the DOM.
 *  3. A debounced effect rebuilds the particle system whenever config/assets
 *     change.  A `cancelled` flag guards every async step so stale rebuilds
 *     caused by rapid config edits never race against each other.
 *  4. A separate effect drives play / pause / stop from the store.
 */

import { useEffect, useRef, useState } from 'react';
import { Application as PixiApplication, Graphics } from 'pixi.js';
import type { Container as PixiNativeContainer } from 'pixi.js';

import { useEditorStore } from '@/store/editorStore';
import type { AssetState } from '@/store/types';
import { editorConfigToYAML, validateEditorConfig } from '@/utils/configTransform';

import {
  ConfigLoader,
  ParticleRenderer,
  ParticleSystem,
  PixiGraphicsEngine,
  PixiTexture,
  registerDefaults,
} from '@eonwetheherald/swizzle';
import type { ITexture } from '@eonwetheherald/swizzle';

import { toast } from 'sonner';

interface DebugMetrics {
  activeEmitters: number;
  totalParticles: number;
  fps: number;
  memoryMb: number | null;
}

// Register built-in types once at module load time.
registerDefaults();

// How long to batch rapid config changes before triggering a rebuild.
const REBUILD_DEBOUNCE_MS = 150;
const MIN_TIME_SCALE = 0.1;
const MAX_TIME_SCALE = 4;

// ─── Module-level pure helpers ────────────────────────────────────────────────
//
// Keeping these outside the component avoids re-creation on every render and
// makes them trivially testable in isolation.

function getPixiNative(renderer: ParticleRenderer): PixiNativeContainer | null {
  return (renderer.container as unknown as { native?: PixiNativeContainer }).native ?? null;
}

function isTexture(value: unknown): value is ITexture {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<ITexture>;
  return (
    typeof candidate.width === 'number' &&
    typeof candidate.height === 'number' &&
    typeof candidate.source === 'string' &&
    typeof candidate.valid === 'boolean' &&
    typeof candidate.dispose === 'function'
  );
}

function attachContainer(renderer: ParticleRenderer, app: PixiApplication): void {
  const native = getPixiNative(renderer);
  if (native) app.stage.addChild(native);
}

function detachContainer(renderer: ParticleRenderer, app: PixiApplication): void {
  const native = getPixiNative(renderer);
  if (native) app.stage.removeChild(native);
}

function normalizeTimeScale(value: number | undefined): number {
  const numericValue = typeof value === 'number' && Number.isFinite(value) ? value : 1;
  return Math.min(MAX_TIME_SCALE, Math.max(MIN_TIME_SCALE, numericValue));
}

/**
 * Build the texture map that ConfigLoader expects.
 *
 * Priority:
 *   1. Textures explicitly uploaded by the user.
 *   2. The first uploaded texture promoted to the "default" slot.
 *   3. A programmatically generated 16 px white circle (visible on any
 *      background) used when the user has not uploaded anything yet.
 *
 * Texture.WHITE (1×1 px) is intentionally NOT used here because it produces
 * sprites that are invisible to the naked eye at default scale.
 */
async function buildTextureMap(
  assets: AssetState,
  engine: PixiGraphicsEngine,
  app: PixiApplication,
): Promise<Map<string, ITexture>> {
  const map = new Map<string, ITexture>();

  for (const [id, asset] of assets.textures) {
    try {
      const loaded = await engine.createTexture(asset.dataURL);
      if (!isTexture(loaded)) {
        throw new Error(`Invalid texture returned for ${asset.name}`);
      }

      const texture = loaded;
      map.set(asset.name, texture);
      map.set(id, texture);
      // Convenience: also register without file extension.
      map.set(asset.name.replace(/\.[^/.]+$/, ''), texture);
    } catch (err) {
      console.warn(`Failed to load texture "${asset.name}":`, err);
      toast.warning(`Failed to load texture: ${asset.name}`);
    }
  }

  // Always provide a built-in white circle as the "default" texture so users
  // can switch back to it after choosing an uploaded texture.
  {
    const gfx = new Graphics();
    gfx.circle(0, 0, 8);
    gfx.fill({ color: 0xffffff, alpha: 1 });
    const texture = app.renderer.generateTexture(gfx);
    gfx.destroy();
    map.set('default', new PixiTexture(texture));
  }

  return map;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PreviewCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PixiApplication | null>(null);
  const systemRef = useRef<ParticleSystem | null>(null);
  const rendererRef = useRef<ParticleRenderer | null>(null);
  // Ref mirrors store state so the ticker (a stable closure) always reads the
  // latest value without needing to be re-created on every state change.
  const previewStateRef = useRef<string>('stopped');
  const timeScaleRef = useRef<number>(1);
  const debugTickRef = useRef(0);
  const metricsTickRef = useRef(0);
  const fpsAccumulatorRef = useRef(0);
  const fpsFrameCountRef = useRef(0);

  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DebugMetrics>({
    activeEmitters: 0,
    totalParticles: 0,
    fps: 0,
    memoryMb: null,
  });

  const { config, assets, ui, setPreviewState, setCanvasDimensions } = useEditorStore();

  // Keep the ticker's refs in sync.
  useEffect(() => {
    previewStateRef.current = ui.previewState;
  }, [ui.previewState]);

  useEffect(() => {
    timeScaleRef.current = normalizeTimeScale(ui.timeScale);
    if (appRef.current) {
      appRef.current.ticker.speed = timeScaleRef.current;
    }
  }, [ui.timeScale]);

  // ── 1. One-time PixiJS app initialisation ──────────────────────────────────
  //
  // The app is a long-lived singleton bound to the component's DOM lifetime.
  // It must never be recreated in response to config changes; only destroyed
  // when the component unmounts.
  useEffect(() => {
    if (!canvasRef.current) return;

    let disposed = false;

    void (async () => {
      try {
        const el = canvasRef.current!;
        const width = el.clientWidth || 800;
        const height = el.clientHeight || 600;

        const app = new PixiApplication();
        await app.init({
          width,
          height,
          backgroundColor: ui.backgroundColor,
          antialias: true,
          resolution: window.devicePixelRatio,
          autoDensity: true,
        });

        if (disposed) {
          app.destroy(true);
          return;
        }

        // Expose for PixiJS DevTools — dev only.
        if (import.meta.env.DEV) {
          (globalThis as Record<string, unknown>).__PIXI_APP__ = app;
          (globalThis as Record<string, unknown>).__PIXI_STAGE__ = app.stage;
          (globalThis as Record<string, unknown>).__PIXI_RENDERER__ = app.renderer;
        }

        el.appendChild(app.canvas);
        appRef.current = app;
        app.ticker.speed = timeScaleRef.current;
        setCanvasDimensions(Math.round(width), Math.round(height));

        app.ticker.add(() => {
          // PixiJS 8.x exposes deltaMS; fall back to a 60 fps constant.
          const deltaMsRaw = (app.ticker as unknown as { deltaMS?: number }).deltaMS;
          const deltaMs = Number.isFinite(deltaMsRaw) && (deltaMsRaw ?? 0) > 0 ? (deltaMsRaw as number) : 16.667;
          const dt = deltaMs / 1000;

          if (systemRef.current && previewStateRef.current === 'playing') {
            systemRef.current.update(dt);
          }

          fpsAccumulatorRef.current += dt;
          fpsFrameCountRef.current += 1;

          const now = performance.now();
          if (now - metricsTickRef.current >= 500) {
            metricsTickRef.current = now;
            const sys = systemRef.current;
            const frames = fpsFrameCountRef.current;
            const elapsedSeconds = fpsAccumulatorRef.current;
            const sampledFps =
              elapsedSeconds > 0
                ? frames / elapsedSeconds
                : Number((app.ticker as unknown as { FPS?: number }).FPS) || 0;

            fpsAccumulatorRef.current = 0;
            fpsFrameCountRef.current = 0;

            const perf = performance as Performance & {
              memory?: {
                usedJSHeapSize?: number;
              };
            };
            const usedHeap = perf.memory?.usedJSHeapSize;
            const memoryMb = typeof usedHeap === 'number' ? usedHeap / (1024 * 1024) : null;

            setMetrics({
              activeEmitters: sys?.emitters.filter((emitter) => emitter.active).length ?? 0,
              totalParticles: sys?.particles.length ?? 0,
              fps: sampledFps,
              memoryMb,
            });
          }

          // PixiJS Application auto-renders at LOW priority after every tick —
          // no manual render() call needed here.  Adding one would cause two
          // full render passes per frame and waste ~50 % of the render budget.

          // Opt-in debug logging: set `__SWIZZLE_DEBUG__ = true` in the console.
          if ((globalThis as { __SWIZZLE_DEBUG__?: boolean }).__SWIZZLE_DEBUG__) {
            if (now - debugTickRef.current > 1000) {
              debugTickRef.current = now;
              const sys = systemRef.current;
              console.log('[Swizzle Debug]', {
                running: sys?.isRunning,
                particles: sys?.particles.length ?? 0,
                emitters: sys?.emitters.length ?? 0,
              });
            }
          }
        });
      } catch (err) {
        if (import.meta.env.DEV) console.error('Failed to initialise PixiJS:', err);
        setError('Failed to initialise preview canvas');
      }
    })().catch(() => undefined);

    return () => {
      disposed = true;
      if (import.meta.env.DEV) {
        delete (globalThis as Record<string, unknown>).__PIXI_APP__;
        delete (globalThis as Record<string, unknown>).__PIXI_STAGE__;
        delete (globalThis as Record<string, unknown>).__PIXI_RENDERER__;
      }
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []); // See comment above – intentionally empty.

  // ── 2. Resize handling ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.width === 0 || rect.height === 0) return;
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      setCanvasDimensions(w, h);
      appRef.current?.renderer.resize(w, h);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [setCanvasDimensions]);

  // ── 3. Background colour ───────────────────────────────────────────────────
  useEffect(() => {
    const renderer = appRef.current?.renderer;
    if (!renderer) return;
    renderer.background.color = ui.backgroundColor;
  }, [ui.backgroundColor]);

  // ── 4. Particle system rebuild (debounced) ─────────────────────────────────
  //
  // Pattern: setTimeout + cleanup ref.
  //   • Returning clearTimeout from the effect body cancels an in-flight timer
  //     when config changes again within REBUILD_DEBOUNCE_MS – no duplicate
  //     rebuilds from rapid edits.
  //   • The `cancelled` flag guards every async step so a stale rebuild that
  //     was already in-flight stops as soon as it regains control.
  //   • `setPreviewState` is a stable Zustand action (never changes identity)
  //     so including it in deps is correct and doesn't cause extra runs.
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      void (async () => {
      if (cancelled || !appRef.current) return;

      // Tear down the previous system before building the new one.
      if (systemRef.current) {
        systemRef.current.dispose();
        systemRef.current = null;
      }
      if (rendererRef.current) {
        detachContainer(rendererRef.current, appRef.current);
        rendererRef.current = null;
      }

      if (config.emitters.length === 0) {
        if (!cancelled) setError(null);
        return;
      }

      const validation = validateEditorConfig(config);
      if (!validation.valid) {
        if (!cancelled) {
          setError(`Invalid configuration: ${validation.errors.join(', ')}`);
          toast.error('Configuration validation failed');
        }
        return;
      }

      try {
        const app = appRef.current;
        const engine = new PixiGraphicsEngine(app);
        const textureMap = await buildTextureMap(assets, engine, app);
        if (cancelled) return;

        const renderer = new ParticleRenderer(engine);
        attachContainer(renderer, app);
        rendererRef.current = renderer;

        const yamlConfig = editorConfigToYAML(config);

        const system = await ConfigLoader.loadFromString(yamlConfig, renderer, engine, textureMap);
        if (cancelled) return;

        systemRef.current = system;
        if (import.meta.env.DEV) {
          (globalThis as Record<string, unknown>).__SWIZZLE_SYSTEM__ = system;
          (globalThis as Record<string, unknown>).__SWIZZLE_RENDERER__ = renderer;
        }

        const shouldPlay = config.system.autoStart || previewStateRef.current === 'playing';
        if (shouldPlay) {
          system.start();
          if (previewStateRef.current !== 'playing') {
            previewStateRef.current = 'playing';
            setPreviewState('playing');
          }
        }

        setError(null);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        if (import.meta.env.DEV) console.error('Failed to build particle system:', err);
        setError(`Failed to load system: ${msg}`);
        toast.error('Failed to create particle system');
      }
      })().catch(() => undefined);
    }, REBUILD_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [config, assets, setPreviewState]);

  // ── 5. Playback control ────────────────────────────────────────────────────
  useEffect(() => {
    const system = systemRef.current;
    if (!system) return;

    if (ui.previewState === 'stopped') {
      system.stop();
      // Clear particles to ensure a fresh restart when play is clicked again
      system.clear();
    } else if (ui.previewState === 'playing') {
      system.start();
    }
    // 'paused' intentionally left unhandled: the ticker simply stops calling
    // system.update() because previewStateRef is no longer 'playing'.
  }, [ui.previewState]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full relative canvas-container" ref={canvasRef}>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="border border-[var(--destructive)] bg-[var(--surface)] rounded-[var(--radius-md)] p-6 max-w-md shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2.5 h-2.5 bg-[var(--destructive)] rounded-full animate-pulse" />
              <p className="text-[var(--text-xs)] font-semibold text-[var(--destructive)] uppercase tracking-wide">
                Error
              </p>
            </div>
            <p className="text-[var(--text-sm)] text-[var(--text-muted)] font-mono">
              {error}
            </p>
          </div>
        </div>
      )}

      {config.emitters.length === 0 && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center border border-dashed border-[var(--border)] rounded-[var(--radius-md)] p-8">
            <p className="text-[var(--text-sm)] font-medium text-[var(--text-muted)] mb-1">
              No emitters configured
            </p>
            <p className="text-[var(--text-xs)] text-[var(--text-dimmed)]">
              Add a layer in the left panel to start
            </p>
          </div>
        </div>
      )}

      {ui.showDebugMetrics && (
        <section
          className="debug-metrics-overlay"
          aria-live="polite"
          aria-label="Debug performance metrics"
        >
          <div className="debug-metrics-title">Debug Metrics</div>
          <dl className="debug-metrics-grid">
            <div className="debug-metrics-row">
              <dt>Emitters Active</dt>
              <dd>{metrics.activeEmitters}</dd>
            </div>
            <div className="debug-metrics-row">
              <dt>Total Particles</dt>
              <dd>{metrics.totalParticles}</dd>
            </div>
            <div className="debug-metrics-row">
              <dt>Framerate</dt>
              <dd>{`${Math.round(metrics.fps)} fps`}</dd>
            </div>
            <div className="debug-metrics-row">
              <dt>Memory Usage</dt>
              <dd>{metrics.memoryMb === null ? 'N/A' : `${metrics.memoryMb.toFixed(1)} MB`}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
