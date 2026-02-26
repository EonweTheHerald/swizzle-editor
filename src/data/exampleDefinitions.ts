/**
 * Example particle effect definitions
 *
 * Each entry bundles the raw YAML with human-readable metadata so the
 * ExamplesGallery can render cards and the editor can load configurations
 * without any network requests.
 */

export interface ExampleTag {
  label: string;
  /** CSS color variable — maps to the CRT theme palette */
  color: 'primary' | 'destructive' | 'accent' | 'muted';
}

export interface ExampleDefinition {
  /** Unique slug used as key */
  id: string;
  /** Display name */
  name: string;
  /** One-line description shown on the card */
  description: string;
  /** Longer description shown in the detail view */
  details: string;
  /** Tags for quick scanning */
  tags: ExampleTag[];
  /** Emitter type(s) used — rendered as chips */
  emitterTypes: string[];
  /** Behavior names referenced */
  behaviors: string[];
  /** Raw YAML ready to be loaded by yamlToEditorConfig() */
  yaml: string;
}

// ---------------------------------------------------------------------------
// YAML payloads — kept as template literals so they are searchable / diffable
// ---------------------------------------------------------------------------

const coinFountainYaml = `\
system:
  maxParticles: 150
  autoStart: true

emitters:
  - type: point
    position: { x: 400, y: 500 }
    emissionRate: 35
    velocity:
      mode: cone
      baseAngle: -1.5708
      coneAngle: 0.7854
      speed: { min: 400, max: 600 }
    particle:
      type: sprite
      texture: default
      lifetime: { min: 3.0, max: 4.5 }
      scale: { min: 0.1, max: 0.25 }
      behaviors:
        - type: velocity
        - type: gravity
          force: { x: 0, y: 600 }
        - type: drag
          coefficient: 0.05
        - type: rotation
          angularVelocity: { min: -2.0, max: 2.0 }
        - type: fade
          startAlpha: 1.0
          endAlpha: 0.0
          easing: easeInQuad
`;

const cometTrailYaml = `\
system:
  maxParticles: 500
  autoStart: true

emitters:
  - type: path
    position: { x: 0, y: 0 }
    path:
      - { x: 100, y: 100 }
      - { x: 300, y: 200 }
      - { x: 500, y: 150 }
      - { x: 700, y: 300 }
      - { x: 600, y: 500 }
      - { x: 300, y: 450 }
      - { x: 100, y: 100 }
    pathType: catmullRom
    loop: true
    duration: 5.0
    emissionRate: 100
    velocity:
      mode: radial
      angle: { min: 0, max: 6.283185 }
      speed: { min: 10, max: 30 }
    particle:
      type: sprite
      texture: default
      lifetime: { min: 1.0, max: 2.0 }
      color: 0xADD8E6
      scale: { min: 0.3, max: 0.8 }
      behaviors:
        - type: velocity
        - type: fade
          startAlpha: 1.0
          endAlpha: 0.0
          easing: easeOutQuad
        - type: drag
          coefficient: 0.98
`;

const constellationYaml = `\
system:
  maxParticles: 100
  autoStart: true

emitters:
  - type: area
    position: { x: 0, y: 0 }
    width: 800
    height: 600
    emissionRate: 20
    velocity:
      mode: radial
      speed: { min: 20, max: 50 }
    particle:
      type: sprite
      texture: default
      lifetime: 10.0
      color: 0xFFFFFF
      scale: 0.5
      behaviors:
        - type: velocity
        - type: bounds
          minX: 0
          maxX: 800
          minY: 0
          maxY: 600
          mode: wrap
        - type: proximityLink
          maxDistance: 150
          linkColor: 0xFFFFFF
          linkAlpha: 0.3
          maxLinks: 3
`;

const electricFenceYaml = `\
system:
  maxParticles: 300
  autoStart: true

emitters:
  - type: line
    position: { x: 0, y: 0 }
    start: { x: 100, y: 200 }
    end: { x: 700, y: 200 }
    distribution: uniform
    emissionRate: 150
    velocity:
      mode: cartesian
      speedX: { min: -20, max: 20 }
      speedY: { min: -100, max: 100 }
    particle:
      type: sprite
      texture: default
      lifetime: { min: 1.0, max: 2.0 }
      color: 0x00FFFF
      scale: 0.3
      behaviors:
        - type: velocity
        - type: fade
          startAlpha: 1.0
          endAlpha: 0.0
          easing: easeOutCubic
        - type: bounds
          minX: 0
          maxX: 800
          minY: 0
          maxY: 600
          mode: bounce
          bounceDamping: 0.7
`;

