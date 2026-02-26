/**
 * SelectInput - Generic select/dropdown component
 */

import { Label } from '@/components/ui/label';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  description?: string;
}

export function SelectInput({ label, value, onChange, options, description }: SelectInputProps) {
  return (
    <div className="field-group">
      <Label className="field-label">{label}</Label>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger className="flex h-9 w-full items-center justify-between rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]">
          <Select.Value />
          <Select.Icon>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden bg-[var(--surface-2)] text-[var(--text)] rounded-md border border-[var(--border)] shadow-lg z-50">
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex items-center px-8 py-2 text-sm rounded-sm hover:bg-[var(--surface-hover)] cursor-pointer outline-none"
                >
                  <Select.ItemIndicator className="absolute left-2">
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {description && <p className="field-description">{description}</p>}
    </div>
  );
}
