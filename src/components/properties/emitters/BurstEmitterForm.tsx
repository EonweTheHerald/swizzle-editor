import type { EmitterConfig } from '@eonwetheherald/swizzle';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { asEmitterData } from '@/types/emitterTypes';

interface BurstEmitterFormProps {
  emitter: EmitterConfig;
  onChange: (updates: Partial<EmitterConfig>) => void;
}

export function BurstEmitterForm({ emitter, onChange }: BurstEmitterFormProps) {
  const data = asEmitterData(emitter, 'burst');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="field-group">
          <Label className="field-label">Burst Count</Label>
          <Input
            type="number"
            min={1}
            value={data.burstCount ?? 30}
            onChange={(e) => onChange({ burstCount: parseInt(e.target.value) || 1 })}
            className="h-8 text-sm"
          />
          <p className="field-description">Particles per burst</p>
        </div>
        <div className="field-group">
          <Label className="field-label">Burst Interval (s)</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={data.burstInterval ?? 1.0}
            onChange={(e) => onChange({ burstInterval: parseFloat(e.target.value) || 0 })}
            className="h-8 text-sm"
          />
          <p className="field-description">Time between bursts</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field-group">
          <Label className="field-label">Burst Limit</Label>
          <Input
            type="number"
            min={-1}
            value={data.burstLimit ?? -1}
            onChange={(e) => onChange({ burstLimit: parseInt(e.target.value) })}
            className="h-8 text-sm"
            placeholder="-1 infinite"
          />
          <p className="field-description">Max bursts (-1 = infinite)</p>
        </div>
        <div className="field-group">
          <Label className="field-label">Initial Delay (s)</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={data.initialDelay ?? 0}
            onChange={(e) => onChange({ initialDelay: parseFloat(e.target.value) || 0 })}
            className="h-8 text-sm"
          />
          <p className="field-description">Delay before first burst</p>
        </div>
      </div>
    </div>
  );
}
