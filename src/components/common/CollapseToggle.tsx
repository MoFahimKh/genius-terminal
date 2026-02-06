'use client';

export const CollapseToggle = ({ isCollapsed, onClick }: { isCollapsed: boolean; onClick: () => void }) => {
  const label = isCollapsed ? 'Expand section' : 'Collapse section';
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={!isCollapsed}
      onClick={onClick}
      className="bg-[#09001a] hover:bg-[#231646] absolute -bottom-2 left-4 z-20 flex h-4 w-8 cursor-pointer items-center justify-center rounded-[4px] border-2 border-default text-[#eee0ff] transition-colors ">
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
