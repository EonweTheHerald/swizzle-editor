/**
 * BehaviorForm - Dynamic form for editing behavior properties
 * Fully typed — no `any` casts. New behaviors: add a case to renderBehaviorProperties.
 */

import { useEditorStore } from '@/store/editorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { Vector2Input } from './fields/Vector2Input';
import { RangeInput } from './fields/RangeInput';
import { SelectInput } from './fields/SelectInput';
import { ColorInput } from './fields/ColorInput';
import { EasingSelect } from './fields/EasingSelect';
import type { BehaviorConfig } from '@eonwetheherald/swizzle';
import type {
  TypedBehaviorConfig,
  GravityBehaviorConfig,
  DragBehaviorConfig,
  BoundsBehaviorConfig,
  VelocityAccelerationBehaviorConfig,
  FadeBehaviorConfig,
  ScaleBehaviorConfig,
  RotationBehaviorConfig,
  ColorBehaviorConfig,
  VelocityAlignBehaviorConfig,
  VelocityStretchBehaviorConfig,
  KeyframeBehaviorConfig,
  ProximityLinkBehaviorConfig,
  KeyframeEntry,
} from '@/types/behaviorTypes';

interface BehaviorFormProps {
  emitterIndex: number;
  behaviorIndex: number;
  behavior: BehaviorConfig;
}

export function BehaviorForm({ emitterIndex, behaviorIndex, behavior }: BehaviorFormProps) {
  const { updateBehavior } = useEditorStore();
  const typed = behavior as TypedBehaviorConfig;

  const handleUpdate = (updates: Partial<TypedBehaviorConfig>) => {
    updateBehavior(emitterIndex, behaviorIndex, { ...behavior, ...updates } as BehaviorConfig);
  };

  return (
    <div className="space-y-4">
      {/* Priority */}
      <div className="field-group">
        <Label htmlFor="priority" className="field-label">
          Priority
        </Label>
        <Input
          id="priority"
          type="number"
          value={(typed as { priority?: number }).priority ?? 50}
          onChange={(e) => handleUpdate({ priority: parseInt(e.target.value) || 50 } as Partial<TypedBehaviorConfig>)}
        />
        <p className="field-description">Lower = executes earlier (0-100)</p>
      </div>

      {/* Type-specific properties */}
      {renderBehaviorProperties(typed, handleUpdate)}
    </div>
  );
}

// ─── Per-behavior render functions ────────────────────────────────────────────

type UpdateFn = (updates: Partial<TypedBehaviorConfig>) => void;

function renderBehaviorProperties(behavior: TypedBehaviorConfig, handleUpdate: UpdateFn) {
  switch (behavior.type) {
    case 'velocity':
      return (
        <div className="text-sm text-[var(--text-muted)] p-2 bg-[var(--surface-2)] rounded">
          Velocity is configured in the <strong>Velocity Configuration</strong> section above.
        </div>
      );

    case 'gravity':
      return renderGravity(behavior, handleUpdate);

    case 'drag':
      return renderDrag(behavior, handleUpdate);

    case 'bounds':
      return renderBounds(behavior, handleUpdate);

    case 'velocityAcceleration':
      return renderVelocityAcceleration(behavior, handleUpdate);

    case 'fade':
      return renderFade(behavior, handleUpdate);

    case 'scale':
      return renderScale(behavior, handleUpdate);

    case 'rotation':
      return renderRotation(behavior, handleUpdate);

    case 'color':
      return renderColor(behavior, handleUpdate);

    case 'velocityAlign':
      return renderVelocityAlign(behavior, handleUpdate);

    case 'velocityStretch':
      return renderVelocityStretch(behavior, handleUpdate);

    case 'keyframe':
      return renderKeyframe(behavior, handleUpdate);

    case 'proximityLink':
      return renderProximityLink(behavior, handleUpdate);

    default:
      return (
        <div className="text-sm text-[var(--text-muted)] p-2 bg-[var(--surface-2)] rounded">
          No configuration available for this behavior type.
        </div>
      );
  }
}

