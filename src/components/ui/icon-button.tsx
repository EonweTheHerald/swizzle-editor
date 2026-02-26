import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const iconButtonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'transition-colors select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]',
        active:
          'text-[var(--accent)] bg-[var(--accent-muted)] hover:bg-[var(--accent-muted)]',
        ghost:
          'text-[var(--text-dimmed)] hover:text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
        destructive:
          'text-[var(--text-muted)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10',
      },
      size: {
        default: 'h-7 w-7 rounded-[var(--radius-sm)]',
        sm:      'h-6 w-6 rounded-[var(--radius-xs)]',
        xs:      'h-5 w-5 rounded-[var(--radius-xs)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(iconButtonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
