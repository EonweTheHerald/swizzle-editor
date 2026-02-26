/**
 * ParticleProperties – configure how individual particles look and behave.
 *
 * Two particle types:
 *   • Sprite – a single static image.  Can use the built-in default circle
 *     (tintable via Color) or a texture uploaded from disk.
 *   • Animated Sprite – a numbered sequence of textures imported from disk.
 *     Frame Sequence is required; if none exist the user is prompted to upload.
 *
 * The form is grouped into three visual sections:
 *   1. Appearance  (type, texture/sequence, color, blend mode)
 *   2. Transform   (scale, rotation, anchor, alpha)
 *   3. Animation   (animated-only: FPS, mode, loop, random start)
 */

import { useEditorStore } from '@/store/editorStore';
import { SelectInput } from './fields/SelectInput';
import { RangeInput } from './fields/RangeInput';
import { ColorInput } from './fields/ColorInput';
import { CheckboxField } from './fields/CheckboxField';
import { Vector2Input } from './fields/Vector2Input';
import { useEffect } from 'react';
import { Upload } from 'lucide-react';
import type { EmitterConfig } from '@eonwetheherald/swizzle';

// ── Constants ────────────────────────────────────────────────────────────────

interface ParticlePropertiesProps {
  emitterIndex: number;
  particle: EmitterConfig['particle'];
}

const BLEND_MODE_OPTIONS = [
  { value: '0', label: 'Normal' },
  { value: '1', label: 'Add' },
  { value: '2', label: 'Multiply' },
  { value: '3', label: 'Screen' },
];

const ANIMATION_MODE_OPTIONS = [
  { value: 'sequential', label: 'Sequential' },
  { value: 'random', label: 'Random' },
  { value: 'lifetime', label: 'Lifetime-synced' },
];

const PARTICLE_TYPE_OPTIONS = [
  { value: 'sprite', label: 'Sprite' },
  { value: 'animated', label: 'Animated Sprite' },
];