const explosionYaml = `\
system:
  maxParticles: 200
  autoStart: true

emitters:
  - type: burst
    position: { x: 400, y: 300 }
    emissionRate: 0
    burstCount: 100
    burstInterval: 999
    burstLimit: 1
    velocity:
      mode: radial
      speed: { min: 50, max: 300 }
    particle:
      type: sprite
      texture: default
      lifetime: 0.8
      color: 0xFFAA00
      behaviors:
        - type: velocity
        - type: drag
          coefficient: 0.95
        - type: keyframe
          property: scale
          keyframes:
            - { time: 0.0, value: 0.0, easing: easeOutQuad }
            - { time: 0.2, value: 2.0 }
            - { time: 0.5, value: 1.0 }
            - { time: 1.0, value: 0.0, easing: easeInQuad }
        - type: fade
          startAlpha: 1.0
          endAlpha: 0.0
          easing: easeInQuad
`;

const fireworkYaml = `\
system:
  maxParticles: 400
  autoStart: true

emitters:
  - type: timed
    position: { x: 400, y: 300 }
    emissionRate: 400
    emitterLifetime: 0.5
    fadeOut: true
    velocity:
      mode: radial
      speed: { min: 100, max: 250 }
    particle:
      type: sprite
      texture: default
      lifetime: { min: 1.5, max: 2.5 }
      color: 0xFF0000
      scale: { min: 0.5, max: 1.0 }
      behaviors:
        - type: velocity
        - type: gravity
          force: { x: 0, y: 200 }
        - type: drag
          coefficient: 0.98
        - type: fade
          startAlpha: 1.0
          endAlpha: 0.0
          easing: easeInQuad
        - type: bounds
          minY: 0
          maxY: 600
          mode: die
`;

const flamethrowerYaml = `\
system:
  maxParticles: 500
  autoStart: true

emitters:
  - type: point
    position: { x: 100, y: 300 }
    emissionRate: 200
    velocity:
      mode: cone
      baseAngle: -1.5708
      coneAngle: 0.785
      speed: { min: 200, max: 400 }
    particle:
      type: sprite
      texture: default
      lifetime: { min: 0.5, max: 1.0 }
      color: 0xFF4500
      scale: { min: 0.5, max: 1.5 }
      behaviors:
        - type: velocity
        - type: gravity
          force: { x: 0, y: -50 }
        - type: fade
          startAlpha: 1.0
          endAlpha: 0.0
          easing: easeOutQuad
        - type: scale
          startScale: 1.0
          endScale: 0.2
          easing: easeInQuad
`;

const polygonShieldYaml = `\
system:
  maxParticles: 300
  autoStart: true

emitters:
  - type: polygon
    position: { x: 400, y: 300 }
    vertices:
      - { x: -100, y: -100 }
      - { x: 100, y: -100 }
      - { x: 150, y: 0 }
      - { x: 100, y: 100 }
      - { x: -100, y: 100 }
      - { x: -150, y: 0 }
    edgeEmit: true
    emissionRate: 80
    velocity:
      mode: normal
      direction: outward
      speed: { min: 50, max: 100 }
    particle:
      type: sprite
      texture: default
      lifetime: { min: 0.8, max: 1.5 }
      color: 0x00FF00
      scale: 0.4
      behaviors:
        - type: velocity
        - type: drag
          coefficient: 0.95
        - type: fade
          startAlpha: 1.0
          endAlpha: 0.0
          easing: easeOutCubic
`;

