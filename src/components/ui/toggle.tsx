import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {}

const Toggle = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  ToggleProps
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center',
      'rounded-full border border-[var(--border)] transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
      'disabled:cursor-not-allowed disabled:opacity-40',
      'data-[state=unchecked]:bg-[var(--surface-3)]',
      'data-[state=checked]:bg-[var(--accent)]',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-3 w-3 rounded-full bg-white shadow-xs',
        'transition-transform',
        'data-[state=unchecked]:translate-x-0.5',
        'data-[state=checked]:translate-x-[13px]'
      )}
    />
  </SwitchPrimitive.Root>
));
Toggle.displayName = 'Toggle';

export { Toggle };
