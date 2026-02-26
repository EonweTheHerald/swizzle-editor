import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className }: SearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className={cn('relative', className)}>
      <Search
        className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-dimmed)] pointer-events-none"
        size={12}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-6 pl-6 pr-6 rounded-[var(--radius-sm)]',
          'border border-[var(--border)] bg-[var(--bg-deep)]',
          'text-[var(--text-xs)] text-[var(--text)]',
          'placeholder:text-[var(--text-dimmed)]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)]',
          'transition-colors'
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); inputRef.current?.focus(); }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--text-dimmed)] hover:text-[var(--text)] transition-colors"
          aria-label="Clear search"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
