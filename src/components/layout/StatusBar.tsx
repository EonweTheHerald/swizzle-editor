import { useEditorStore } from '@/store/editorStore';

export function StatusBar() {
  const { ui, config } = useEditorStore();
  const { previewState, timeScale, canvasWidth, canvasHeight, selectedEmitterIndex } = ui;

  const selectedEmitter =
    selectedEmitterIndex !== null ? config.emitters[selectedEmitterIndex] : null;

  const totalParticles = config.system.maxParticles;

  return (
    <footer className="status-bar">
      {/* Playback state */}
      <div className="status-bar-item">
        <span className={previewState === 'playing' ? 'status-bar-accent' : ''}>
          {previewState === 'playing' ? '▶' : previewState === 'paused' ? '⏸' : '⏹'}
        </span>
        <span>{previewState.charAt(0).toUpperCase() + previewState.slice(1)}</span>
        {timeScale !== 1 && (
          <span className="text-[var(--text-dimmed)]">({timeScale}x)</span>
        )}
      </div>

      <div className="status-bar-separator" />

      {/* Resolution */}
      <div className="status-bar-item font-mono">
        {canvasWidth}×{canvasHeight}
      </div>

      <div className="status-bar-separator" />

      {/* Max particles */}
      <div className="status-bar-item">
        Max: <span className="font-mono">{totalParticles}</span>
      </div>

      <div className="status-bar-separator" />

      {/* Emitters count */}
      <div className="status-bar-item">
        Emitters: <span className="font-mono">{config.emitters.length}</span>
      </div>

      {selectedEmitter && (
        <>
          <div className="status-bar-separator" />
          <div className="status-bar-item status-bar-accent">
            {selectedEmitter.type}
            {selectedEmitter.name ? ` — ${selectedEmitter.name}` : ''}
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Unsaved indicator */}
      {ui.hasUnsavedChanges && (
        <div className="status-bar-item">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
          <span>Unsaved</span>
        </div>
      )}
    </footer>
  );
}
