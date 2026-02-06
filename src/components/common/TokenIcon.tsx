type TokenIconProps = {
  symbol: string;
  size?: number;
  imageUrl?: string | null;
};

export const TokenIcon = ({ symbol, size = 28, imageUrl }: TokenIconProps) => {
  const borderSize = 2; // thickness of border

  return (
    <div
      style={{
        width: size,
        height: size,
        padding: borderSize,
      }}
      className="shrink-0 rounded-lg bg-[#ffa4c8]"
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-[#5c8aff] to-[#001c73] text-xs font-semibold uppercase text-white">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${symbol} logo`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          symbol.slice(0, 3)
        )}
      </div>
    </div>
  );
};