function renderGravity(b: GravityBehaviorConfig, update: UpdateFn) {
  return (
    <Vector2Input
      label="Gravity Force"
      value={b.force ?? { x: 0, y: 100 }}
      onChange={(force) => update({ force } as Partial<GravityBehaviorConfig>)}
      description="Gravitational acceleration (pixels/sec²)"
    />
  );
}

function renderDrag(b: DragBehaviorConfig, update: UpdateFn) {
  return (
    <div className="field-group">
      <Label htmlFor="drag-coeff" className="field-label">Drag Coefficient</Label>
      <Input
        id="drag-coeff"
        type="number"
        min={0}
        max={1}
        step={0.01}
        value={b.coefficient ?? 0.95}
        onChange={(e) => update({ coefficient: parseFloat(e.target.value) } as Partial<DragBehaviorConfig>)}
      />
      <p className="field-description">0 = no drag, 1 = instant stop (0.9–0.99 typical)</p>
    </div>
  );
}

function renderBounds(b: BoundsBehaviorConfig, update: UpdateFn) {
  const isInfinity = (v: number | undefined) => v === undefined || !isFinite(v);
  return (
    <>
      <SelectInput
        label="Mode"
        value={b.mode ?? 'bounce'}
        onChange={(mode) => update({ mode: mode as BoundsBehaviorConfig['mode'] } as Partial<BoundsBehaviorConfig>)}
        options={[
          { value: 'bounce', label: 'Bounce' },
          { value: 'wrap', label: 'Wrap' },
          { value: 'die', label: 'Die' },
          { value: 'clamp', label: 'Clamp' },
        ]}
        description="What happens when a particle hits the boundary"
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="field-group">
          <Label className="field-label">Min X</Label>
          <Input
            type="number"
            placeholder="−∞"
            value={isInfinity(b.minX) ? '' : b.minX}
            onChange={(e) => update({ minX: e.target.value === '' ? -Infinity : parseFloat(e.target.value) } as Partial<BoundsBehaviorConfig>)}
            className="h-8 text-sm"
          />
        </div>
        <div className="field-group">
          <Label className="field-label">Max X</Label>
          <Input
            type="number"
            placeholder="∞"
            value={isInfinity(b.maxX) ? '' : b.maxX}
            onChange={(e) => update({ maxX: e.target.value === '' ? Infinity : parseFloat(e.target.value) } as Partial<BoundsBehaviorConfig>)}
            className="h-8 text-sm"
          />
        </div>
        <div className="field-group">
          <Label className="field-label">Min Y</Label>
          <Input
            type="number"
            placeholder="−∞"
            value={isInfinity(b.minY) ? '' : b.minY}
            onChange={(e) => update({ minY: e.target.value === '' ? -Infinity : parseFloat(e.target.value) } as Partial<BoundsBehaviorConfig>)}
            className="h-8 text-sm"
          />
        </div>
        <div className="field-group">
          <Label className="field-label">Max Y</Label>
          <Input
            type="number"
            placeholder="∞"
            value={isInfinity(b.maxY) ? '' : b.maxY}
            onChange={(e) => update({ maxY: e.target.value === '' ? Infinity : parseFloat(e.target.value) } as Partial<BoundsBehaviorConfig>)}
            className="h-8 text-sm"
          />
        </div>
      </div>
      {b.mode === 'bounce' && (
        <div className="field-group">
          <Label className="field-label">Bounce Damping</Label>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={b.bounceDamping ?? 0.8}
            onChange={(e) => update({ bounceDamping: parseFloat(e.target.value) } as Partial<BoundsBehaviorConfig>)}
            className="h-8 text-sm"
          />
          <p className="field-description">Energy retained on bounce (0 = stop, 1 = no energy loss)</p>
        </div>
      )}
    </>
  );
}

