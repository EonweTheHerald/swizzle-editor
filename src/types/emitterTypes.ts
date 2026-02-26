import type { EmitterConfig } from '@eonwetheherald/swizzle';

interface EditorEmitterBase extends EmitterConfig {
  name?: string;
}

export interface PointEmitterData extends EditorEmitterBase {
  type: 'point';
}

export interface CircleEmitterData extends EditorEmitterBase {
  type: 'circle';
  radius: number;
  innerRadius?: number;
  edgeEmit?: boolean;
}

export interface AreaEmitterData extends EditorEmitterBase {
  type: 'area';
  width: number;
  height: number;
}

export interface LineEmitterData extends EditorEmitterBase {
  type: 'line';
  start: { x: number; y: number };
  end: { x: number; y: number };
  distribution?: 'uniform' | 'start' | 'end' | 'center';
}

export interface PolygonEmitterData extends EditorEmitterBase {
  type: 'polygon';
  vertices: { x: number; y: number }[];
  edgeEmit?: boolean;
}

export interface PathEmitterData extends EditorEmitterBase {
  type: 'path';
  path: { x: number; y: number }[];
  pathType?: 'linear' | 'catmullRom' | 'bezier';
  autoStart?: boolean;
  loop?: boolean;
  speed?: number;
  duration?: number;
}

export interface BurstEmitterData extends EditorEmitterBase {
  type: 'burst';
  burstCount: number;
  burstInterval?: number;
  burstLimit?: number;
  initialDelay?: number;
}

export interface TimedEmitterData extends EditorEmitterBase {
  type: 'timed';
  emitterLifetime: number;
  fadeOut?: boolean;
}

export interface TriggeredEmitterData extends EditorEmitterBase {
  type: 'triggered';
  particlesPerTrigger?: number;
}

export type TypedEmitterData =
  | PointEmitterData
  | CircleEmitterData
  | AreaEmitterData
  | LineEmitterData
  | PolygonEmitterData
  | PathEmitterData
  | BurstEmitterData
  | TimedEmitterData
  | TriggeredEmitterData;

/**
 * Single safe cast at component boundary — replaces all (emitter as any).field patterns.
 * Used once per emitter form component to get typed access to type-specific fields.
 */
export function asEmitterData<T extends TypedEmitterData['type']>(
  emitter: EmitterConfig,
  _type: T
): Extract<TypedEmitterData, { type: T }> {
  return emitter as Extract<TypedEmitterData, { type: T }>;
}
