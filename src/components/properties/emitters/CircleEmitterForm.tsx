import type { EmitterConfig } from '@eonwetheherald/swizzle';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckboxField } from '../fields/CheckboxField';
import { asEmitterData } from '@/types/emitterTypes';

interface CircleEmitterFormProps {
  emitter: EmitterConfig;
  onChange: (updates: Partial<EmitterConfig>) => void;
}

export function CircleEmitterForm({ emitter, onChange }: CircleEmitterFormProps) {
  const data = asEmitterData(emitter, 'circle');

  return (
    <div className="space-y-3">
      <div className="field-group">
        <Label className="field-label">Radius</Label>
        <Input
          type="number"
          min={1}
          value={data.radius ?? 100}
          onChange={(e) => onChange({ radius: parseFloat(e.target.value) || 1 })}
          className="h-8 text-sm"
        />
        <p className="field-description">Outer radius in pixels</p>
      </div>

      <div className="field-group">
        <Label className="field-label">Inner Radius</Label>
        <Input
          type="number"
          min={0}
          value={data.innerRadius ?? 0}
          onChange={(e) => onChange({ innerRadius: parseFloat(e.target.value) || 0 })}
          className="h-8 text-sm"
        />
        <p className="field-description">0 = filled circle; &gt;0 = ring/donut</p>
      </div>

      <CheckboxField
        id="circle-edge-emit"
        label="Edge Emit"
        checked={data.edgeEmit ?? false}
        onChange={(checked) => onChange({ edgeEmit: checked })}
        description="Emit only from the circumference edge"
      />
    </div>
  );
}
