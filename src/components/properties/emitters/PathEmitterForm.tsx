import type { EmitterConfig } from '@eonwetheherald/swizzle';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PointListEditor } from '../fields/PointListEditor';
import { CheckboxField } from '../fields/CheckboxField';
import { SelectInput } from '../fields/SelectInput';
import { asEmitterData } from '@/types/emitterTypes';

interface PathEmitterFormProps {
  emitter: EmitterConfig;
  onChange: (updates: Partial<EmitterConfig>) => void;
}

const PATH_TYPE_OPTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'catmullRom', label: 'Catmull-Rom (smooth)' },
  { value: 'bezier', label: 'Bezier' },
];

const DEFAULT_PATH = [
  { x: -200, y: 0 },
  { x: 0, y: -100 },
  { x: 200, y: 0 },
];

export function PathEmitterForm({ emitter, onChange }: PathEmitterFormProps) {
  const data = asEmitterData(emitter, 'path');
  const path = (data.path as { x: number; y: number }[] | undefined) ?? DEFAULT_PATH;

  return (
    <div className="space-y-3">
      <PointListEditor
        label="Path Points"
        points={path}
        onChange={(pts) => onChange({ path: pts })}
        minPoints={2}
        description="Path waypoints (relative to emitter position, minimum 2)"
      />
      <SelectInput
        label="Path Type"
        value={data.pathType ?? 'linear'}
        onChange={(v) => onChange({ pathType: v as 'linear' | 'catmullRom' | 'bezier' })}
        options={PATH_TYPE_OPTIONS}
        description="Interpolation method between waypoints"
      />
      <CheckboxField
        id="path-auto-start"
        label="Auto Start"
        checked={data.autoStart ?? true}
        onChange={(checked) => onChange({ autoStart: checked })}
        description="Start moving along the path automatically. Disable to trigger via API."
      />
      <CheckboxField
        id="path-loop"
        label="Loop"
        checked={data.loop ?? false}
        onChange={(checked) => onChange({ loop: checked })}
        description="Loop back to start when end is reached"
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="field-group">
          <Label className="field-label">Speed (px/s)</Label>
          <Input
            type="number"
            min={0}
            value={data.speed ?? 100}
            onChange={(e) => onChange({ speed: parseFloat(e.target.value) || 0 })}
            className="h-8 text-sm"
          />
        </div>
        <div className="field-group">
          <Label className="field-label">Duration (s)</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            placeholder="Auto"
            value={data.duration ?? ''}
            onChange={(e) =>
              onChange({ duration: e.target.value === '' ? undefined : parseFloat(e.target.value) })
            }
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
