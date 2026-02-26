/**
 * EmitterProperties - Complete forms for all 9 emitter types
 * Uses registry map pattern — new emitter types added by registering one entry.
 */

import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronRight } from 'lucide-react';
import { Vector2Input } from './fields/Vector2Input';
import { ParticleProperties } from './ParticleProperties';
import { VelocityProperties } from './VelocityProperties';
import { BehaviorList } from './BehaviorList';
import type { EmitterConfig } from '@eonwetheherald/swizzle';

// Emitter-specific form components
import { PointEmitterForm } from './emitters/PointEmitterForm';
import { CircleEmitterForm } from './emitters/CircleEmitterForm';
import { AreaEmitterForm } from './emitters/AreaEmitterForm';
import { LineEmitterForm } from './emitters/LineEmitterForm';
import { PolygonEmitterForm } from './emitters/PolygonEmitterForm';
import { PathEmitterForm } from './emitters/PathEmitterForm';
import { BurstEmitterForm } from './emitters/BurstEmitterForm';
import { TimedEmitterForm } from './emitters/TimedEmitterForm';
import { TriggeredEmitterForm } from './emitters/TriggeredEmitterForm';

interface EmitterFormProps {
  emitter: EmitterConfig;
  onChange: (updates: Partial<EmitterConfig>) => void;
}

// Registry map — add new emitter types here without modifying this component
const EMITTER_FORM_REGISTRY: Record<string, React.ComponentType<EmitterFormProps>> = {
  point: PointEmitterForm,
  circle: CircleEmitterForm,
  area: AreaEmitterForm,
  line: LineEmitterForm,
  polygon: PolygonEmitterForm,
  path: PathEmitterForm,
  burst: BurstEmitterForm,
  timed: TimedEmitterForm,
  triggered: TriggeredEmitterForm,
};

interface EmitterPropertiesProps {
  emitter: EmitterConfig;
  index: number;
}

/* Shared accordion trigger style */
const triggerClass =
  'flex items-center gap-2 w-full py-2 text-[var(--text-sm)] font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors group';

export function EmitterProperties({ emitter, index }: EmitterPropertiesProps) {
  const { updateEmitter } = useEditorStore();

  const handleUpdate = (updates: Partial<EmitterConfig>) => {
    updateEmitter(index, updates);
  };

  const TypeForm = EMITTER_FORM_REGISTRY[emitter.type];

  return (
    <div className="space-y-3">
      {/* Basic Properties */}
      <div className="space-y-3">
        {/* Position */}
        <Vector2Input
          label="Position"
          value={emitter.position}
          onChange={(position) => handleUpdate({ position })}
        />

        {/* Emission Rate */}
        {emitter.type !== 'burst' && emitter.type !== 'triggered' && (
          <div className="prop-row">
            <Label htmlFor="emission-rate" className="prop-label">
              Rate
            </Label>
            <Input
              id="emission-rate"
              type="number"
              min="1"
              max="1000"
              value={emitter.emissionRate}
              onChange={(e) => handleUpdate({ emissionRate: parseInt(e.target.value) || 50 })}
            />
            <span className="prop-unit">p/s</span>
          </div>
        )}

        {/* Max Particles (per-emitter cap) */}
        <div className="prop-row">
          <Label htmlFor="max-particles" className="prop-label">
            Max
          </Label>
          <Input
            id="max-particles"
            type="number"
            min="1"
            placeholder="∞"
            value={(emitter as EmitterConfig & { maxParticles?: number }).maxParticles ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? undefined : parseInt(e.target.value) || 1;
              handleUpdate({ maxParticles: val } as Partial<EmitterConfig>);
            }}
          />
        </div>
      </div>

      <Separator />

      {/* Type-Specific Properties */}
      {TypeForm && <TypeForm emitter={emitter} onChange={handleUpdate} />}

      <Separator />

      {/* Accordion for Particle, Velocity, Behaviors */}
      <Accordion.Root type="multiple" defaultValue={['particle', 'velocity']}>
        {/* Particle Configuration */}
        <Accordion.Item value="particle" className="border-b border-[var(--border)]">
          <Accordion.Header>
            <Accordion.Trigger className={triggerClass}>
              <ChevronRight className="h-3 w-3 transition-transform duration-150 group-data-[state=open]:rotate-90" />
              Particle
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pb-3 pl-5">
            <ParticleProperties emitterIndex={index} particle={emitter.particle} />
          </Accordion.Content>
        </Accordion.Item>

        {/* Velocity Configuration */}
        <Accordion.Item value="velocity" className="border-b border-[var(--border)]">
          <Accordion.Header>
            <Accordion.Trigger className={triggerClass}>
              <ChevronRight className="h-3 w-3 transition-transform duration-150 group-data-[state=open]:rotate-90" />
              Velocity
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pb-3 pl-5">
            <VelocityProperties
              velocity={emitter.velocity ?? {}}
              onChange={(velocity) => handleUpdate({ velocity })}
            />
          </Accordion.Content>
        </Accordion.Item>

        {/* Behaviors */}
        <Accordion.Item value="behaviors" className="border-b border-[var(--border)]">
          <Accordion.Header>
            <Accordion.Trigger className={triggerClass}>
              <ChevronRight className="h-3 w-3 transition-transform duration-150 group-data-[state=open]:rotate-90" />
              Behaviors
              <span className="text-[var(--text-xs)] text-[var(--text-dimmed)] ml-auto">
                {emitter.particle.behaviors?.length || 0}
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pb-3 pl-5">
            <BehaviorList emitterIndex={index} />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}
