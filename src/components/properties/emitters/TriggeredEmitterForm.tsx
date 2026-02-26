import type { EmitterConfig } from '@eonwetheherald/swizzle';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { asEmitterData } from '@/types/emitterTypes';

interface TriggeredEmitterFormProps {
  emitter: EmitterConfig;
  onChange: (updates: Partial<EmitterConfig>) => void;
}

export function TriggeredEmitterForm({ emitter, onChange }: TriggeredEmitterFormProps) {
  const data = asEmitterData(emitter, 'triggered');

  return (
    <div className="space-y-3">
      <div className="field-group">
        <Label className="field-label">Particles Per Trigger</Label>
        <Input
          type="number"
          min={1}
          value={data.particlesPerTrigger ?? 10}
          onChange={(e) => onChange({ particlesPerTrigger: parseInt(e.target.value) || 1 })}
          className="h-8 text-sm"
        />
        <p className="field-description">Number of particles spawned each time this emitter is triggered</p>
      </div>
      <div className="text-xs text-[var(--text-muted)] p-2 bg-[var(--surface-2)] rounded">
        Triggered emitters spawn particles on demand via the API — call{' '}
        <code className="font-mono">emitter.trigger()</code> programmatically to fire a burst.
      </div>
    </div>
  );
}
