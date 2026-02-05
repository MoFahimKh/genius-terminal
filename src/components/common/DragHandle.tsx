'use client';

export const DragHandle = ({ onMouseDown }: { onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void }) => (
  <div
    onMouseDown={onMouseDown}
    className="group absolute -bottom-[2px] left-0 z-30 h-0.5 w-full cursor-row-resize rounded-full transition-all duration-200 hover:bg-blue-500/30"
    style={{ pointerEvents: 'auto' }}>
    <div className="absolute -bottom-[0.2px] left-1/2 flex h-[3px] w-20 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full bg-black text-[8px] text-neutral-600 transition-all duration-200 group-hover:text-neutral-300">
      <div className="flex h-full w-full items-center justify-center border-y-[0.1px] border-white/5 bg-[#022d92]/70">
        <p className="relative bottom-[1px] tracking-wider text-white/50">-</p>
      </div>
    </div>
  </div>
);
