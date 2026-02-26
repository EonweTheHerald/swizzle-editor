import { IconButton } from '@/components/ui/icon-button';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/store/editorStore';
import {
  Download, Upload, FilePlus, Play, Pause, Square,
  Undo2, Redo2, PanelLeftClose, PanelRightClose,
  RotateCcw,
} from 'lucide-react';
import { editorConfigToYAML, yamlToEditorConfig } from '@/utils/configTransform';
import { downloadFile } from '@/lib/utils';
import { toast } from 'sonner';

export function Header() {
  const { ui, setPreviewState, setTimeScale, layout, toggleLeftPane, toggleRightPane } = useEditorStore();
  const { previewState, hasUnsavedChanges, timeScale } = ui;
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const historyLength = useEditorStore((s) => s.history.length);
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex + 2 < historyLength;

  const handleNew = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Create new effect?')) return;
    }
    useEditorStore.getState().resetToDefault();
  };

  const handleExport = () => {
    const { config } = useEditorStore.getState();
    const yaml = editorConfigToYAML(config);
    const blob = new Blob([yaml], { type: 'text/yaml' });
    downloadFile(blob, 'particle-effect.yaml');
    useEditorStore.getState().markSaved();
    toast.success('Configuration exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml,.yml,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const config = yamlToEditorConfig(text);
        useEditorStore.getState().loadConfig(config, {
          textures: new Map(),
          sequences: new Map(),
        });
        useEditorStore.getState().setPreviewState('playing');
        toast.success(`Imported "${file.name}"`);
      } catch (err) {
        toast.error('Failed to import', {
          description: err instanceof Error ? err.message : 'Invalid file',
        });
      }
    };
    input.click();
  };

  const togglePlayback = () => {
    if (previewState === 'playing') {
      setPreviewState('paused');
    } else {
      setPreviewState('playing');
    }
  };

  const stopPlayback = () => {
    setPreviewState('stopped');
  };

  const handleUndo = () => useEditorStore.getState().undo();
  const handleRedo = () => useEditorStore.getState().redo();

  const timeScales = [0.25, 0.5, 1, 2];

  return (
    <header
      className="flex items-center gap-1 px-2 bg-[var(--surface)] border-b border-[var(--border)] select-none"
      style={{ height: 'var(--header-height)' }}
    >
      {/* Left: Pane toggle + brand */}
      <div className="flex items-center gap-1 mr-2">
        <IconButton
          onClick={toggleLeftPane}
          title={layout.leftPaneCollapsed ? 'Show left panel' : 'Hide left panel'}
          variant={layout.leftPaneCollapsed ? 'active' : 'default'}
          size="sm"
        >
          <PanelLeftClose size={14} />
        </IconButton>

        <span className="text-[var(--text)] font-semibold text-[var(--text-sm)] tracking-wide ml-1">
          Swizzle
        </span>

        {hasUnsavedChanges && (
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[var(--warning)]" title="Unsaved changes" />
        )}
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* File operations */}
      <div className="flex items-center gap-0.5">
        <IconButton onClick={handleNew} title="New (Ctrl+N)" size="sm">
          <FilePlus size={14} />
        </IconButton>
        <IconButton onClick={handleImport} title="Import" size="sm">
          <Upload size={14} />
        </IconButton>
        <IconButton onClick={handleExport} title="Export" size="sm">
          <Download size={14} />
        </IconButton>
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <IconButton
          onClick={handleUndo}
          title="Undo (Ctrl+Z)"
          size="sm"
          disabled={!canUndo}
        >
          <Undo2 size={14} />
        </IconButton>
        <IconButton
          onClick={handleRedo}
          title="Redo (Ctrl+Shift+Z)"
          size="sm"
          disabled={!canRedo}
        >
          <Redo2 size={14} />
        </IconButton>
      </div>

      {/* Center: Playback controls */}
      <div className="flex-1 flex items-center justify-center gap-1">
        <IconButton
          onClick={() => { setPreviewState('stopped'); setTimeout(() => setPreviewState('playing'), 50); }}
          title="Restart"
          size="sm"
        >
          <RotateCcw size={14} />
        </IconButton>
        <IconButton
          onClick={togglePlayback}
          title={previewState === 'playing' ? 'Pause (Space)' : 'Play (Space)'}
          variant={previewState === 'playing' ? 'active' : 'default'}
          size="sm"
        >
          {previewState === 'playing' ? <Pause size={14} /> : <Play size={14} />}
        </IconButton>
        <IconButton
          onClick={stopPlayback}
          title="Stop"
          size="sm"
          disabled={previewState === 'stopped'}
        >
          <Square size={12} />
        </IconButton>

        <Separator orientation="vertical" className="h-4 mx-1" />

        {/* Time scale buttons */}
        <div className="flex items-center gap-0.5">
          {timeScales.map((s) => (
            <button
              key={s}
              onClick={() => setTimeScale(s)}
              className={`px-1.5 h-5 text-[10px] font-mono rounded-[var(--radius-xs)] transition-colors ${
                timeScale === s
                  ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                  : 'text-[var(--text-dimmed)] hover:text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
              }`}
              title={`Time scale: ${s}x`}
            >
              {s}x
            </button>
          ))}
        </div>

        <span className="ml-2 text-[10px] font-mono text-[var(--text-dimmed)] inline-block min-w-[48px] text-center">
          {previewState === 'playing' ? 'PLAYING' : previewState === 'paused' ? 'PAUSED' : 'STOPPED'}
        </span>
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Right: panel toggle */}
      <IconButton
        onClick={toggleRightPane}
        title={layout.rightPaneCollapsed ? 'Show right panel' : 'Hide right panel'}
        variant={layout.rightPaneCollapsed ? 'active' : 'default'}
        size="sm"
      >
        <PanelRightClose size={14} />
      </IconButton>
    </header>
  );
}
