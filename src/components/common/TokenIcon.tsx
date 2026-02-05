'use client';

export const TokenIcon = ({ symbol, size = 28 }: { symbol: string; size?: number }) => (
  <div
    style={{ width: size, height: size }}
    className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#5c8aff] to-[#001c73] text-xs font-semibold uppercase text-white">
    {symbol.slice(0, 3)}
  </div>
);
