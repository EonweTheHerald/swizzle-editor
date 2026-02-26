import type { EmitterConfig } from '@eonwetheherald/swizzle';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckboxField } from '../fields/CheckboxField';
import { asEmitterData } from '@/types/emitterTypes';

interface TimedEmitterFormProps {
  emitter: EmitterConfig;
  onChange: (updates: Partial<EmitterConfig>) => void;
}

export function TimedEmitterForm({ emitter, onChange }: TimedEmitterFormProps) {
  const data = asEmitterData(emitter, 'timed');

  return (
    <div className="space-y-3">
      <div className="field-group">
        <Label className="field-label">Emitter Lifetime (s)</Label>
        <Input
          type="number"
          min={0.1}
          step={0.5}
          value={data.emitterLifetime ?? 5.0}
          onChange={(e) => onChange({ emitterLifetime: parseFloat(e.target.value) || 0.1 })}
          className="h-8 text-sm"
        />
        <p className="field-description">How long the emitter runs before stopping</p>
      </div>
      <CheckboxField
        id="timed-fade-out"
        label="Fade Out"
        checked={data.fadeOut ?? false}
        onChange={(checked) => onChange({ fadeOut: checked })}
        description="Gradually reduce emission rate as the lifetime ends"
      />
    </div>
  );
}