const warpDriveYaml = `\
system:
  maxParticles: 4000
  autoStart: true

emitters:
  - type: point
    position: { x: 400, y: 300 }
    emissionRate: 1000
    maxParticles: 2000
    particle:
      type: sprite
      texture: default
      lifetime: { min: 0.6, max: 1.1 }
      scale: { min: 0.5, max: 1.0 }
      behaviors:
        - type: velocity
        - type: drag
          coefficient: 0.02
        - type: fade
          startAlpha: 1.0
          endAlpha: 0.0
          easing: easeOutQuad
    velocity:
      angle: { min: 0, max: 6.283185 }
      speed: { min: 150, max: 420 }

  - type: point
    position: { x: 400, y: 300 }
    emissionRate: 260
    maxParticles: 900
    particle:
      type: sprite
      texture: default
      lifetime: { min: 1.0, max: 1.6 }
      scale: { min: 0.3, max: 0.6 }
      behaviors:
        - type: velocity
        - type: drag
          coefficient: 0.015
        - type: fade
          startAlpha: 0.9
          endAlpha: 0.0
          easing: easeOutQuad
    velocity:
      angle: { min: 0, max: 6.283185 }
      speed: { min: 120, max: 380 }
`;

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const EXAMPLE_DEFINITIONS: ExampleDefinition[] = [
  {
    id: 'coin-fountain',
    name: 'Coin Fountain',
    description: 'Coins arc upward and fall with gravity and spin',
    details:
      'A point emitter shooting coins upward in a cone pattern. Features gravity, drag, rotation, and fade behaviors creating a realistic fountain arc.',
    tags: [
      { label: 'Physics', color: 'primary' },
      { label: 'Cone', color: 'accent' },
    ],
    emitterTypes: ['point'],
    behaviors: ['velocity', 'gravity', 'drag', 'rotation', 'fade'],
    yaml: coinFountainYaml,
  },
  {
    id: 'comet-trail',
    name: 'Comet Trail',
    description: 'Particles emitted along a smooth Catmull-Rom path',
    details:
      'A path emitter traces a looping spline curve while continuously emitting soft particles that fade and decelerate.',
    tags: [
      { label: 'Path', color: 'accent' },
      { label: 'Spline', color: 'muted' },
    ],
    emitterTypes: ['path'],
    behaviors: ['velocity', 'fade', 'drag'],
    yaml: cometTrailYaml,
  },
  {
    id: 'constellation',
    name: 'Constellation',
    description: 'Drifting nodes connected by proximity links',
    details:
      'An area emitter fills the screen with long-lived particles that drift slowly. Proximity links draw lines between nearby particles, creating a network/constellation look.',
    tags: [
      { label: 'Network', color: 'primary' },
      { label: 'Links', color: 'accent' },
    ],
    emitterTypes: ['area'],
    behaviors: ['velocity', 'bounds', 'proximityLink'],
    yaml: constellationYaml,
  },
  {
    id: 'electric-fence',
    name: 'Electric Fence',
    description: 'Sparks bouncing off invisible walls along a line',
    details:
      'A line emitter distributes particles uniformly along a horizontal segment. Cartesian velocity and bounce bounds create electric-arc-like sparks.',
    tags: [
      { label: 'Bounce', color: 'destructive' },
      { label: 'Line', color: 'accent' },
    ],
    emitterTypes: ['line'],
    behaviors: ['velocity', 'fade', 'bounds'],
    yaml: electricFenceYaml,
  },
  {
    id: 'explosion',
    name: 'Explosion',
    description: 'One-shot radial burst with keyframe-animated scale',
    details:
      'A burst emitter fires 100 particles in a single radial explosion. Keyframe behavior drives a punch-in / fade-out scale animation.',
    tags: [
      { label: 'Burst', color: 'destructive' },
      { label: 'Keyframe', color: 'primary' },
    ],
    emitterTypes: ['burst'],
    behaviors: ['velocity', 'drag', 'keyframe', 'fade'],
    yaml: explosionYaml,
  },
  {
    id: 'firework',
    name: 'Firework',
    description: 'Timed burst of multi-colored particles with gravity',
    details:
      'A timed emitter fires for 0.5 seconds then stops. Gravity pulls particles down while bounds kill them when they leave the viewport.',
    tags: [
      { label: 'Timed', color: 'accent' },
      { label: 'Gravity', color: 'primary' },
    ],
    emitterTypes: ['timed'],
    behaviors: ['velocity', 'gravity', 'drag', 'fade', 'bounds'],
    yaml: fireworkYaml,
  },
  {
    id: 'flamethrower',
    name: 'Flamethrower',
    description: 'Intense cone of fire particles shrinking over time',
    details:
      'A point emitter sprays particles upward in a 45-degree cone. Negative gravity creates upward drift while scale shrinks particles over their lifetime.',
    tags: [
      { label: 'Cone', color: 'destructive' },
      { label: 'Scale', color: 'primary' },
    ],
    emitterTypes: ['point'],
    behaviors: ['velocity', 'gravity', 'fade', 'scale'],
    yaml: flamethrowerYaml,
  },
  {
    id: 'polygon-shield',
    name: 'Polygon Shield',
    description: 'Hexagonal edge emitter with outward-normal velocity',
    details:
      'A polygon emitter with 6 vertices forms a hexagon. Particles emit from edges and fly outward along surface normals.',
    tags: [
      { label: 'Polygon', color: 'primary' },
      { label: 'Normal', color: 'accent' },
    ],
    emitterTypes: ['polygon'],
    behaviors: ['velocity', 'drag', 'fade'],
    yaml: polygonShieldYaml,
  },
  {
    id: 'warp-drive',
    name: 'Warp Drive',
    description: 'Dual-layer radial streaks accelerating outward',
    details:
      'Two point emitters at the screen center create dense and sparse radial streaks. Drag and fade give the classic hyperspace-jump look.',
    tags: [
      { label: 'Multi-Emitter', color: 'primary' },
      { label: 'Radial', color: 'accent' },
    ],
    emitterTypes: ['point', 'point'],
    behaviors: ['velocity', 'drag', 'fade'],
    yaml: warpDriveYaml,
  },
];

/** Lookup an example by its id. */
export function getExampleById(id: string): ExampleDefinition | undefined {
  return EXAMPLE_DEFINITIONS.find((e) => e.id === id);
}
