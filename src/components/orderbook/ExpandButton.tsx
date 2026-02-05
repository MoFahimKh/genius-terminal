'use client';

import { twMerge } from 'tailwind-merge';
import { useIsMobile } from '@/hooks/useIsMobile';

export const ExpandButton = ({ onClick, isExpanded, isLargeLayout }: { onClick: () => void; isExpanded: boolean; isLargeLayout: boolean }) => {
  const isMobile = useIsMobile();
  if (isMobile) return null;

  return (
    <button
      type="button"
      aria-pressed={isExpanded}
      aria-label={isExpanded ? 'Collapse order book' : 'Expand order book'}
      onClick={onClick}
      className={twMerge(
        'border-default card-bg absolute bottom-0 left-[45%] z-50 flex h-3.5 w-14 -translate-x-1/2 cursor-pointer items-center justify-center rounded-t-md border-t text-neutral-400 transition-colors hover:text-white',
        isLargeLayout && 'left-[25%]',
      )}>
      <svg
        width="24"
        height="8"
        viewBox="0 0 24 8"
        fill="none"
        className={twMerge('overflow-visible transition-transform duration-200', isExpanded && 'rotate-180')}>
        <line x1="6" y1="4" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="6" x2="18" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
};
