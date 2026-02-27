/**
 * useKeyboardShortcuts - Global keyboard shortcuts
 */

import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { editorConfigToYAML } from '@/utils/configTransform';
import { downloadFile } from '@/lib/utils';
import { toast } from 'sonner';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { ui, removeEmitter, duplicateEmitter, setPreviewState } = useEditorStore.getState();
      const { selectedEmitterIndex, previewState } = ui;

      // Ignore if typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Delete / Backspace - Remove selected layer
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEmitterIndex !== null) {
        e.preventDefault();
        removeEmitter(selectedEmitterIndex);
        toast.success('Layer deleted');
      }

      // Ctrl+D - Duplicate selected layer
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedEmitterIndex !== null) {
        e.preventDefault();
        duplicateEmitter(selectedEmitterIndex);
        toast.success('Layer duplicated');
      }

      // Space - Toggle playback
      if (e.key === ' ') {
        e.preventDefault();
        if (previewState === 'playing') {
          setPreviewState('paused');
        } else {
          setPreviewState('playing');
        }
      }

      // Ctrl+Z - Undo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        const state = useEditorStore.getState();
        if (state.canUndo()) {
          state.undo();
        }
      }

      // Ctrl+Shift+Z / Ctrl+Y - Redo
      if (
        (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) ||
        (e.key === 'y' && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault();
        const state = useEditorStore.getState();
        if (state.canRedo()) {
          state.redo();
        }
      }

      // Escape - Deselect
      if (e.key === 'Escape' && selectedEmitterIndex !== null) {
        e.preventDefault();
        useEditorStore.getState().selectEmitter(null);
      }

      // Ctrl+S - Export YAML
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        try {
          const { config } = useEditorStore.getState();
          const yaml = editorConfigToYAML(config);
          const blob = new Blob([yaml], { type: 'text/yaml' });
          downloadFile(blob, 'particle-effect.yaml');
          useEditorStore.getState().markSaved();
          toast.success('Configuration exported');
        } catch (err) {
          toast.error('Failed to export', {
            description: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
