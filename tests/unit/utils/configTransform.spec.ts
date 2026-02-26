import { describe, it, expect } from 'vitest';
import {
  editorConfigToYAML,
  yamlToEditorConfig,
  validateEditorConfig,
  getDefaultVelocityConfig,
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
});