type ParticleAny = EmitterConfig['particle'] & { [key: string]: unknown };

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Section heading inside the form */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[var(--text-xs)] font-semibold text-[var(--text-muted)] uppercase tracking-wide pt-3 pb-1 border-t border-[var(--border)]">
      {children}
    </p>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function ParticleProperties({ emitterIndex, particle }: ParticlePropertiesProps) {
  const { assets } = useEditorStore();
  const p = particle as ParticleAny;
  const isAnimated = particle.type === 'animated';

  // ── Sequence options for Animated Sprite ──

  const sequenceOptions = Array.from(assets.sequences.values()).map((seq) => ({
    value: seq.name,
    label: `${seq.name} (${seq.frames.length} frames)`,
  }));
  const hasSequences = sequenceOptions.length > 0;
  const firstSequence = sequenceOptions[0]?.value;

  const handleUpdate = (updates: Partial<ParticleAny>) => {
    useEditorStore.getState().updateEmitter(emitterIndex, {
      particle: { ...particle, ...updates },
    });
  };

  // When switching types, reset texture/sequence fields to sensible defaults.
  const handleTypeChange = (type: string) => {
    if (type === 'animated') {
      handleUpdate({
        type: 'animated',
        texture: undefined,
        frameSequence: firstSequence,
        animationMode: (p.animationMode as string) ?? 'sequential',
        loop: (p.loop as boolean) ?? true,
      });
    } else {
      handleUpdate({
        type: 'sprite',
        frameSequence: undefined,
        animationMode: undefined,
        loop: undefined,
        randomStartFrame: undefined,
        frameRateRange: undefined,
      });
    }
  };

  // Ensure animated particles always persist an actual frameSequence value.
  // Without this, the UI can display the first option while config remains undefined.
  useEffect(() => {
    if (!isAnimated) return;
    if ((p.frameSequence as string | undefined) || !firstSequence) return;

    useEditorStore.getState().updateEmitter(emitterIndex, {
      particle: { ...particle, frameSequence: firstSequence },
    });
  }, [emitterIndex, firstSequence, isAnimated, p.frameSequence, particle]);

  // ── Texture options for Sprite ──

  const textureOptions = [
    { value: 'default', label: 'Default (circle)' },
    ...Array.from(assets.textures.values()).map((tex) => ({
      value: tex.name,
      label: tex.name,
    })),
  ];

  return (
    <div className="space-y-3">
      {/* ────────────────── APPEARANCE ────────────────── */}
      <SectionHeading>Appearance</SectionHeading>

      {/* Particle Type */}
      <SelectInput
        label="Type"
        value={particle.type}
        onChange={handleTypeChange}
        options={PARTICLE_TYPE_OPTIONS}
        description={
          isAnimated
            ? 'Plays a numbered sequence of textures'
            : 'A single static image — use the default circle or upload a texture'
        }
      />

      {/* ── Sprite: texture picker ── */}
      {!isAnimated && (
        <SelectInput
          label="Texture"
          value={(p.texture as string) || 'default'}
          onChange={(texture) => handleUpdate({ texture })}
          options={textureOptions}
          description="Upload images in the Assets tab to add more textures"
        />
      )}

      {/* ── Animated: sequence picker (required) ── */}
      {isAnimated && (
        hasSequences ? (
          <SelectInput
            label="Frame Sequence"
            value={(p.frameSequence as string) || sequenceOptions[0]?.value || ''}
            onChange={(frameSequence) => handleUpdate({ frameSequence })}
            options={sequenceOptions}
            description="Numbered image sequence uploaded via the Assets tab"
          />
        ) : (
          <div className="flex items-start gap-2 p-2.5 rounded border border-dashed border-[var(--warning)] bg-[var(--warning)]/5 text-[var(--text-sm)]">
            <Upload size={14} className="text-[var(--warning)] mt-0.5 flex-shrink-0" />
            <span className="text-[var(--text-muted)] leading-snug">
              No frame sequences found. Upload numbered images (e.g.{' '}
              <span className="font-mono text-[var(--text)]">coin_000.png … coin_059.png</span>
              ) in the <strong>Assets</strong> tab — sequences are detected automatically.
            </span>
          </div>
        )
      )}

      {/* Color tint */}
      <ColorInput
        label="Color"
        value={(p.color as number | undefined) ?? 0xffffff}
        onChange={(color) => handleUpdate({ color })}
        description={
          !isAnimated && ((p.texture as string) || 'default') === 'default'
            ? 'Tint for the default circle particle'
            : 'Multiplicative tint applied to the texture'
        }
      />

      {/* Blend Mode */}
      <SelectInput
        label="Blend Mode"
        value={String(p.blendMode ?? 0)}
        onChange={(v) => handleUpdate({ blendMode: parseInt(v) })}
        options={BLEND_MODE_OPTIONS}
      />

      {/* ────────────────── TRANSFORM ────────────────── */}
      <SectionHeading>Transform</SectionHeading>

      {/* Lifetime */}
      <RangeInput
        label="Lifetime (s)"
        value={particle.lifetime}
        onChange={(lifetime) => handleUpdate({ lifetime })}
        min={0.1}
        max={10}
        step={0.1}
        description="How long each particle lives"
      />

      {/* Scale */}
      <RangeInput
        label="Scale"
        value={(p.scale as number | { min: number; max: number }) ?? 1}
        onChange={(scale) => handleUpdate({ scale })}
        min={0.01}
        max={5}
        step={0.05}
        description="Size multiplier (1 = original)"
      />

      {/* Alpha */}
      <RangeInput
        label="Opacity"
        value={(p.alpha as number | { min: number; max: number }) ?? 1}
        onChange={(alpha) => handleUpdate({ alpha })}
        min={0}
        max={1}
        step={0.05}
      />

      {/* Rotation */}
      <RangeInput
        label="Rotation (rad)"
        value={(p.rotation as number | { min: number; max: number }) ?? 0}
        onChange={(rotation) => handleUpdate({ rotation })}
        min={0}
        max={6.283185}
        step={0.1}
      />

      {/* Anchor */}
      <Vector2Input
        label="Anchor"
        value={(p.anchor as { x: number; y: number }) ?? { x: 0.5, y: 0.5 }}
        onChange={(anchor) => handleUpdate({ anchor })}
        description="Pivot point (0–1). 0.5 / 0.5 = center"
      />

      {/* ────────────────── ANIMATION (animated only) ────────────────── */}
      {isAnimated && (
        <>
          <SectionHeading>Animation</SectionHeading>

          <RangeInput
            label="Frame Rate (FPS)"
            value={
              (p.frameRateRange as { min: number; max: number }) ??
              (typeof p.frameRate === 'number' ? p.frameRate : { min: 24, max: 24 })
            }
            onChange={(frameRateRange) => handleUpdate({ frameRateRange })}
            min={1}
            max={120}
            step={1}
            description="Use a range for per-particle variation"
          />

          <SelectInput
            label="Mode"
            value={(p.animationMode as string) ?? 'sequential'}
            onChange={(animationMode) => handleUpdate({ animationMode })}
            options={ANIMATION_MODE_OPTIONS}
          />

          <CheckboxField
            id="anim-loop"
            label="Loop"
            checked={(p.loop as boolean) ?? true}
            onChange={(loop) => handleUpdate({ loop })}
            description="Restart when last frame is reached"
          />

          <CheckboxField
            id="random-start-frame"
            label="Random Start Frame"
            checked={(p.randomStartFrame as boolean) ?? false}
            onChange={(randomStartFrame) => handleUpdate({ randomStartFrame })}
            description="Desynchronise particles by starting at a random frame"
          />
        </>
      )}
    </div>
  );
}
