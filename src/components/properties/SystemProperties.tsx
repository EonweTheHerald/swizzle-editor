import { useEditorStore } from '@/store/editorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';

interface SystemPropertiesProps {
  filter?: string;
}

const FIELD_LABELS = ['Max Particles', 'Auto Start', 'Debug Metrics'];

function matches(label: string, filter: string): boolean {
  if (!filter) return true;
  return label.toLowerCase().includes(filter.toLowerCase());
}

export function SystemProperties({ filter = '' }: SystemPropertiesProps) {
  const { config, ui, setMaxParticles, setAutoStart, setShowDebugMetrics } = useEditorStore();

  const visible = FIELD_LABELS.filter((label) => matches(label, filter));
  if (visible.length === 0) {
    return (
      <p className="text-[var(--text-xs)] text-[var(--text-dimmed)] py-2">
        No matching properties
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {matches('Max Particles', filter) && (
        <div className="prop-row">
          <Label htmlFor="max-particles" className="prop-label">
            Max Particles
          </Label>
          <Input
            id="max-particles"
            type="number"
            min="1"
            max="10000"
            value={config.system.maxParticles}
            onChange={(e) => setMaxParticles(parseInt(e.target.value) || 1000)}
          />
        </div>
      )}

      {matches('Auto Start', filter) && (
        <div className="prop-row">
          <Label htmlFor="auto-start" className="prop-label">
            Auto Start
          </Label>
          <Toggle
            checked={config.system.autoStart}
            onCheckedChange={setAutoStart}
          />
        </div>
      )}

      {matches('Debug Metrics', filter) && (
        <div className="prop-row">
          <Label htmlFor="debug-metrics" className="prop-label">
            Debug Metrics
          </Label>
          <Toggle
            checked={ui.showDebugMetrics}
            onCheckedChange={setShowDebugMetrics}
          />
        </div>
      )}
    </div>
  );
}
