import { Label } from '@/components/ui/label';

interface ColorInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
}

function numberToHex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}

function hexToNumber(hex: string): number {
  return parseInt(hex.slice(1), 16);
}

export function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  return (
    <div className="field-group">
      <Label className="field-label">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={numberToHex(value)}
          onChange={(e) => onChange(hexToNumber(e.target.value))}
          className="h-8 w-12 cursor-pointer rounded border border-[var(--border)] bg-transparent p-0.5"
        />
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {numberToHex(value).toUpperCase()}
        </span>
      </div>
      {description && <p className="field-description">{description}</p>}
    </div>
  );
}
