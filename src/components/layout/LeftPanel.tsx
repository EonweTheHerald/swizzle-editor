import * as Tabs from '@radix-ui/react-tabs';
import { LayerList } from '../layers/LayerList';
import { AssetLibrary } from '../assets/AssetLibrary';
import { ExamplesGallery } from '../examples/ExamplesGallery';
import { useEditorStore } from '@/store/editorStore';
import { useResizable } from '@/hooks/useResizable';

const TAB_TRIGGER =
  'flex-1 px-2 py-1.5 text-[var(--text-xs)] font-medium text-[var(--text-muted)] transition-colors ' +
  'hover:text-[var(--text)] hover:bg-[var(--surface-2)] ' +
  'data-[state=active]:text-[var(--text-strong)] data-[state=active]:bg-[var(--surface-2)] ' +
  'data-[state=active]:shadow-[inset_0_-2px_0_0_var(--accent)] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)]';

export function LeftPanel() {
  const { layout, setLeftPaneWidth } = useEditorStore();
  const { leftPaneWidth, leftPaneCollapsed } = layout;

  const { handleMouseDown } = useResizable({
    direction: 'left',
    currentWidth: leftPaneWidth,
    minWidth: 180,
    maxWidth: 400,
    onResize: setLeftPaneWidth,
  });

  if (leftPaneCollapsed) return null;

  return (
    <>
      <div
        className="flex flex-col bg-[var(--surface)] border-r border-[var(--border)] min-h-0"
        style={{ width: leftPaneWidth, flexShrink: 0 }}
      >
        <Tabs.Root defaultValue="layers" className="flex-1 flex flex-col min-h-0">
          <Tabs.List className="flex border-b border-[var(--border)] shrink-0">
            <Tabs.Trigger value="layers" className={TAB_TRIGGER}>
              Layers
            </Tabs.Trigger>
            <Tabs.Trigger value="assets" className={TAB_TRIGGER}>
              Assets
            </Tabs.Trigger>
            <Tabs.Trigger value="examples" className={TAB_TRIGGER}>
              Examples
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="layers" className="flex-1 overflow-auto p-3">
            <LayerList />
          </Tabs.Content>

          <Tabs.Content value="assets" className="flex-1 overflow-auto p-3">
            <AssetLibrary />
          </Tabs.Content>

          <Tabs.Content value="examples" className="flex-1 overflow-auto p-3">
            <ExamplesGallery />
          </Tabs.Content>
        </Tabs.Root>
      </div>

      {/* Resize handle */}
      <div className="resize-handle" onMouseDown={handleMouseDown} />
    </>
  );
}
