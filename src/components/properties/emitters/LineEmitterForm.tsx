import type { EmitterConfig } from '@eonwetheherald/swizzle';
import { Vector2Input } from '../fields/Vector2Input';
import { SelectInput } from '../fields/SelectInput';
import { asEmitterData } from '@/types/emitterTypes';

interface LineEmitterFormProps {
  emitter: EmitterConfig;
  onChange: (updates: Partial<EmitterConfig>) => void;
}

const DISTRIBUTION_OPTIONS = [
  { value: 'uniform', label: 'Uniform' },
  { value: 'start', label: 'Toward Start' },
  { value: 'end', label: 'Toward End' },
  { value: 'center', label: 'Toward Center' },
];

export function LineEmitterForm({ emitter, onChange }: LineEmitterFormProps) {
  const data = asEmitterData(emitter, 'line');
  const start = data.start ?? { x: -100, y: 0 };
  const end = data.end ?? { x: 100, y: 0 };

  return (
    <div className="space-y-3">
      <Vector2Input
        label="Start Point"
        value={start}
        onChange={(v) => onChange({ start: v })}
        description="Line start (relative to emitter position)"
      />
      <Vector2Input
        label="End Point"
        value={end}
        onChange={(v) => onChange({ end: v })}
        description="Line end (relative to emitter position)"
      />
      <SelectInput
        label="Distribution"
        value={data.distribution ?? 'uniform'}
        onChange={(v) => onChange({ distribution: v as 'uniform' | 'start' | 'end' | 'center' })}
        options={DISTRIBUTION_OPTIONS}
        description="How particles are distributed along the line"
      />
    </div>
  );
}
