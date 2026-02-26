/**
 * ExamplesGallery — browsable gallery of built-in particle effect templates.
 *
 * Responsibilities:
 *  • Renders a filterable list of example cards
 *  • Handles "Load" action with unsaved-changes confirmation
 *  • Pushes selected config into the editor store via yamlToEditorConfig()
 *  • Optionally shows a detail view for the selected example
 */

import { useState, useMemo } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { yamlToEditorConfig } from '@/utils/configTransform';
import {
  EXAMPLE_DEFINITIONS,
  type ExampleDefinition,
} from '@/data/exampleDefinitions';
import { toast } from 'sonner';
import {
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Search,
  Layers,
  Zap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Unique emitter types across all examples — for filter chips */
const ALL_EMITTER_TYPES = Array.from(
  new Set(EXAMPLE_DEFINITIONS.flatMap((e) => e.emitterTypes)),
).sort();

/** Human-readable labels for the tag color variants */
const TAG_COLOR_MAP: Record<string, string> = {
  primary: 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]',
  destructive: 'bg-[var(--destructive-muted)] text-[var(--destructive)] border-[var(--destructive)]',
  accent: 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]',
  muted: 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]',
};

// ── Gallery Component ────────────────────────────────────────────────────────

export function ExamplesGallery() {
  const [search, setSearch] = useState('');
  const [emitterFilter, setEmitterFilter] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  // ── Filtering ────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    return EXAMPLE_DEFINITIONS.filter((ex) => {
      // Text search across name, description, behaviors, tags
      if (lowerSearch) {
        const haystack = [
          ex.name,
          ex.description,
          ...ex.behaviors,
          ...ex.tags.map((t) => t.label),
          ...ex.emitterTypes,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(lowerSearch)) return false;
      }

      // Emitter type chip filter
      if (emitterFilter && !ex.emitterTypes.includes(emitterFilter)) {
        return false;
      }

      return true;
    });
  }, [search, emitterFilter]);

  // ── Detail view ──────────────────────────────────────────────────────

  const detailExample = detailId
    ? EXAMPLE_DEFINITIONS.find((e) => e.id === detailId)
    : null;

  if (detailExample) {
    return (
      <ExampleDetail
        example={detailExample}
        onBack={() => setDetailId(null)}
      />
    );
  }

  // ── List view ────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
        <Input
          placeholder="Search effects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>

      {/* Emitter type filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setEmitterFilter(null)}
          className={`example-filter-chip ${
            emitterFilter === null ? 'example-filter-chip--active' : ''
          }`}
        >
          ALL
        </button>
        {ALL_EMITTER_TYPES.map((type) => (
          <button
            key={type}
            onClick={() =>
              setEmitterFilter(emitterFilter === type ? null : type)
            }
            className={`example-filter-chip ${
              emitterFilter === type ? 'example-filter-chip--active' : ''
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="text-[var(--text-xs)] text-[var(--text-dimmed)]">
        {filtered.length} / {EXAMPLE_DEFINITIONS.length} effects
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--text-muted)]">
            <Sparkles className="h-6 w-6 mx-auto mb-2 opacity-40" />
            No matching effects
          </div>
        ) : (
          filtered.map((example) => (
            <ExampleCard
              key={example.id}
              example={example}
              onSelect={() => setDetailId(example.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────

interface ExampleCardProps {
  example: ExampleDefinition;
  onSelect: () => void;
}

function ExampleCard({ example, onSelect }: ExampleCardProps) {
  return (
    <button
      onClick={onSelect}
      className="example-card group w-full text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
            {example.name}
          </h4>
          <p className="text-[11px] text-[var(--text-muted)] leading-snug mt-0.5 line-clamp-2">
            {example.description}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0 mt-0.5" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        {example.emitterTypes.map((type, i) => (
          <span
            key={`e-${i}`}
            className="example-tag bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]"
          >
            <Layers className="h-2.5 w-2.5" />
            {type}
          </span>
        ))}
        {example.tags.map((tag, i) => (
          <span
            key={`t-${i}`}
            className={`example-tag ${TAG_COLOR_MAP[tag.color] ?? TAG_COLOR_MAP.muted}`}
          >
            {tag.label}
          </span>
        ))}
      </div>
    </button>
  );
}

// ── Detail ───────────────────────────────────────────────────────────────────

interface ExampleDetailProps {
  example: ExampleDefinition;
  onBack: () => void;
}

function ExampleDetail({ example, onBack }: ExampleDetailProps) {
  const { ui, loadConfig, setPreviewState } = useEditorStore();

  const handleLoad = () => {
    if (ui.hasUnsavedChanges) {
      if (
        !confirm(
          'You have unsaved changes. Loading this example will replace your current configuration. Continue?',
        )
      ) {
        return;
      }
    }

    try {
      const config = yamlToEditorConfig(example.yaml);
      loadConfig(config, { textures: new Map(), sequences: new Map() });
      setPreviewState('playing');
      toast.success(`Loaded "${example.name}"`, {
        description: 'Configuration applied — preview is playing.',
      });
    } catch (err) {
      toast.error('Failed to load example', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors self-start"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="text-[var(--text-xs)] text-[var(--text-dimmed)]">Back to gallery</span>
      </button>

      {/* Header */}
      <div>
        <h3
          className="text-base font-semibold text-[var(--text-strong)]"
        >
          {example.name}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
          {example.details}
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-3">
        {/* Emitter types */}
        <div>
          <span className="text-[var(--text-xs)] text-[var(--text-muted)] block mb-1">
            Emitter Types
          </span>
          <div className="flex flex-wrap gap-1">
            {example.emitterTypes.map((type, i) => (
              <span
                key={i}
                className="example-tag bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]"
              >
                <Layers className="h-2.5 w-2.5" />
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Behaviors */}
        <div>
          <span className="text-[var(--text-xs)] text-[var(--text-muted)] block mb-1">
            Behaviors
          </span>
          <div className="flex flex-wrap gap-1">
            {example.behaviors.map((b, i) => (
              <span
                key={i}
                className="example-tag bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]"
              >
                <Zap className="h-2.5 w-2.5" />
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <span className="text-[var(--text-xs)] text-[var(--text-muted)] block mb-1">
            Features
          </span>
          <div className="flex flex-wrap gap-1">
            {example.tags.map((tag, i) => (
              <span
                key={i}
                className={`example-tag ${TAG_COLOR_MAP[tag.color] ?? TAG_COLOR_MAP.muted}`}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Load button */}
      <button onClick={handleLoad} className="example-load-btn mt-auto">
        <Sparkles className="h-4 w-4" />
        LOAD INTO EDITOR
      </button>
    </div>
  );
}
