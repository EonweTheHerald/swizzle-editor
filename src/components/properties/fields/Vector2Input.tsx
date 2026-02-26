/**
 * Vector2Input - Handles { x, y } coordinate inputs
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Vector2InputProps {
  label: string;
  value: { x: number; y: number };
  onChange: (value: { x: number; y: number }) => void;
  description?: string;
}

export function Vector2Input({ label, value, onChange, description }: Vector2InputProps) {
  return (
    <div className="field-group">
      <Label className="field-label">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${label}-x`} className="text-xs text-[var(--text-muted)]">
            X
          </Label>
          <Input
            id={`${label}-x`}
            type="number"
            value={value.x}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              onChange({ ...value, x: Number.isNaN(parsed) ? 0 : parsed });
            }}
          />
        </div>
        <div>
          <Label htmlFor={`${label}-y`} className="text-xs text-[var(--text-muted)]">
            Y
          </Label>
          <Input
            id={`${label}-y`}
            type="number"
            value={value.y}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value);
              onChange({ ...value, y: Number.isNaN(parsed) ? 0 : parsed });
            }}
          />
        </div>
      </div>
      {description && <p className="field-description">{description}</p>}
    </div>
  );
}
