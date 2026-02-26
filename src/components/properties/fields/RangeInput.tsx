/**
 * RangeInput - Handles number | { min, max } values
 * Allows toggling between single value and range
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';

interface RangeInputProps {
  label: string;
  value: number | { min: number; max: number };
  onChange: (value: number | { min: number; max: number }) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export function RangeInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  description,
}: RangeInputProps) {
  const isRange = typeof value === 'object';
  const [showRange, setShowRange] = useState(isRange);

  const handleToggle = () => {
    if (showRange) {
      // Convert range to single value (use min)
      const singleValue = typeof value === 'object' ? value.min : value;
      onChange(singleValue);
    } else {
      // Convert single value to range
      const currentValue = typeof value === 'number' ? value : 0;
      onChange({ min: currentValue, max: currentValue * 1.5 });
    }
    setShowRange(!showRange);
  };

  const handleSingleChange = (newValue: number) => {
    onChange(newValue);
  };

  const handleMinChange = (newMin: number) => {
    if (typeof value === 'object') {
      onChange({ ...value, min: newMin });
    }
  };

  const handleMaxChange = (newMax: number) => {
    if (typeof value === 'object') {
      onChange({ ...value, max: newMax });
    }
  };

  return (
    <div className="field-group">
      <div className="flex items-center justify-between mb-1.5">
        <Label className="field-label mb-0">{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={handleToggle}
          title={showRange ? 'Switch to single value' : 'Switch to range'}
        >
          <ArrowLeftRight className="h-3 w-3" />
        </Button>
      </div>

      {showRange ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor={`${label}-min`} className="text-xs text-[var(--text-muted)]">
              Min
            </Label>
            <Input
              id={`${label}-min`}
              type="number"
              value={typeof value === 'object' ? value.min : 0}
              onChange={(e) => handleMinChange(parseFloat(e.target.value) || 0)}
              min={min}
              max={max}
              step={step}
            />
          </div>
          <div>
            <Label htmlFor={`${label}-max`} className="text-xs text-[var(--text-muted)]">
              Max
            </Label>
            <Input
              id={`${label}-max`}
              type="number"
              value={typeof value === 'object' ? value.max : 0}
              onChange={(e) => handleMaxChange(parseFloat(e.target.value) || 0)}
              min={min}
              max={max}
              step={step}
            />
          </div>
        </div>
      ) : (
        <Input
          type="number"
          value={typeof value === 'number' ? value : 0}
          onChange={(e) => handleSingleChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
        />
      )}

      {description && <p className="field-description">{description}</p>}
    </div>
  );
}
