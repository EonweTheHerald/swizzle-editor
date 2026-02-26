import { Label } from '@/components/ui/label';

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function CheckboxField({ id, label, checked, onChange, description }: CheckboxFieldProps) {
  return (
    <div className="field-group">
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
        />
        <Label htmlFor={id} className="field-label cursor-pointer">
          {label}
        </Label>
      </div>
      {description && <p className="field-description">{description}</p>}
    </div>
  );
}
