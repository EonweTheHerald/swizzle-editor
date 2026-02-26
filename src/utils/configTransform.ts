/**
 * Configuration transformation utilities
 * Converts between editor config format and Swizzle YAML format
 */

import { dump, load } from 'js-yaml';
import type { EditorConfig } from '@/store/types';
import type { EmitterConfig } from '@eonwetheherald/swizzle';

interface ParsedYamlSystemConfig {
  maxParticles?: unknown;
  autoStart?: unknown;
}

interface ParsedYamlConfig {
  system?: ParsedYamlSystemConfig;
  emitters?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isEmitterConfig(value: unknown): value is EmitterConfig {
  if (!isRecord(value)) return false;
  if (typeof value.type !== 'string') return false;
  const rateRequired = value.type !== 'burst' && value.type !== 'triggered';
  if (rateRequired && typeof value.emissionRate !== 'number') return false;
  if (!isRecord(value.position)) return false;
  if (typeof value.position.x !== 'number' || typeof value.position.y !== 'number') return false;
  return isRecord(value.particle) && typeof value.particle.type === 'string';
}

function toParsedYamlConfig(value: unknown): ParsedYamlConfig {
  if (!isRecord(value)) return {};
  return {
    system: isRecord(value.system) ? value.system : undefined,
    emitters: value.emitters,
  };
}

/**
 * Convert editor config to YAML string for Swizzle ConfigLoader
 */
export function editorConfigToYAML(config: EditorConfig): string {
  const emitters = config.emitters.map((emitter) => {
    // All field names are already canonical (vertices, path) — no translation needed.
    // Line emitter start/end are stored relative to emitter position in the editor.
    return { ...emitter } as typeof emitter & { [key: string]: unknown };
  });

  // Build YAML structure matching Swizzle's SystemConfigFile interface
  const yamlConfig = {
    system: {
      maxParticles: config.system.maxParticles,
      autoStart: config.system.autoStart,
    },
    emitters,
  };

  return dump(yamlConfig, {
    indent: 2,
    lineWidth: -1, // Don't wrap lines
    noRefs: true, // Don't use references
  });
}

/**
 * Parse YAML string back to editor config
 */
export function yamlToEditorConfig(yaml: string): EditorConfig {
  const parsed = toParsedYamlConfig(load(yaml));
  // All field names are canonical (vertices, path) — no translation needed on import.
  const emitters = Array.isArray(parsed.emitters)
    ? parsed.emitters.filter(isEmitterConfig)
    : [];

  const maxParticles =
    typeof parsed.system?.maxParticles === 'number' ? parsed.system.maxParticles : 1000;
  const autoStart = typeof parsed.system?.autoStart === 'boolean' ? parsed.system.autoStart : true;

  return {
    system: {
      maxParticles,
      autoStart,
    },
    emitters,
  };
}

/**
 * Validate editor config before conversion
 */
export function validateEditorConfig(config: EditorConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate system config
  if (!config.system) {
    errors.push('Missing system configuration');
  } else {
    if (config.system.maxParticles < 1 || config.system.maxParticles > 10000) {
      errors.push('maxParticles must be between 1 and 10000');
    }
  }

  // Validate emitters
  if (!config.emitters || !Array.isArray(config.emitters)) {
    errors.push('Emitters must be an array');
  } else if (config.emitters.length === 0) {
    // Empty emitters is valid, just won't render anything
  } else {
    config.emitters.forEach((emitter, index) => {
      if (!emitter.type) {
        errors.push(`Emitter ${index}: Missing type`);
      }
      if (!emitter.position || typeof emitter.position.x !== 'number' || typeof emitter.position.y !== 'number') {
        errors.push(`Emitter ${index}: Invalid position`);
      }
      const rateRequired = emitter.type !== 'burst' && emitter.type !== 'triggered';
      if (rateRequired && (typeof emitter.emissionRate !== 'number' || emitter.emissionRate < 0)) {
        errors.push(`Emitter ${index}: Invalid emissionRate`);
      }
      if (emitter.type === 'burst') {
        const burstCount = (emitter as EmitterConfig & { burstCount?: unknown }).burstCount;
        if (typeof burstCount !== 'number' || burstCount < 1) {
          errors.push(`Emitter ${index}: burstCount must be a number >= 1`);
        }
      }
      if (!emitter.particle) {
        errors.push(`Emitter ${index}: Missing particle configuration`);
      } else {
        if (!emitter.particle.type) {
          errors.push(`Emitter ${index}: Missing particle type`);
        }
        if (!emitter.particle.lifetime) {
          errors.push(`Emitter ${index}: Missing particle lifetime`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default particle config for an emitter type
 */
export function getDefaultParticleConfig() {
  return {
    type: 'sprite' as const,
    texture: 'default',
    lifetime: { min: 1.0, max: 2.0 },
    behaviors: [],
  };
}

/**
 * Get default velocity config for an emitter type
 */
export function getDefaultVelocityConfig(emitterType: string) {
  switch (emitterType) {
    case 'circle':
      return {
        mode: 'radial' as const,
        angle: { min: 0, max: 6.283185 }, // 0 to 2π
        speed: { min: 100, max: 200 },
      };
    case 'point':
      return {
        mode: 'radial' as const,
        angle: { min: 0, max: 6.283185 },
        speed: { min: 150, max: 250 },
      };
    case 'area':
      return {
        mode: 'radial' as const,
        angle: { min: -0.785398, max: 0.785398 }, // -45° to 45° (upward cone)
        speed: { min: 100, max: 200 },
      };
    case 'line':
      return {
        mode: 'radial' as const,
        angle: { min: -1.570796, max: -1.570796 }, // 90° upward
        speed: { min: 100, max: 200 },
      };
    case 'burst':
      return {
        mode: 'radial' as const,
        angle: { min: 0, max: 6.283185 }, // Full radial burst
        speed: { min: 150, max: 300 },
      };
    default:
      return {
        mode: 'radial' as const,
        angle: { min: 0, max: 6.283185 },
        speed: { min: 100, max: 200 },
      };
  }
}