function renderVelocityAcceleration(b: VelocityAccelerationBehaviorConfig, update: UpdateFn) {
  return (
    <>
      <div className="field-group">
        <Label className="field-label">Strength (px/s²)</Label>
        <Input
          type="number"
          step={10}
          value={b.strength ?? 50}
          onChange={(e) => update({ strength: parseFloat(e.target.value) } as Partial<VelocityAccelerationBehaviorConfig>)}
          className="h-8 text-sm"
        />
        <p className="field-description">Acceleration along current velocity direction</p>
      </div>
      <div className="field-group">
        <Label className="field-label">Max Speed (px/s)</Label>
        <Input
          type="number"
          min={0}
          placeholder="No limit"
          value={b.maxSpeed ?? ''}
          onChange={(e) =>
            update({ maxSpeed: e.target.value === '' ? undefined : parseFloat(e.target.value) } as Partial<VelocityAccelerationBehaviorConfig>)
          }
          className="h-8 text-sm"
        />
        <p className="field-description">Optional speed cap to prevent runaway acceleration</p>
      </div>
    </>
  );
}

function renderFade(b: FadeBehaviorConfig, update: UpdateFn) {
  return (
    <>
      <RangeInput
        label="Start Alpha"
        value={b.startAlpha ?? 1.0}
        onChange={(startAlpha) => update({ startAlpha } as Partial<FadeBehaviorConfig>)}
        min={0} max={1} step={0.05}
        description="Initial opacity"
      />
      <RangeInput
        label="End Alpha"
        value={b.endAlpha ?? 0.0}
        onChange={(endAlpha) => update({ endAlpha } as Partial<FadeBehaviorConfig>)}
        min={0} max={1} step={0.05}
        description="Final opacity"
      />
      <EasingSelect
        value={b.easing ?? 'linear'}
        onChange={(easing) => update({ easing } as Partial<FadeBehaviorConfig>)}
      />
    </>
  );
}

function renderScale(b: ScaleBehaviorConfig, update: UpdateFn) {
  return (
    <>
      <RangeInput
        label="Start Scale"
        value={b.startScale ?? 1.0}
        onChange={(startScale) => update({ startScale } as Partial<ScaleBehaviorConfig>)}
        min={0.1} max={5} step={0.1}
        description="Initial size multiplier"
      />
      <RangeInput
        label="End Scale"
        value={b.endScale ?? 0.5}
        onChange={(endScale) => update({ endScale } as Partial<ScaleBehaviorConfig>)}
        min={0.1} max={5} step={0.1}
        description="Final size multiplier"
      />
      <EasingSelect
        value={b.easing ?? 'linear'}
        onChange={(easing) => update({ easing } as Partial<ScaleBehaviorConfig>)}
      />
    </>
  );
}

function renderRotation(b: RotationBehaviorConfig, update: UpdateFn) {
  return (
    <>
      <div className="field-group">
        <Label className="field-label">Angular Velocity (rad/s)</Label>
        <Input
          type="number"
          step={0.1}
          value={b.angularVelocity ?? 1.0}
          onChange={(e) => update({ angularVelocity: parseFloat(e.target.value) } as Partial<RotationBehaviorConfig>)}
          className="h-8 text-sm"
        />
        <p className="field-description">Rotation speed (positive = clockwise)</p>
      </div>
      <RangeInput
        label="Start Rotation (rad)"
        value={b.startRotation ?? 0}
        onChange={(startRotation) => update({ startRotation } as Partial<RotationBehaviorConfig>)}
        min={0} max={6.283185} step={0.1}
        description="Initial rotation angle"
      />
    </>
  );
}

