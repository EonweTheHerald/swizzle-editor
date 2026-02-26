import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-7 w-full rounded-[var(--radius-sm)] border border-[var(--border)]',
          'bg-[var(--bg-deep)] px-2 py-1 text-[var(--text-sm)] text-[var(--text)]',
          'font-mono tabular-nums',
          'transition-colors',
          'placeholder:text-[var(--text-dimmed)]',
          'hover:border-[var(--text-dimmed)]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)] focus-visible:border-[var(--accent)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
