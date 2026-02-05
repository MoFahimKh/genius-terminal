'use client';

import clsx from 'clsx';

type PanelCollapseToggleProps = {
  isCollapsed: boolean;
  onClick: () => void;
  className?: string;
};

export const PanelCollapseToggle = ({ isCollapsed, onClick, className }: PanelCollapseToggleProps) => {
  const label = isCollapsed ? 'Expand panel' : 'Collapse panel';

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={!isCollapsed}
      onClick={onClick}
      className={clsx(
        'border-default card-bg flex h-4 w-14 items-center justify-center rounded-b-md border-x border-b text-neutral-400 shadow-lg transition-colors hover:text-white',
        className,
      )}>
      <svg
        width="24"
        height="8"
        viewBox="0 0 24 8"
        fill="none"
        className={`overflow-visible transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`}>
        <line x1="6" y1="4" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="6" x2="18" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
};