function renderColor(b: ColorBehaviorConfig, update: UpdateFn) {
  return (
    <>
      <ColorInput
        label="Start Color"
        value={b.startColor ?? 0xffffff}
        onChange={(startColor) => update({ startColor } as Partial<ColorBehaviorConfig>)}
        description="Initial particle color"
      />
      <ColorInput
        label="End Color"
        value={b.endColor ?? 0x000000}
        onChange={(endColor) => update({ endColor } as Partial<ColorBehaviorConfig>)}
        description="Final particle color"
      />
      <EasingSelect
        value={b.easing ?? 'linear'}
        onChange={(easing) => update({ easing } as Partial<ColorBehaviorConfig>)}
      />
    </>
  );
}

function renderVelocityAlign(b: VelocityAlignBehaviorConfig, update: UpdateFn) {
  return (
    <>
      <div className="field-group">
        <Label className="field-label">Offset (radians)</Label>
        <Input
          type="number"
          step={0.1}
          value={b.offset ?? 0}
          onChange={(e) => update({ offset: parseFloat(e.target.value) } as Partial<VelocityAlignBehaviorConfig>)}
          className="h-8 text-sm"
        />
        <p className="field-description">Rotation offset from velocity direction (0 = face direction of travel)</p>
      </div>
      <div className="field-group">
        <Label className="field-label">Min Speed (px/s)</Label>
        <Input
          type="number"
          min={0}
          value={b.minSpeed ?? 0}
          onChange={(e) => update({ minSpeed: parseFloat(e.target.value) } as Partial<VelocityAlignBehaviorConfig>)}
          className="h-8 text-sm"
        />
        <p className="field-description">Only align when speed exceeds this threshold</p>
      </div>
    </>
  );
}

function renderVelocityStretch(b: VelocityStretchBehaviorConfig, update: UpdateFn) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div className="field-group">
          <Label className="field-label">Min Stretch</Label>
          <Input
            type="number"
            step={0.1}
            min={0}
            value={b.minStretch ?? 1.0}
            onChange={(e) => update({ minStretch: parseFloat(e.target.value) } as Partial<VelocityStretchBehaviorConfig>)}
            className="h-8 text-sm"
          />
        </div>
        <div className="field-group">
          <Label className="field-label">Max Stretch</Label>
          <Input
            type="number"
            step={0.1}
            min={0}
            value={b.maxStretch ?? 3.0}
            onChange={(e) => update({ maxStretch: parseFloat(e.target.value) } as Partial<VelocityStretchBehaviorConfig>)}
            className="h-8 text-sm"
          />
        </div>
        <div className="field-group">
          <Label className="field-label">Speed Min (px/s)</Label>
          <Input
            type="number"
            min={0}
            value={b.speedRange?.min ?? 0}
            onChange={(e) =>
              update({ speedRange: { min: parseFloat(e.target.value), max: b.speedRange?.max ?? 500 } } as Partial<VelocityStretchBehaviorConfig>)
            }
            className="h-8 text-sm"
          />
        </div>
        <div className="field-group">
          <Label className="field-label">Speed Max (px/s)</Label>
          <Input
            type="number"
            min={0}
            value={b.speedRange?.max ?? 500}
            onChange={(e) =>
              update({ speedRange: { min: b.speedRange?.min ?? 0, max: parseFloat(e.target.value) } } as Partial<VelocityStretchBehaviorConfig>)
            }
            className="h-8 text-sm"
          />
        </div>
      </div>
      <p className="field-description">Stretch scales from Min→Max as speed goes from Speed Min→Max</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="field-group">
          <Label className="field-label">Thickness</Label>
          <Input
            type="number"
            step={0.1}
            min={0}
            placeholder="Auto"
            value={b.thickness ?? ''}
            onChange={(e) =>
              update({ thickness: e.target.value === '' ? undefined : parseFloat(e.target.value) } as Partial<VelocityStretchBehaviorConfig>)
            }
            className="h-8 text-sm"
          />
        </div>
        <SelectInput
          label="Axis"
          value={b.axis ?? 'x'}
          onChange={(axis) => update({ axis: axis as 'x' | 'y' } as Partial<VelocityStretchBehaviorConfig>)}
          options={[
            { value: 'x', label: 'X (horizontal)' },
            { value: 'y', label: 'Y (vertical)' },
          ]}
        />
      </div>
    </>
  );
}

