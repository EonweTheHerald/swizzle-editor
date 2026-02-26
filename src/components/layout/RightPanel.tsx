import { PropertyPanel } from '../properties/PropertyPanel';
import { useEditorStore } from '@/store/editorStore';
import { useResizable } from '@/hooks/useResizable';

export function RightPanel() {
  const { layout, setRightPaneWidth } = useEditorStore();
  const { rightPaneWidth, rightPaneCollapsed } = layout;

  const { handleMouseDown } = useResizable({
    direction: 'right',
    currentWidth: rightPaneWidth,
    minWidth: 220,
    maxWidth: 500,
    onResize: setRightPaneWidth,
  });

  if (rightPaneCollapsed) return null;

  return (
    <>
      {/* Resize handle */}
      <div className="resize-handle" onMouseDown={handleMouseDown} />

      <div
        className="flex flex-col bg-[var(--surface)] border-l border-[var(--border)] overflow-hidden min-h-0"
        style={{ width: rightPaneWidth, flexShrink: 0 }}
      >
        <PropertyPanel />
      </div>
    </>
  );
}
