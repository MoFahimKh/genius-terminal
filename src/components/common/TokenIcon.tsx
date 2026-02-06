'use client';

type TokenIconProps = {
  symbol: string;
  size?: number;
  imageUrl?: string | null;
};

export const TokenIcon = ({ symbol, size = 28, imageUrl }: TokenIconProps) => (
  <div
    style={{ width: size, height: size }}
    className="flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#5c8aff] to-[#001c73] text-xs font-semibold uppercase text-white">
    {imageUrl ? (
      <img src={imageUrl} alt={`${symbol} logo`} className="h-full w-full object-cover" loading="lazy" />
    ) : (
      symbol.slice(0, 3)
    )}
  </div>
);