function renderKeyframe(b: KeyframeBehaviorConfig, update: UpdateFn) {
  const keyframes: KeyframeEntry[] = b.keyframes ?? [
    { time: 0, value: 1, easing: 'linear' },
    { time: 1, value: 0, easing: 'linear' },
  ];

  const updateKeyframes = (updated: KeyframeEntry[]) =>
    update({ keyframes: updated } as Partial<KeyframeBehaviorConfig>);

  const updateEntry = (index: number, patch: Partial<KeyframeEntry>) => {
    const next = keyframes.map((kf, i) => (i === index ? { ...kf, ...patch } : kf));
    updateKeyframes(next);
  };

  const addKeyframe = () =>
    updateKeyframes([...keyframes, { time: 1, value: 0, easing: 'linear' }]);

  const removeKeyframe = (index: number) => {
    if (keyframes.length <= 2) return;
    updateKeyframes(keyframes.filter((_, i) => i !== index));
  };

  return (
    <>
      <SelectInput
        label="Property"
        value={b.property ?? 'alpha'}
        onChange={(property) =>
          update({ property: property as KeyframeBehaviorConfig['property'] } as Partial<KeyframeBehaviorConfig>)
        }
        options={[
          { value: 'alpha', label: 'Alpha (opacity)' },
          { value: 'scale', label: 'Scale (size)' },
          { value: 'rotation', label: 'Rotation (angle)' },
        ]}
        description="Which particle property to animate over lifetime"
      />

      <div className="space-y-2">
        <Label className="field-label">Keyframes</Label>
        <div className="space-y-1.5">
          {keyframes.map((kf, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-1.5 items-end">
              <div className="field-group">
                {i === 0 && <Label className="field-label text-[10px]">Time (0–1)</Label>}
                <Input
                  type="number"
                  min={0}
                  max={1}
                  step={0.05}
                  value={kf.time}
                  onChange={(e) => updateEntry(i, { time: parseFloat(e.target.value) })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="field-group">
                {i === 0 && <Label className="field-label text-[10px]">Value</Label>}
                <Input
                  type="number"
                  step={0.1}
                  value={kf.value}
                  onChange={(e) => updateEntry(i, { value: parseFloat(e.target.value) })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="field-group">
                {i === 0 && <Label className="field-label text-[10px]">Easing</Label>}
                <EasingSelect
                  value={kf.easing ?? 'linear'}
                  onChange={(easing) => updateEntry(i, { easing })}
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0"
                disabled={keyframes.length <= 2}
                onClick={() => removeKeyframe(i)}
                title="Remove keyframe"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full mt-1" onClick={addKeyframe}>
          <Plus className="h-3 w-3 mr-1" />
          Add Keyframe
        </Button>
      </div>
    </>
  );
}

function renderProximityLink(b: ProximityLinkBehaviorConfig, update: UpdateFn) {
  return (
    <>
      <div className="field-group">
        <Label className="field-label">Max Distance (px)</Label>
        <Input
          type="number"
          min={1}
          value={b.maxDistance ?? 100}
          onChange={(e) => update({ maxDistance: parseInt(e.target.value) } as Partial<ProximityLinkBehaviorConfig>)}
          className="h-8 text-sm"
        />
        <p className="field-description">Maximum distance to draw links between particles</p>
      </div>
      <ColorInput
        label="Line Color"
        value={b.lineColor ?? 0xffffff}
        onChange={(lineColor) => update({ lineColor } as Partial<ProximityLinkBehaviorConfig>)}
      />
      <RangeInput
        label="Line Alpha"
        value={b.lineAlpha ?? 0.5}
        onChange={(lineAlpha) => update({ lineAlpha } as Partial<ProximityLinkBehaviorConfig>)}
        min={0} max={1} step={0.05}
        description="Line opacity"
      />
    </>
  );
}
