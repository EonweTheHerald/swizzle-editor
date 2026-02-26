import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface PointListEditorProps {
  label: string;
  points: Point[];
  onChange: (points: Point[]) => void;
  minPoints?: number;
  description?: string;
}

export function PointListEditor({
  label,
  points,
  onChange,
  minPoints = 1,
  description,
}: PointListEditorProps) {
  const handleChange = (index: number, axis: 'x' | 'y', rawValue: string) => {
    const value = parseFloat(rawValue);
    if (isNaN(value)) return;
    const updated = points.map((p, i) => (i === index ? { ...p, [axis]: value } : p));
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...points, { x: 0, y: 0 }]);
  };

  const handleDelete = (index: number) => {
    if (points.length <= minPoints) return;
    onChange(points.filter((_, i) => i !== index));
  };

  return (
    <div className="field-group">
      <Label className="field-label">{label}</Label>
      <div className="space-y-1.5">
        {points.map((point, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)] w-5 shrink-0 text-right">
              {index + 1}
            </span>
            <div className="grid grid-cols-2 gap-1 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-[var(--text-muted)] w-3">X</span>
                <Input
                  type="number"
                  value={point.x}
                  onChange={(e) => handleChange(index, 'x', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[var(--text-muted)] w-3">Y</span>
                <Input
                  type="number"
                  value={point.y}
                  onChange={(e) => handleChange(index, 'y', e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              disabled={points.length <= minPoints}
              onClick={() => handleDelete(index)}
              title="Remove point"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleAdd}>
        <Plus className="h-3 w-3 mr-1" />
        Add Point
      </Button>
      {description && <p className="field-description">{description}</p>}
    </div>
  );
}
