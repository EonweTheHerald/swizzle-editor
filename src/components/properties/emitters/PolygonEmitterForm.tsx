import type { EmitterConfig } from '@eonwetheherald/swizzle';
import { PointListEditor } from '../fields/PointListEditor';
import { CheckboxField } from '../fields/CheckboxField';
import { asEmitterData } from '@/types/emitterTypes';

interface PolygonEmitterFormProps {
  emitter: EmitterConfig;
  onChange: (updates: Partial<EmitterConfig>) => void;
}

const DEFAULT_VERTICES = [
  { x: 0, y: -100 },
  { x: 100, y: 100 },
  { x: -100, y: 100 },
];

export function PolygonEmitterForm({ emitter, onChange }: PolygonEmitterFormProps) {
  const data = asEmitterData(emitter, 'polygon');
  const vertices = (data.vertices as { x: number; y: number }[] | undefined) ?? DEFAULT_VERTICES;

  return (
    <div className="space-y-3">
      <PointListEditor
        label="Vertices"
        points={vertices}
        onChange={(pts) => onChange({ vertices: pts })}
        minPoints={3}
        description="Polygon vertices (relative to emitter position, minimum 3)"
      />
      <CheckboxField
        id="polygon-edge-emit"
        label="Edge Emit"
        checked={data.edgeEmit ?? false}
        onChange={(checked) => onChange({ edgeEmit: checked })}
        description="Emit only from polygon edges, not interior"
      />
    </div>
  );
}
