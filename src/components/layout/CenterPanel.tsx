import { PreviewCanvas } from '../preview/PreviewCanvas';
import { PlaybackControls } from '../preview/PlaybackControls';

export function CenterPanel() {
  return (
    <div className="flex-1 flex flex-col bg-[var(--bg)] relative min-w-0">
      {/* Preview canvas */}
      <div className="flex-1 relative p-2">
        <PreviewCanvas />
      </div>

      {/* Bottom controls */}
      <div className="h-9 border-t border-[var(--border)] bg-[var(--surface)] shrink-0">
        <PlaybackControls />
      </div>
    </div>
  );
}
