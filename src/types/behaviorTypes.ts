import type { BehaviorConfig } from '@eonwetheherald/swizzle';

// ─── Typed behavior config interfaces ─────────────────────────────────────────

export interface VelocityBehaviorConfig extends BehaviorConfig {
  type: 'velocity';
  priority?: number;
}

export interface GravityBehaviorConfig extends BehaviorConfig {
  type: 'gravity';
  force: { x: number; y: number };
  priority?: number;
}

export interface DragBehaviorConfig extends BehaviorConfig {
  type: 'drag';
  coefficient: number;
  priority?: number;
}

export interface BoundsBehaviorConfig extends BehaviorConfig {
  type: 'bounds';
  mode: 'wrap' | 'bounce' | 'die' | 'clamp';
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  bounceDamping?: number;
  priority?: number;
}

export interface VelocityAccelerationBehaviorConfig extends BehaviorConfig {
  type: 'velocityAcceleration';
  strength: number;
  maxSpeed?: number;
  priority?: number;
}

export interface FadeBehaviorConfig extends BehaviorConfig {
  type: 'fade';
  startAlpha: number;
  endAlpha: number;
  easing?: string;
  priority?: number;
}

export interface ScaleBehaviorConfig extends BehaviorConfig {
  type: 'scale';
  startScale: number;
  endScale: number;
  easing?: string;
  priority?: number;
}

export interface RotationBehaviorConfig extends BehaviorConfig {
  type: 'rotation';
  angularVelocity: number;
  startRotation?: number;
  priority?: number;
}

export interface ColorBehaviorConfig extends BehaviorConfig {
  type: 'color';
  startColor: number;
  endColor: number;
  easing?: string;
  priority?: number;
}

export interface VelocityAlignBehaviorConfig extends BehaviorConfig {
  type: 'velocityAlign';
  offset?: number;
  minSpeed?: number;
  priority?: number;
}

export interface VelocityStretchBehaviorConfig extends BehaviorConfig {
  type: 'velocityStretch';
  minStretch: number;
  maxStretch: number;
  speedRange: { min: number; max: number };
  thickness?: number;
  axis?: 'x' | 'y';
  priority?: number;
}

export interface KeyframeEntry {
  time: number;
  value: number;
  easing?: string;
}

export interface KeyframeBehaviorConfig extends BehaviorConfig {
  type: 'keyframe';
  property: 'alpha' | 'scale' | 'rotation';
  keyframes: KeyframeEntry[];
  priority?: number;
}

export interface ProximityLinkBehaviorConfig extends BehaviorConfig {
  type: 'proximityLink';
  maxDistance: number;
  lineColor?: number;
  lineAlpha?: number;
  priority?: number;
}

export type TypedBehaviorConfig =
  | VelocityBehaviorConfig
  | GravityBehaviorConfig
  | DragBehaviorConfig
  | BoundsBehaviorConfig
  | VelocityAccelerationBehaviorConfig
  | FadeBehaviorConfig
  | ScaleBehaviorConfig
  | RotationBehaviorConfig
  | ColorBehaviorConfig
  | VelocityAlignBehaviorConfig
  | VelocityStretchBehaviorConfig
  | KeyframeBehaviorConfig
  | ProximityLinkBehaviorConfig;

// ─── Behavior Registry ─────────────────────────────────────────────────────────

export interface BehaviorRegistryEntry {
  value: string;
  label: string;
  category: 'Physics' | 'Visual' | 'Advanced';
  defaultConfig: TypedBehaviorConfig;
}

export const BEHAVIOR_REGISTRY: BehaviorRegistryEntry[] = [
  // Physics
  {
    value: 'velocity',
    label: 'Velocity',
    category: 'Physics',
    defaultConfig: { type: 'velocity', priority: 5 },
  },
  {
    value: 'gravity',
    label: 'Gravity',
    category: 'Physics',
    defaultConfig: { type: 'gravity', force: { x: 0, y: 100 }, priority: 6 },
  },
  {
    value: 'drag',
    label: 'Drag',
    category: 'Physics',
    defaultConfig: { type: 'drag', coefficient: 0.95, priority: 7 },
  },
  {
    value: 'bounds',
    label: 'Bounds',
    category: 'Physics',
    defaultConfig: {
      type: 'bounds',
      mode: 'bounce',
      minX: 0,
      maxX: 800,
      minY: 0,
      maxY: 600,
      bounceDamping: 0.8,
      priority: 8,
    },
  },
  {
    value: 'velocityAcceleration',
    label: 'Velocity Acceleration',
    category: 'Physics',
    defaultConfig: { type: 'velocityAcceleration', strength: 50, priority: 6 },
  },

  // Visual
  {
    value: 'fade',
    label: 'Fade',
    category: 'Visual',
    defaultConfig: { type: 'fade', startAlpha: 1.0, endAlpha: 0.0, easing: 'linear', priority: 15 },
  },
  {
    value: 'scale',
    label: 'Scale',
    category: 'Visual',
    defaultConfig: { type: 'scale', startScale: 1.0, endScale: 0.5, easing: 'linear', priority: 16 },
  },
  {
    value: 'rotation',
    label: 'Rotation',
    category: 'Visual',
    defaultConfig: { type: 'rotation', angularVelocity: 1.0, priority: 17 },
  },
  {
    value: 'color',
    label: 'Color',
    category: 'Visual',
    defaultConfig: { type: 'color', startColor: 0xffffff, endColor: 0x000000, easing: 'linear', priority: 18 },
  },
  {
    value: 'velocityAlign',
    label: 'Velocity Align',
    category: 'Visual',
    defaultConfig: { type: 'velocityAlign', offset: 0, minSpeed: 0, priority: 17 },
  },
  {
    value: 'velocityStretch',
    label: 'Velocity Stretch',
    category: 'Visual',
    defaultConfig: {
      type: 'velocityStretch',
      minStretch: 1.0,
      maxStretch: 3.0,
      speedRange: { min: 0, max: 500 },
      axis: 'x',
      priority: 14,
    },
  },

  // Advanced
  {
    value: 'keyframe',
    label: 'Keyframe',
    category: 'Advanced',
    defaultConfig: {
      type: 'keyframe',
      property: 'alpha',
      keyframes: [
        { time: 0, value: 1, easing: 'linear' },
        { time: 1, value: 0, easing: 'linear' },
      ],
      priority: 20,
    },
  },
  {
    value: 'proximityLink',
    label: 'Proximity Link',
    category: 'Advanced',
    defaultConfig: { type: 'proximityLink', maxDistance: 100, lineColor: 0xffffff, lineAlpha: 0.5, priority: 25 },
  },
];
