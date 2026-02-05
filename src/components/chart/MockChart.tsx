'use client';

const generateBars = () =>
  Array.from({ length: 42 }).map((_, idx) => ({
    height: 20 + ((idx * 13) % 80),
    direction: idx % 3 === 0,
  }));

export const MockChart = () => (
  <div className="relative h-full w-full">
    <div className="absolute inset-0 bg-gradient-to-b from-[#10121a] via-[#060709] to-[hsl(260.77deg_100%_5.1%)]" />
    <div className="absolute inset-0 grid grid-rows-6 gap-y-6 px-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="border-t border-white/5"
        />
      ))}
    </div>
    <div className="relative z-10 flex h-full w-full items-end gap-1 px-4 py-6">
      {generateBars().map((bar, idx) => (
        <span
          key={idx}
          className={`w-1 rounded-sm ${bar.direction ? 'bg-[#00FF26]/80' : 'bg-[#FF0000]/80'}`}
          style={{ height: `${bar.height}%` }}
        />
      ))}
    </div>
  </div>
);
