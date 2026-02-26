import { useEditorStore } from '@/store/editorStore';
import { Separator } from '@/components/ui/separator';
import { SearchInput } from '@/components/ui/search-input';
import { SystemProperties } from './SystemProperties';
import { EmitterProperties } from './EmitterProperties';
import { Settings2, Layers } from 'lucide-react';

export function PropertyPanel() {
  const { ui, config, setInspectorSearch } = useEditorStore();
  const { selectedEmitterIndex, inspectorSearch } = ui;

  const selectedEmitter =
    selectedEmitterIndex !== null ? config.emitters[selectedEmitterIndex] : null;

  return (
    <div className="panel-container">
      {/* Inspector header + search */}
      <div className="px-3 py-2 border-b border-[var(--border)] space-y-2 shrink-0">
        <div className="flex items-center gap-2">
          <Settings2 size={13} className="text-[var(--text-dimmed)]" />
          <span className="text-[var(--text-sm)] font-semibold text-[var(--text-strong)]">
            Inspector
          </span>
        </div>
        <SearchInput
          value={inspectorSearch}
          onChange={setInspectorSearch}
          placeholder="Filter properties..."
        />
      </div>

      <div className="panel-content">
        {/* System Properties (always visible) */}
        <div className="panel-section">
          <h3 className="panel-section-title">System</h3>
          <SystemProperties filter={inspectorSearch} />
        </div>

        <Separator className="my-3" />

        {/* Emitter Properties (when selected) */}
        {selectedEmitter ? (
          <div className="panel-section">
            <h3 className="panel-section-title">
              <span className="flex items-center gap-1.5">
                <Layers size={12} className="text-[var(--text-dimmed)]" />
                {(selectedEmitter.name as string) || `${selectedEmitter.type} Emitter`}
              </span>
            </h3>
            <EmitterProperties emitter={selectedEmitter} index={selectedEmitterIndex!} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Layers size={24} className="text-[var(--text-dimmed)] mb-2" />
            <span className="text-[var(--text-sm)] text-[var(--text-muted)]">
              No emitter selected
            </span>
            <span className="text-[var(--text-xs)] text-[var(--text-dimmed)] mt-1">
              Select a layer to configure its properties
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
