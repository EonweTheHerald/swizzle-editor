import type { EmitterConfig } from '@eonwetheherald/swizzle';

interface PointEmitterFormProps {
  emitter: EmitterConfig;
  onChange: (updates: Partial<EmitterConfig>) => void;
}

export function PointEmitterForm(_props: PointEmitterFormProps) {
  return (
    <div className="text-xs text-[var(--text-muted)] p-2 bg-[var(--surface-2)] rounded">
      Point emitter spawns particles from a single position. Configure velocity below to control
      direction and speed.
    </div>
  );
}
