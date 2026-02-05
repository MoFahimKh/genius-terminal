import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_TOP_PERCENT = 70;
const MIN_TOP_PERCENT = 20;
const MAX_TOP_PERCENT = 85;

export const useVerticalSplit = () => {
  const [topHeightPercent, setTopHeightPercent] = useState(DEFAULT_TOP_PERCENT);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const clamp = (value: number) => Math.min(MAX_TOP_PERCENT, Math.max(MIN_TOP_PERCENT, value));

  const handleResizeStart = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return undefined;

    const handleMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const y = event.clientY - rect.top;
      const percent = (y / rect.height) * 100;
      setTopHeightPercent(clamp(percent));
    };

    const stop = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', stop);
    document.body.style.cursor = 'row-resize';

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', stop);
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  return { containerRef, topHeightPercent, isDragging, handleResizeStart };
};
