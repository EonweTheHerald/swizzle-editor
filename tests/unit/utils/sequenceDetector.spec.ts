import { describe, it, expect } from 'vitest';
import {
  detectSequence,
  autoDetectSequences,
  validateSequence,
} from '../../../src/utils/sequenceDetector';

describe('sequenceDetector', () => {
  // Helper to create mock File objects
  const createMockFile = (name: string): File => {
    return new File([], name, { type: 'image/png' });
  };

  describe('detectSequence', () => {
    it('should detect a simple numbered sequence', () => {
      const files = [
        createMockFile('coin_000.png'),
        createMockFile('coin_001.png'),
        createMockFile('coin_002.png'),
      ];

      const result = detectSequence(files);

      expect(result).toBeDefined();
      expect(result?.baseName).toBe('coin');
      expect(result?.startFrame).toBe(0);
      expect(result?.endFrame).toBe(2);
      expect(result?.padding).toBe(3);
      expect(result?.pattern).toBe('coin_{000-002}.png');
      expect(result?.files.length).toBe(3);
    });

    it('should detect sequence with different padding', () => {
      const files = [
        createMockFile('sprite01.png'),
        createMockFile('sprite02.png'),
        createMockFile('sprite03.png'),
      ];

      const result = detectSequence(files);

      expect(result).toBeDefined();
      expect(result?.baseName).toBe('sprite');
      expect(result?.padding).toBe(2);
      expect(result?.pattern).toBe('sprite{01-03}.png');
    });

    it('should detect gaps in sequence', () => {
      const files = [
        createMockFile('frame_00.png'),
        createMockFile('frame_01.png'),
        // Missing frame_02.png
        createMockFile('frame_03.png'),
        createMockFile('frame_04.png'),
      ];

      const result = detectSequence(files);

      expect(result).toBeDefined();
      expect(result?.gaps).toEqual([2]);
    });

    it('should return null for single file', () => {
      const files = [createMockFile('single.png')];
      const result = detectSequence(files);
      expect(result).toBeNull();
    });

    it('should return null for non-numbered files', () => {
      const files = [createMockFile('image1.png'), createMockFile('photo2.png')];
      const result = detectSequence(files);
      expect(result).toBeNull();
    });

    it('should handle files without underscores', () => {
      const files = [
        createMockFile('particle0.png'),
        createMockFile('particle1.png'),
        createMockFile('particle2.png'),
      ];

      const result = detectSequence(files);

      expect(result).toBeDefined();
      expect(result?.baseName).toBe('particle');
      expect(result?.pattern).toBe('particle{0-2}.png');
    });
  });

  describe('autoDetectSequences', () => {
    it('should separate sequences from individual files', () => {
      const files = [
        createMockFile('coin_00.png'),
        createMockFile('coin_01.png'),
        createMockFile('coin_02.png'),
        createMockFile('particle.png'),
        createMockFile('background.png'),
      ];

      const result = autoDetectSequences(files);

      expect(result.sequences.length).toBe(1);
      expect(result.sequences[0].baseName).toBe('coin');
      expect(result.individualFiles.length).toBe(2);
    });

    it('should return all as individual if no sequence detected', () => {
      const files = [createMockFile('image1.png'), createMockFile('photo2.png')];

      const result = autoDetectSequences(files);

      expect(result.sequences.length).toBe(0);
      expect(result.individualFiles.length).toBe(2);
    });
  });

  describe('validateSequence', () => {
    it('should pass validation for complete sequence', () => {
      const sequence = {
        baseName: 'coin',
        pattern: 'coin_{00-02}.png',
        startFrame: 0,
        endFrame: 2,
        padding: 2,
        gaps: [],
        files: [createMockFile('coin_00.png'), createMockFile('coin_01.png'), createMockFile('coin_02.png')],
      };

      const result = validateSequence(sequence);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });

    it('should warn about gaps', () => {
      const sequence = {
        baseName: 'coin',
        pattern: 'coin_{00-03}.png',
        startFrame: 0,
        endFrame: 3,
        padding: 2,
        gaps: [2],
        files: [createMockFile('coin_00.png'), createMockFile('coin_01.png'), createMockFile('coin_03.png')],
      };

      const result = validateSequence(sequence);

      // Gaps produce warnings but the sequence is still valid (usable).
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Missing frames');
    });

    it('should warn about insufficient frames', () => {
      const sequence = {
        baseName: 'coin',
        pattern: 'coin_{0-1}.png',
        startFrame: 0,
        endFrame: 1,
        padding: 1,
        gaps: [],
        files: [createMockFile('coin_0.png')],
      };

      const result = validateSequence(sequence);

      expect(result.valid).toBe(false);
      expect(result.warnings.some((w) => w.includes('Expected'))).toBe(true);
    });
  });
});
