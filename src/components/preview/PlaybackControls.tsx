import { useEditorStore } from '@/store/editorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { numberToHex, hexToNumber } from '@/lib/utils';

export function PlaybackControls() {
  const { ui, setBackgroundColor, setZoom } = useEditorStore();

  return (
    <div className="h-full flex items-center gap-3 px-3">
      {/* Background Color */}
      <div className="flex items-center gap-1.5">
        <Label htmlFor="bg-color" className="text-[10px]">
          BG
        </Label>
        <input
          id="bg-color"
          type="color"
          value={numberToHex(ui.backgroundColor)}
          onChange={(e) => setBackgroundColor(hexToNumber(e.target.value))}
          className="w-6 h-5 p-0 border border-[var(--border)] rounded-[var(--radius-xs)] cursor-pointer bg-transparent"
        />
      </div>

      <Separator orientation="vertical" className="h-4" />

      {/* Zoom */}
      <div className="flex items-center gap-1.5">
        <Label htmlFor="zoom" className="text-[10px]">
          Zoom
        </Label>
        <Input
          id="zoom"
          type="number"
          min="0.1"
          max="5"
          step="0.1"
          value={ui.zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value) || 1)}
          className="w-14 h-5 text-[10px] px-1"
        />
      </div>
    </div>
  );
}
