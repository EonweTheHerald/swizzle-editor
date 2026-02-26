/**
 * LayerList - Manage emitter layers with drag-drop, visibility, and naming
 */

import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Copy, Eye, EyeOff, Edit2, Check, X, GripVertical } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import type { EmitterConfig } from '@eonwetheherald/swizzle';
import {
  getDefaultParticleConfig,
  getDefaultVelocityConfig,
} from '@/utils/configTransform';
import { toast } from 'sonner';

type EmitterType =
  | 'point'
  | 'area'
  | 'circle'
  | 'line'
  | 'polygon'
  | 'path'
  | 'burst'
  | 'timed'
  | 'triggered';

type LayerEmitter = EmitterConfig & {
  name?: string;
  radius?: number;
  edgeEmit?: boolean;
  width?: number;
  height?: number;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  points?: Array<{ x: number; y: number }>;
};

const EMITTER_TYPES: ReadonlyArray<{ value: EmitterType; label: string }> = [
  { value: 'point', label: 'Point Emitter' },
  { value: 'area', label: 'Area Emitter' },
  { value: 'circle', label: 'Circle Emitter' },
  { value: 'line', label: 'Line Emitter' },
  { value: 'polygon', label: 'Polygon Emitter' },
  { value: 'path', label: 'Path Emitter' },
  { value: 'burst', label: 'Burst Emitter' },
  { value: 'timed', label: 'Timed Emitter' },
  { value: 'triggered', label: 'Triggered Emitter' },
];

