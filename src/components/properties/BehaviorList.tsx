/**
 * BehaviorList - Manage particle behaviors with CRUD operations
 * Uses BEHAVIOR_REGISTRY as single source of truth for behavior types and defaults.
 */

import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical, ChevronRight } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { BehaviorForm } from './BehaviorForm';
import { BEHAVIOR_REGISTRY } from '@/types/behaviorTypes';
import type { BehaviorConfig } from '@eonwetheherald/swizzle';
import { toast } from 'sonner';

interface BehaviorListProps {
  emitterIndex: number;
}

export function BehaviorList({ emitterIndex }: BehaviorListProps) {
  const { config, addBehavior, removeBehavior } = useEditorStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const emitter = config.emitters[emitterIndex];
  const behaviors = emitter?.particle.behaviors || [];

  const handleAddBehavior = (type: string) => {
    const entry = BEHAVIOR_REGISTRY.find((b) => b.value === type);
    const defaultConfig = entry?.defaultConfig ?? ({ type, priority: 50 } as BehaviorConfig);
    addBehavior(emitterIndex, defaultConfig);
    setEditingIndex(behaviors.length); // Edit newly added behavior
    toast.success(`Added ${entry?.label ?? type} behavior`);
  };

  const handleRemoveBehavior = (behaviorIndex: number) => {
    const behavior = behaviors[behaviorIndex];
    if (!confirm(`Remove ${behavior.type} behavior?`)) return;
    removeBehavior(emitterIndex, behaviorIndex);
    setEditingIndex(null);
    toast.success(`Removed ${behavior.type} behavior`);
  };

  const getBehaviorLabel = (type: string) =>
    BEHAVIOR_REGISTRY.find((b) => b.value === type)?.label ?? type;

  return (
    <div className="space-y-4">
      {/* Add Behavior Button */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4" />
            Add Behavior
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[220px] bg-[var(--surface-2)] text-[var(--text)] rounded-md border border-[var(--border)] shadow-lg p-1 max-h-[400px] overflow-y-auto z-50"
            sideOffset={5}
          >
            {(['Physics', 'Visual', 'Advanced'] as const).map((category) => (
              <div key={category}>
                <DropdownMenu.Label className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">
                  {category}
                </DropdownMenu.Label>
                {BEHAVIOR_REGISTRY.filter((b) => b.category === category).map((entry) => (
                  <DropdownMenu.Item
                    key={entry.value}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-[var(--surface-hover)] rounded-sm outline-none"
                    onSelect={() => handleAddBehavior(entry.value)}
                  >
                    {entry.label}
                  </DropdownMenu.Item>
                ))}
              </div>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Behavior List */}
      {behaviors.length === 0 ? (
        <div className="text-sm text-[var(--text-muted)] text-center py-8 border border-dashed border-[var(--border)] rounded">
          No behaviors yet. Add one to affect particles.
        </div>
      ) : (
        <div className="space-y-2">
          {behaviors.map((behavior, index) => (
            <div
              key={index}
              className={`border rounded transition-colors ${
                editingIndex === index
                  ? 'border-[var(--accent)] bg-[var(--accent-muted)]'
                  : 'border-[var(--border)] hover:bg-[var(--surface-3)]'
              }`}
            >
              {/* Behavior Header */}
              <div
                className="flex items-center gap-2 p-3 cursor-pointer"
                onClick={() => setEditingIndex(editingIndex === index ? null : index)}
              >
                <GripVertical className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{getBehaviorLabel(behavior.type)}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Priority: {(behavior as BehaviorConfig & { priority?: number }).priority ?? 'default'}
                  </div>
                </div>
                <ChevronRight
                  className={`h-3.5 w-3.5 text-[var(--text-dimmed)] flex-shrink-0 transition-transform duration-150 ${
                    editingIndex === index ? 'rotate-90' : ''
                  }`}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveBehavior(index);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Behavior Form (when editing) */}
              {editingIndex === index && (
                <div className="border-t border-[var(--border)] p-3">
                  <BehaviorForm
                    emitterIndex={emitterIndex}
                    behaviorIndex={index}
                    behavior={behavior}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {behaviors.length > 0 && (
        <div className="text-xs text-[var(--text-muted)] p-2 bg-[var(--surface-2)] rounded">
          <strong>Tip:</strong> Behaviors execute in priority order. Lower numbers = higher priority.
        </div>
      )}
    </div>
  );
}
