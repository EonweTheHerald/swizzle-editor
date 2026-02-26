/**
 * Sequence detection for animated sprite frames
 * Automatically detects numbered image sequences
 */

import { generateId } from '../lib/utils';
import type { TextureAsset, SequenceAsset } from '../store/types';

export interface SequenceInfo {
  baseName: string;
  pattern: string;
  startFrame: number;
  endFrame: number;
  padding: number;
  gaps: number[];
  files: File[];
}

/**
 * Extract frame number from filename
 * Examples:
 *   "coin_000.png" → { base: "coin_", number: 0, padding: 3 }
 *   "particle_01.png" → { base: "particle_", number: 1, padding: 2 }
 *   "sprite10.png" → { base: "sprite", number: 10, padding: 0 }
 */
function extractFrameInfo(filename: string): {
  base: string;
  number: number;
  padding: number;
  extension: string;
} | null {
  // Match patterns like: name_000.png, name_00.png, name0.png, etc.
  const match = filename.match(/^(.+?)_?(\d+)\.([^.]+)$/);
  if (!match) return null;

  const [, base, numberStr, extension] = match;
  const number = parseInt(numberStr, 10);
  const padding = numberStr.length;

  return {
    base: base + (filename.includes('_') ? '_' : ''),
    number,
    padding,
    extension,
  };
}

/**
 * Detect if files form a sequence
 */
export function detectSequence(files: File[]): SequenceInfo | null {
  if (files.length < 2) return null;

  // Extract frame info from all files
  const frameInfos = files
    .map((file) => ({
      file,
      info: extractFrameInfo(file.name),
    }))
    .filter((item) => item.info !== null);

  if (frameInfos.length < 2) return null;

  // Group by base name and extension
  const groups = new Map<string, typeof frameInfos>();
  for (const item of frameInfos) {
    const key = `${item.info!.base}_${item.info!.extension}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  // Find the largest group
  let largestGroup: typeof frameInfos = [];
  for (const group of groups.values()) {
    if (group.length > largestGroup.length) {
      largestGroup = group;
    }
  }

  if (largestGroup.length < 2) return null;

  // Sort by frame number
  largestGroup.sort((a, b) => a.info!.number - b.info!.number);

  const firstInfo = largestGroup[0].info!;
  const lastInfo = largestGroup[largestGroup.length - 1].info!;

  // Find gaps in sequence
  const gaps: number[] = [];
  const frameNumbers = new Set(largestGroup.map((item) => item.info!.number));
  for (let i = firstInfo.number + 1; i < lastInfo.number; i++) {
    if (!frameNumbers.has(i)) {
      gaps.push(i);
    }
  }

  // Determine padding (use the most common padding)
  const paddingCounts = new Map<number, number>();
  for (const item of largestGroup) {
    const padding = item.info!.padding;
    paddingCounts.set(padding, (paddingCounts.get(padding) || 0) + 1);
  }
  let maxPadding = 0;
  let maxCount = 0;
  for (const [padding, count] of paddingCounts) {
    if (count > maxCount) {
      maxCount = count;
      maxPadding = padding;
    }
  }

  // Generate pattern string
  const startStr = firstInfo.number.toString().padStart(maxPadding, '0');
  const endStr = lastInfo.number.toString().padStart(maxPadding, '0');
  const pattern = `${firstInfo.base}{${startStr}-${endStr}}.${firstInfo.extension}`;

  return {
    baseName: firstInfo.base.replace(/_$/, ''),
    pattern,
    startFrame: firstInfo.number,
    endFrame: lastInfo.number,
    padding: maxPadding,
    gaps,
    files: largestGroup.map((item) => item.file),
  };
}

/**
 * Create a SequenceAsset from detected sequence
 */
export function createSequenceAsset(
  sequence: SequenceInfo,
  textureAssets: TextureAsset[]
): SequenceAsset {
  // Find matching texture assets
  const frameTextures = sequence.files
    .map((file) => textureAssets.find((asset) => asset.file === file))
    .filter((asset): asset is TextureAsset => asset !== undefined);

  return {
    id: generateId(),
    name: sequence.baseName,
    pattern: sequence.pattern,
    frames: frameTextures,
    createdAt: Date.now(),
  };
}

/**
 * Auto-detect sequences from a list of files
 * Returns sequences and remaining individual files
 */
export function autoDetectSequences(files: File[]): {
  sequences: SequenceInfo[];
  individualFiles: File[];
} {
  const sequences: SequenceInfo[] = [];
  const processedFiles = new Set<File>();

  // Try to detect sequences
  const sequence = detectSequence(files);
  if (sequence) {
    sequences.push(sequence);
    sequence.files.forEach((file) => processedFiles.add(file));
  }

  // Remaining files are individuals
  const individualFiles = files.filter((file) => !processedFiles.has(file));

  return { sequences, individualFiles };
}

/**
 * Validate sequence integrity
 */
export function validateSequence(sequence: SequenceInfo): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check for gaps
  if (sequence.gaps.length > 0) {
    warnings.push(
      `Missing frames: ${sequence.gaps.join(', ')} (${sequence.gaps.length} gaps)`
    );
  }

  // Check frame count
  const expectedFrames = sequence.endFrame - sequence.startFrame + 1;
  const actualFrames = sequence.files.length;
  if (actualFrames < expectedFrames) {
    warnings.push(
      `Expected ${expectedFrames} frames, found ${actualFrames}`
    );
  }

  // Check minimum frame count
  if (actualFrames < 2) {
    warnings.push('Sequence has less than 2 frames');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