export function LayerList() {
  const {
    config,
    ui,
    addEmitter,
    removeEmitter,
    duplicateEmitter,
    selectEmitter,
    reorderEmitters,
    toggleEmitterVisibility,
    renameEmitter,
  } = useEditorStore();
  const { emitters } = config;
  const { selectedEmitterIndex, hiddenEmitterIndices } = ui;

  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const getViewportCenter = () => {
    const viewport = document.querySelector('.canvas-container');
    const rect = viewport?.getBoundingClientRect();

    const width =
      rect && rect.width > 0
        ? rect.width
        : ui.canvasWidth > 0
        ? ui.canvasWidth
        : 800;
    const height =
      rect && rect.height > 0
        ? rect.height
        : ui.canvasHeight > 0
        ? ui.canvasHeight
        : 600;

    return {
      x: Math.round(width / 2),
      y: Math.round(height / 2),
    };
  };

  const handleAddEmitter = (type: EmitterType) => {
    const { x: cx, y: cy } = getViewportCenter();

    // Create default emitter config based on type
    const defaultEmitter: LayerEmitter = {
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Emitter`,
      position: { x: cx, y: cy },
      ...(type !== 'burst' && type !== 'triggered' && { emissionRate: 50 }),
      particle: getDefaultParticleConfig(type),
      velocity: getDefaultVelocityConfig(type),
    };

    // Add type-specific defaults
    switch (type) {
      case 'circle':
        defaultEmitter.radius = 80;
        defaultEmitter.edgeEmit = false;
        break;
      case 'area':
        defaultEmitter.width = 200;
        defaultEmitter.height = 100;
        break;
      case 'line':
        defaultEmitter.start = { x: cx - 100, y: cy };
        defaultEmitter.end = { x: cx + 100, y: cy };
        break;
      case 'polygon':
        defaultEmitter.vertices = [
          { x: 0, y: -50 },
          { x: 50, y: 50 },
          { x: -50, y: 50 },
        ];
        break;
      case 'path':
        defaultEmitter.path = [
          { x: cx - 100, y: cy },
          { x: cx, y: cy - 50 },
          { x: cx + 100, y: cy },
        ];
        break;
      case 'burst':
        defaultEmitter.burstCount = 10;
        defaultEmitter.burstInterval = 1.0;
        defaultEmitter.burstLimit = -1;
        break;
      case 'triggered':
        defaultEmitter.particlesPerTrigger = 10;
        break;
    }

    addEmitter(defaultEmitter);
    toast.success(`Added ${defaultEmitter.name}`);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    reorderEmitters(startIndex, endIndex);
  };

  const handleStartRename = (index: number, currentName: string) => {
    setEditingNameIndex(index);
    setEditingName(currentName);
  };

  const handleSaveRename = () => {
    if (editingNameIndex !== null && editingName.trim()) {
      renameEmitter(editingNameIndex, editingName.trim());
      toast.success('Layer renamed');
    }
    setEditingNameIndex(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingNameIndex(null);
    setEditingName('');
  };

  const getEmitterDisplayName = (emitter: EmitterConfig, index: number) => {
    const customName = typeof emitter.name === 'string' ? emitter.name : undefined;
    return (
      customName ||
      `${emitter.type.charAt(0).toUpperCase() + emitter.type.slice(1)} Emitter ${index + 1}`
    );
  };

  return (
    <div className="space-y-3">
      {/* Add Layer Button */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4" />
            Add Layer
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[220px] bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] rounded-md shadow-lg p-1 z-50"
            sideOffset={5}
          >
            {EMITTER_TYPES.map((type) => (
              <DropdownMenu.Item
                key={type.value}
                className="px-3 py-2 text-[var(--text-sm)] cursor-pointer hover:bg-[var(--surface-hover)] rounded-sm outline-none transition-colors"
                onSelect={() => handleAddEmitter(type.value)}
              >
                {type.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Layer List with Drag-Drop */}
      {emitters.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-[var(--border)] rounded">
          <p className="text-[var(--text-sm)] text-[var(--text-dimmed)] mb-1">No layers</p>
          <p className="text-[var(--text-xs)] text-[var(--text-dimmed)]">
            Add an emitter to begin
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="layers">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                {emitters.map((emitter, index) => {
                  const isHidden = hiddenEmitterIndices.has(index);
                  const isEditing = editingNameIndex === index;
                  const displayName = getEmitterDisplayName(emitter, index);

                  return (
                    <Draggable key={index} draggableId={`layer-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group px-2 py-1.5 border rounded transition-all ${
                            snapshot.isDragging
                              ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-md'
                              : selectedEmitterIndex === index
                              ? 'border-[var(--accent)] bg-[var(--surface-active)]'
                              : 'border-transparent hover:bg-[var(--surface-hover)]'
                          } ${isHidden ? 'opacity-40' : ''}`}
                          onClick={() => !isEditing && selectEmitter(index)}
                        >
                          <div className="flex items-center gap-2">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing flex-shrink-0"
                            >
                              <GripVertical className="h-4 w-4 text-[var(--text-dimmed)]" />
                            </div>

                            {/* Layer Name */}
                            <div className="flex-1 min-w-0">
                              {isEditing ? (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveRename();
                                      if (e.key === 'Escape') handleCancelRename();
                                    }}
                                    className="h-7 text-xs"
                                    autoFocus
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 flex-shrink-0"
                                    onClick={handleSaveRename}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 flex-shrink-0"
                                    onClick={handleCancelRename}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div className="text-[var(--text-sm)] font-medium truncate text-[var(--text)]">
                                    {displayName}
                                  </div>
                                  <div className="text-[var(--text-xs)] text-[var(--text-dimmed)]">
                                    {emitter.particle.behaviors?.length || 0} behavior{(emitter.particle.behaviors?.length || 0) !== 1 ? 's' : ''}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Actions */}
                            {!isEditing && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Visibility Toggle */}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleEmitterVisibility(index);
                                  }}
                                  title={isHidden ? 'Show layer' : 'Hide layer'}
                                >
                                  {isHidden ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>

                                {/* Rename */}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartRename(index, displayName);
                                  }}
                                  title="Rename layer"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>

                                {/* Duplicate */}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateEmitter(index);
                                    toast.success('Layer duplicated');
                                  }}
                                  title="Duplicate (Ctrl+D)"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>

                                {/* Delete */}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete ${displayName}?`)) {
                                      removeEmitter(index);
                                      toast.success('Layer deleted');
                                    }
                                  }}
                                  title="Delete (Del)"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

    </div>
  );
}
