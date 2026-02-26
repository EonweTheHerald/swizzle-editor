import type { EmitterConfig } from '@eonwetheherald/swizzle';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { asEmitterData } from '@/types/emitterTypes';

interface AreaEmitterFormProps {
  emitter: EmitterConfig;
  onChange: (updates: Partial<EmitterConfig>) => void;
}

export function AreaEmitterForm({ emitter, onChange }: AreaEmitterFormProps) {
  const data = asEmitterData(emitter, 'area');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="field-group">
          <Label className="field-label">Width</Label>
          <Input
            type="number"
            min={1}
            value={data.width ?? 200}
            onChange={(e) => onChange({ width: parseFloat(e.target.value) || 1 })}
            className="h-8 text-sm"
          />
        </div>
        <div className="field-group">
          <Label className="field-label">Height</Label>
          <Input
            type="number"
            min={1}
            value={data.height ?? 200}
            onChange={(e) => onChange({ height: parseFloat(e.target.value) || 1 })}
            className="h-8 text-sm"
          />
        </div>
      </div>
      <p className="field-description">Rectangular spawn area centered on emitter position</p>
    </div>
  );
}
