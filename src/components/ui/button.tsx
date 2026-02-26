import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap',
    'font-medium transition-colors select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]',
    'disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:brightness-90',
        destructive:
          'bg-[var(--destructive)] text-white hover:bg-[var(--destructive-hover)] active:brightness-90',
        outline:
          'border border-[var(--border)] bg-transparent text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--text-dimmed)]',
        secondary:
          'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-3)]',
        ghost:
          'bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
        link:
          'text-[var(--accent)] underline-offset-4 hover:underline bg-transparent',
      },
      size: {
        default: 'h-7 px-3 text-[var(--text-xs)] rounded-[var(--radius-sm)]',
        sm:      'h-6 px-2 text-[10px] rounded-[var(--radius-xs)]',
        lg:      'h-9 px-4 text-[var(--text-sm)] rounded-[var(--radius-md)]',
        icon:    'h-7 w-7 rounded-[var(--radius-sm)]',
        'icon-sm': 'h-6 w-6 rounded-[var(--radius-xs)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
