import { describe, it, expect } from 'vitest';
import {
  editorConfigToYAML,
  yamlToEditorConfig,
  validateEditorConfig,
  getDefaultVelocityConfig,
  getDefaultParticleConfig,
  recentreEmittersOnResize,
} from '../../../src/utils/configTransform';
import type { EditorConfig } from '../../../src/store/types';

describe('configTransform', () => {
  describe('editorConfigToYAML', () => {
    it('should convert editor config to YAML', () => {
      const config: EditorConfig = {
        system: {
          maxParticles: 1000,
          autoStart: true,
        },
        emitters: [
          {
            type: 'circle',
            position: { x: 400, y: 300 },
            radius: 80,
            emissionRate: 50,
            particle: {
              type: 'sprite',
              texture: 'default',
              lifetime: 2.0,
              behaviors: [],
            },
          } as any,
        ],
      };

      const yaml = editorConfigToYAML(config);

      expect(yaml).toContain('maxParticles: 1000');
      expect(yaml).toContain('autoStart: true');
      expect(yaml).toContain('type: circle');
      expect(yaml).toContain('radius: 80');
    });

    it('should handle multiple emitters', () => {
      const config: EditorConfig = {
        system: {
          maxParticles: 2000,
          autoStart: false,
        },
        emitters: [
          {
            type: 'point',
            position: { x: 100, y: 100 },
            emissionRate: 30,
            particle: {
              type: 'sprite',
              texture: 'particle',
              lifetime: 1.5,
              behaviors: [],
            },
          } as any,
          {
            type: 'circle',
            position: { x: 200, y: 200 },
            radius: 50,
            emissionRate: 40,
            particle: {
              type: 'sprite',
              texture: 'circle',
              lifetime: 2.0,
              behaviors: [],
            },
          } as any,
        ],
      };

      const yaml = editorConfigToYAML(config);

      expect(yaml).toContain('type: point');
      expect(yaml).toContain('type: circle');
    });
  });

  describe('yamlToEditorConfig', () => {
    it('should parse YAML to editor config', () => {
      const yaml = `
system:
  maxParticles: 1500
  autoStart: false
emitters:
  - type: point
    position:
      x: 300
      y: 250
    emissionRate: 60
    particle:
      type: sprite
      texture: default
      lifetime: 2.0
      behaviors: []
`;

      const config = yamlToEditorConfig(yaml);

      expect(config.system.maxParticles).toBe(1500);
      expect(config.system.autoStart).toBe(false);
      expect(config.emitters.length).toBe(1);
      expect(config.emitters[0].type).toBe('point');
    });

    it('should use defaults for missing system config', () => {
      const yaml = `
emitters: []
`;

      const config = yamlToEditorConfig(yaml);

      expect(config.system.maxParticles).toBe(1000);
      expect(config.system.autoStart).toBe(true);
    });
  });

  describe('validateEditorConfig', () => {
    it('should pass validation for valid config', () => {
      const config: EditorConfig = {
        system: {
          maxParticles: 1000,
          autoStart: true,
        },
        emitters: [
          {
            type: 'point',
            position: { x: 100, y: 100 },
            emissionRate: 50,
            particle: {
              type: 'sprite',
              texture: 'default',
              lifetime: 2.0,
              behaviors: [],
            },
          } as any,
        ],
      };

      const result = validateEditorConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail validation for invalid maxParticles', () => {
      const config: EditorConfig = {
        system: {
          maxParticles: 0,
          autoStart: true,
        },
        emitters: [],
      };

      const result = validateEditorConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('maxParticles'))).toBe(true);
    });

    it('should fail validation for missing particle config', () => {
      const config: EditorConfig = {
        system: {
          maxParticles: 1000,
          autoStart: true,
        },
        emitters: [
          {
            type: 'point',
            position: { x: 100, y: 100 },
            emissionRate: 50,
          } as any,
        ],
      };

      const result = validateEditorConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('particle'))).toBe(true);
    });

    it('should pass validation for burst emitter without emissionRate', () => {
      const config: EditorConfig = {
        system: {
          maxParticles: 1000,
          autoStart: true,
        },
        emitters: [
          {
            type: 'burst',
            position: { x: 400, y: 300 },
            burstCount: 10,
            particle: {
              type: 'sprite',
              texture: 'default',
              lifetime: 1.0,
              behaviors: [],
            },
          } as any,
        ],
      };

      const result = validateEditorConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail validation for burst emitter missing burstCount', () => {
      const config: EditorConfig = {
        system: {
          maxParticles: 1000,
          autoStart: true,
        },
        emitters: [
          {
            type: 'burst',
            position: { x: 400, y: 300 },
            particle: {
              type: 'sprite',
              texture: 'default',
              lifetime: 1.0,
              behaviors: [],
            },
          } as any,
        ],
      };

      const result = validateEditorConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('burstCount'))).toBe(true);
    });

    it('should pass validation for triggered emitter without emissionRate', () => {
      const config: EditorConfig = {
        system: {
          maxParticles: 1000,
          autoStart: true,
        },
        emitters: [
          {
            type: 'triggered',
            position: { x: 400, y: 300 },
            particle: {
              type: 'sprite',
              texture: 'default',
              lifetime: 1.0,
              behaviors: [],
            },
          } as any,
        ],
      };

      const result = validateEditorConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('getDefaultParticleConfig', () => {
    it.each(['point', 'circle', 'area', 'line', 'polygon', 'path', 'burst', 'timed'])(
      'should include velocity behavior for %s emitter',
      (type) => {
        const particle = getDefaultParticleConfig(type);

        expect(particle.behaviors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ type: 'velocity' }),
          ]),
        );
      },
    );

    it('should not include velocity behavior for triggered emitter', () => {
      const particle = getDefaultParticleConfig('triggered');

      expect(particle.behaviors).toEqual([]);
    });

    it('should not include velocity behavior when called without an emitter type', () => {
      const particle = getDefaultParticleConfig();

      expect(particle.behaviors).toEqual([]);
    });
  });

  describe('getDefaultVelocityConfig', () => {
    it('should return radial velocity for circle emitter', () => {
      const velocity = getDefaultVelocityConfig('circle');

      expect(velocity.angle).toBeDefined();
      expect(velocity.speed).toBeDefined();
      expect(velocity.angle.min).toBe(0);
      expect(velocity.angle.max).toBeCloseTo(6.283185, 5);
    });

    it('should return upward cone for area emitter', () => {
      const velocity = getDefaultVelocityConfig('area');

      expect(velocity.angle.min).toBeLessThan(0);
      expect(velocity.angle.max).toBeGreaterThan(0);
    });

    it('should return default velocity for unknown emitter', () => {
      const velocity = getDefaultVelocityConfig('unknown');

      expect(velocity.angle).toBeDefined();
      expect(velocity.speed).toBeDefined();
    });
  });

  describe('recentreEmittersOnResize', () => {
    const makeEmitter = (overrides: Record<string, unknown>) =>
      ({
        type: 'point',
        position: { x: 400, y: 300 },
        emissionRate: 50,
        particle: { type: 'sprite', texture: 'default', lifetime: 2.0, behaviors: [] },
        ...overrides,
      } as any);

    it('should return the same reference when dimensions are unchanged', () => {
      const emitters = [makeEmitter({})];
      const result = recentreEmittersOnResize(emitters, 800, 600, 800, 600);
      expect(result).toBe(emitters);
    });

    it('should return the same reference for an empty array', () => {
      const emitters: any[] = [];
      const result = recentreEmittersOnResize(emitters, 800, 600, 1000, 800);
      expect(result).toBe(emitters);
    });

    it('should shift a point emitter position by the center delta', () => {
      // Old 800×600 → center (400,300); New 1000×800 → center (500,400)
      // Delta: (+100, +100)
      const emitters = [makeEmitter({ position: { x: 400, y: 300 } })];
      const result = recentreEmittersOnResize(emitters, 800, 600, 1000, 800);

      expect(result[0].position).toEqual({ x: 500, y: 400 });
    });

    it('should preserve an off-centre emitter relative offset', () => {
      // Emitter 100px right of old centre (400,300) → at (500,300)
      // After resize: new centre (500,400) → emitter should be at (600,400)
      const emitters = [makeEmitter({ position: { x: 500, y: 300 } })];
      const result = recentreEmittersOnResize(emitters, 800, 600, 1000, 800);

      expect(result[0].position).toEqual({ x: 600, y: 400 });
    });

    it('should shift all emitters in a multi-emitter config', () => {
      const emitters = [
        makeEmitter({ position: { x: 100, y: 100 } }),
        makeEmitter({ position: { x: 400, y: 300 } }),
      ];
      const result = recentreEmittersOnResize(emitters, 800, 600, 1000, 800);

      expect(result[0].position).toEqual({ x: 200, y: 200 });
      expect(result[1].position).toEqual({ x: 500, y: 400 });
    });

    it('should shift a line emitter start/end alongside position', () => {
      const emitters = [
        makeEmitter({
          type: 'line',
          position: { x: 400, y: 300 },
          start: { x: 300, y: 300 },
          end: { x: 500, y: 300 },
        }),
      ];
      const result = recentreEmittersOnResize(emitters, 800, 600, 1000, 800);

      expect(result[0].position).toEqual({ x: 500, y: 400 });
      expect((result[0] as any).start).toEqual({ x: 400, y: 400 });
      expect((result[0] as any).end).toEqual({ x: 600, y: 400 });
    });

    it('should shift path emitter waypoints alongside position', () => {
      const emitters = [
        makeEmitter({
          type: 'path',
          position: { x: 0, y: 0 },
          path: [
            { x: 100, y: 100 },
            { x: 300, y: 200 },
            { x: 500, y: 150 },
          ],
        }),
      ];
      const result = recentreEmittersOnResize(emitters, 800, 600, 1000, 800);

      expect(result[0].position).toEqual({ x: 100, y: 100 });
      expect((result[0] as any).path).toEqual([
        { x: 200, y: 200 },
        { x: 400, y: 300 },
        { x: 600, y: 250 },
      ]);
    });

    it('should shift path emitter "points" field as well', () => {
      const emitters = [
        makeEmitter({
          type: 'path',
          position: { x: 0, y: 0 },
          points: [
            { x: 50, y: 50 },
            { x: 150, y: 100 },
          ],
        }),
      ];
      const result = recentreEmittersOnResize(emitters, 800, 600, 1000, 800);

      expect((result[0] as any).points).toEqual([
        { x: 150, y: 150 },
        { x: 250, y: 200 },
      ]);
    });

    it('should NOT shift polygon vertices (they are position-relative)', () => {
      const vertices = [
        { x: 0, y: -50 },
        { x: 50, y: 50 },
        { x: -50, y: 50 },
      ];
      const emitters = [
        makeEmitter({
          type: 'polygon',
          position: { x: 400, y: 300 },
          vertices,
        }),
      ];
      const result = recentreEmittersOnResize(emitters, 800, 600, 1000, 800);

      expect(result[0].position).toEqual({ x: 500, y: 400 });
      // vertices must remain untouched
      expect((result[0] as any).vertices).toEqual(vertices);
    });

    it('should NOT shift area emitter width/height', () => {
      const emitters = [
        makeEmitter({
          type: 'area',
          position: { x: 400, y: 300 },
          width: 200,
          height: 100,
        }),
      ];
      const result = recentreEmittersOnResize(emitters, 800, 600, 1000, 800);

      expect(result[0].position).toEqual({ x: 500, y: 400 });
      expect((result[0] as any).width).toBe(200);
      expect((result[0] as any).height).toBe(100);
    });

    it('should NOT shift circle emitter radius', () => {
      const emitters = [
        makeEmitter({
          type: 'circle',
          position: { x: 400, y: 300 },
          radius: 80,
        }),
      ];
      const result = recentreEmittersOnResize(emitters, 800, 600, 1000, 800);

      expect(result[0].position).toEqual({ x: 500, y: 400 });
      expect((result[0] as any).radius).toBe(80);
    });

    it('should handle canvas shrinking (negative delta)', () => {
      // Old 1000×800 → centre (500,400); New 600×400 → centre (300,200)
      // Delta: (-200, -200)
      const emitters = [makeEmitter({ position: { x: 500, y: 400 } })];
      const result = recentreEmittersOnResize(emitters, 1000, 800, 600, 400);

      expect(result[0].position).toEqual({ x: 300, y: 200 });
    });

    it('should not mutate the original emitter objects', () => {
      const original = makeEmitter({ position: { x: 400, y: 300 } });
      const emitters = [original];
      recentreEmittersOnResize(emitters, 800, 600, 1000, 800);

      expect(original.position).toEqual({ x: 400, y: 300 });
    });
  });
});
