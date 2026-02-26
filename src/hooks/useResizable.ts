import { useCallback, useRef, useEffect } from 'react';

interface UseResizableOptions {
  direction: 'left' | 'right';
  currentWidth: number;
  minWidth: number;
  maxWidth: number;
  onResize: (width: number) => void;
}

/**
 * Hook for creating draggable resize handles.
 * Returns a mousedown handler to attach to the resize handle element.
 */
export function useResizable({
  direction,
  currentWidth,
  minWidth,
  maxWidth,
  onResize,
}: UseResizableOptions) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startX.current = e.clientX;
      startWidth.current = currentWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [currentWidth]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const delta = e.clientX - startX.current;
      const newWidth =
        direction === 'left'
          ? startWidth.current + delta
          : startWidth.current - delta;

      const clamped = Math.min(maxWidth, Math.max(minWidth, newWidth));
      onResize(clamped);
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [direction, minWidth, maxWidth, onResize]);

  return { handleMouseDown };
}
