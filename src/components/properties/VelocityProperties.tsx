/**
 * VelocityProperties - Configure particle velocity with 5 mode support
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RangeInput } from './fields/RangeInput';
import { SelectInput } from './fields/SelectInput';

// VelocityConfig from swizzle covers all modes via [key: string]: unknown
// We define a local typed shape for the editor
export interface VelocityConfig {
  mode?: 'radial' | 'cone' | 'cartesian' | 'normal' | 'tangent';
  // radial
  angle?: number | { min: number; max: number };
  speed?: number | { min: number; max: number };
  // cone
  baseAngle?: number;
  coneAngle?: number;
  // cartesian
  speedX?: number | { min: number; max: number };
  speedY?: number | { min: number; max: number };
  // normal
  direction?: 'outward' | 'inward' | 'tangent';
}

const MODE_OPTIONS = [
  { value: 'radial', label: 'Radial (angle + speed)' },
  { value: 'cone', label: 'Cone (direction + spread)' },
  { value: 'cartesian', label: 'Cartesian (X + Y)' },
  { value: 'normal', label: 'Normal (surface-relative)' },
  { value: 'tangent', label: 'Tangent (surface-aligned)' },
];

const DIRECTION_OPTIONS = [
  { value: 'outward', label: 'Outward' },
  { value: 'inward', label: 'Inward' },
  { value: 'tangent', label: 'Tangent' },
];

interface VelocityPropertiesProps {
  velocity: VelocityConfig;
  onChange: (velocity: VelocityConfig) => void;
}

export function VelocityProperties({ velocity, onChange }: VelocityPropertiesProps) {
  const mode = velocity.mode ?? 'radial';

  const handleModeChange = (newMode: string) => {
    // Preserve speed when switching modes, set sensible mode-specific defaults
    const base: VelocityConfig = {
      mode: newMode as VelocityConfig['mode'],
      speed: velocity.speed ?? { min: 100, max: 200 },
    };

    switch (newMode) {
      case 'radial':
        onChange({ ...base, angle: velocity.angle ?? { min: 0, max: 6.283185 } });
        break;
      case 'cone':
        onChange({ ...base, baseAngle: velocity.baseAngle ?? 0, coneAngle: velocity.coneAngle ?? 0.785398 });
        break;
      case 'cartesian':
        onChange({
          mode: 'cartesian',
          speedX: velocity.speedX ?? { min: -100, max: 100 },
          speedY: velocity.speedY ?? { min: -200, max: 0 },
        });
        break;
      case 'normal':
        onChange({ ...base, direction: velocity.direction ?? 'outward' });
        break;
      case 'tangent':
        onChange(base);
        break;
      default:
        onChange(base);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <SelectInput
        label="Velocity Mode"
        value={mode}
        onChange={handleModeChange}
        options={MODE_OPTIONS}
        description="How particles receive their initial velocity"
      />

      {/* Radial mode: angle + speed */}
      {mode === 'radial' && (
        <>
          <RangeInput
            label="Angle (radians)"
            value={velocity.angle ?? { min: 0, max: 6.283185 }}
            onChange={(angle) => onChange({ ...velocity, angle })}
            min={0}
            max={6.283185}
            step={0.1}
            description="Direction (0=right, π/2=down, π=left, 3π/2=up). 0–2π = all directions"
          />
          <RangeInput
            label="Speed (px/s)"
            value={velocity.speed ?? { min: 100, max: 200 }}
            onChange={(speed) => onChange({ ...velocity, speed })}
            min={0}
            max={2000}
            step={10}
            description="Particle speed in pixels per second"
          />
        </>
      )}

      {/* Cone mode: baseAngle + coneAngle + speed */}
      {mode === 'cone' && (
        <>
          <div className="field-group">
            <Label className="field-label">Base Angle (radians)</Label>
            <Input
              type="number"
              step={0.1}
              value={velocity.baseAngle ?? 0}
              onChange={(e) => onChange({ ...velocity, baseAngle: parseFloat(e.target.value) || 0 })}
              className="h-8 text-sm"
            />
            <p className="field-description">Center direction of the cone (0 = right)</p>
          </div>
          <div className="field-group">
            <Label className="field-label">Cone Angle (radians)</Label>
            <Input
              type="number"
              step={0.1}
              min={0}
              value={velocity.coneAngle ?? 0.785398}
              onChange={(e) => onChange({ ...velocity, coneAngle: parseFloat(e.target.value) || 0 })}
              className="h-8 text-sm"
            />
            <p className="field-description">Half-angle of cone spread (π/4 ≈ 45°, π/2 ≈ 90°)</p>
          </div>
          <RangeInput
            label="Speed (px/s)"
            value={velocity.speed ?? { min: 100, max: 200 }}
            onChange={(speed) => onChange({ ...velocity, speed })}
            min={0}
            max={2000}
            step={10}
            description="Particle speed in pixels per second"
          />
        </>
      )}

      {/* Cartesian mode: speedX + speedY */}
      {mode === 'cartesian' && (
        <>
          <RangeInput
            label="Speed X (px/s)"
            value={velocity.speedX ?? { min: -100, max: 100 }}
            onChange={(speedX) => onChange({ ...velocity, speedX })}
            min={-2000}
            max={2000}
            step={10}
            description="Horizontal velocity (positive = right)"
          />
          <RangeInput
            label="Speed Y (px/s)"
            value={velocity.speedY ?? { min: -200, max: 0 }}
            onChange={(speedY) => onChange({ ...velocity, speedY })}
            min={-2000}
            max={2000}
            step={10}
            description="Vertical velocity (positive = down)"
          />
        </>
      )}

      {/* Normal mode: direction + speed */}
      {mode === 'normal' && (
        <>
          <SelectInput
            label="Direction"
            value={velocity.direction ?? 'outward'}
            onChange={(direction) =>
              onChange({ ...velocity, direction: direction as 'outward' | 'inward' | 'tangent' })
            }
            options={DIRECTION_OPTIONS}
            description="Direction relative to the emitter surface normal"
          />
          <RangeInput
            label="Speed (px/s)"
            value={velocity.speed ?? { min: 100, max: 200 }}
            onChange={(speed) => onChange({ ...velocity, speed })}
            min={0}
            max={2000}
            step={10}
            description="Particle speed in pixels per second"
          />
        </>
      )}

      {/* Tangent mode: speed only */}
      {mode === 'tangent' && (
        <RangeInput
          label="Speed (px/s)"
          value={velocity.speed ?? { min: 100, max: 200 }}
          onChange={(speed) => onChange({ ...velocity, speed })}
          min={0}
          max={2000}
          step={10}
          description="Speed along the tangent of the emitter surface"
        />
      )}

      <div className="text-xs text-[var(--text-muted)] p-2 bg-[var(--surface-2)] rounded">
        <strong>Tip:</strong> Use range values for variety. Switch modes to change how particles receive velocity.
      </div>
    </div>
  );
}
