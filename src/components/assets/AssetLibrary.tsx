import { useRef, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Layers } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import {
  autoDetectSequences,
  createSequenceAsset,
  validateSequence,
} from '@/utils/sequenceDetector';
import type { TextureAsset } from '@/store/types';

export function AssetLibrary() {
  const { assets, addTexture, removeTexture, addSequence, removeSequence } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Auto-detect sequences if multiple files
      const { sequences, individualFiles } = autoDetectSequences(files);

      // Process individual files first
      const textureAssets: TextureAsset[] = [];
      for (const file of individualFiles) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        try {
          const dataURL = await readFileAsDataURL(file);
          const { width, height } = await getImageDimensions(dataURL);

          const texture: TextureAsset = {
            id: generateId(),
            name: file.name,
            file,
            dataURL,
            width,
            height,
            createdAt: Date.now(),
          };

          await addTexture(texture);
          textureAssets.push(texture);
        } catch (error) {
          toast.error(`Failed to load ${file.name}`);
          console.error(error);
        }
      }

      if (individualFiles.length > 0) {
        toast.success(`Added ${individualFiles.length} texture(s)`);
      }

      // Process sequences
      for (const sequence of sequences) {
        // First, create texture assets for sequence frames
        const sequenceTextures: TextureAsset[] = [];
        for (const file of sequence.files) {
          try {
            const dataURL = await readFileAsDataURL(file);
            const { width, height } = await getImageDimensions(dataURL);

            const texture: TextureAsset = {
              id: generateId(),
              name: file.name,
              file,
              dataURL,
              width,
              height,
              createdAt: Date.now(),
            };

            await addTexture(texture);
            sequenceTextures.push(texture);
            textureAssets.push(texture);
          } catch (error) {
            console.error(`Failed to load sequence frame ${file.name}:`, error);
          }
        }

        // Create sequence asset
        const sequenceAsset = createSequenceAsset(sequence, sequenceTextures);

        // Validate sequence
        const validation = validateSequence(sequence);
        if (!validation.valid) {
          validation.warnings.forEach((warning) => toast.warning(warning));
        }

        await addSequence(sequenceAsset);
        toast.success(
          `Detected sequence: ${sequence.baseName} (${sequence.files.length} frames)`
        );
      }
    } finally {
      setIsUploading(false);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await removeTexture(id);
      toast.success(`Deleted ${name}`);
    } catch (error) {
      toast.error(`Failed to delete ${name}`);
      console.error(error);
    }
  };

  const handleDeleteSequence = async (id: string, name: string) => {
    if (!confirm(`Delete sequence ${name}? (Individual frames will remain)`)) return;
    try {
      await removeSequence(id);
      toast.success(`Deleted sequence ${name}`);
    } catch (error) {
      toast.error(`Failed to delete sequence ${name}`);
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFileSelect(e);
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload Assets'}
        </Button>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Upload multiple numbered files to auto-detect sequences
        </p>
      </div>

      {/* Texture Grid */}
      {assets.textures.size === 0 ? (
        <div className="text-sm text-[var(--text-muted)] text-center py-8">
          No assets yet. Upload some images to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {Array.from(assets.textures.values()).map((texture) => (
            <div
              key={texture.id}
              className="relative border border-[var(--border)] rounded overflow-hidden group"
            >
              <div className="aspect-square bg-[var(--surface-2)] flex items-center justify-center">
                <img
                  src={texture.dataURL}
                  alt={texture.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="p-2 bg-[var(--surface)]">
                <div className="text-xs font-medium truncate" title={texture.name}>
                  {texture.name}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                </div>
              </div>
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  void handleDelete(texture.id, texture.name);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Sequences Section */}
      {assets.sequences.size > 0 && (
        <>
          <div className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mt-6">
            Sequences
          </div>
          <div className="space-y-2">
            {Array.from(assets.sequences.values()).map((sequence) => (
              <div
                key={sequence.id}
                className="p-3 border border-[var(--border)] rounded bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Layers className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{sequence.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => {
                      void handleDeleteSequence(sequence.id, sequence.name);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Helper functions
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataURL: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataURL;
  });
}
