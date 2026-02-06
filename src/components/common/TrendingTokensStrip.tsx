"use client";

import clsx from "clsx";
import { useMemo, useState, type ReactNode } from "react";

import { TokenIcon } from "@/components/common/TokenIcon";
import { useTrendingTokens } from "@/hooks/useTrendingTokens";
import { formatUsd } from "@/lib/format";
import { CollapseToggle } from "./CollapseToggle";

const PLACEHOLDER_ITEMS = Array.from({ length: 7 });

export const formatPercentChange = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const digits = Math.abs(value) >= 10 ? 1 : 2;
  const formatted = value.toFixed(digits);
  return `${value > 0 ? "+" : ""}${formatted}%`;
};

const StripMessage = ({ children }: { children: ReactNode }) => (
  <div className="h-9 w-full rounded-default border border-transparent bg-transparent px-4 text-[11px] font-semibold uppercase tracking-wide text-white/60">
    <div className="flex h-full items-center">{children}</div>
  </div>
);

const PlaceholderChip = () => (
  <div className="flex h-7 min-w-[150px] flex-shrink-0 items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 text-xs text-white/70">
    <div className="size-5 animate-pulse rounded-full bg-white/15" />
    <div className="flex flex-1 flex-col gap-1">
      <div className="h-2 w-16 animate-pulse rounded-full bg-white/15" />
      <div className="h-2 w-12 animate-pulse rounded-full bg-white/10" />
    </div>
    <div className="h-2 w-10 animate-pulse rounded-full bg-white/15" />
  </div>
);

type TokenChipProps = {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  imageUrl: string | null;
};

const TokenChip = ({
  symbol,
  name,
  price,
  change,
  imageUrl,
}: TokenChipProps) => {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="flex h-7 min-w-[168px] flex-shrink-0 items-center gap-3 px-1.5 text-xs text-white hover:bg-[#231646] rounded-sm">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${name} logo`}
          className="size-5 rounded-full object-cover"
          loading="lazy"
          width={20}
          height={20}
        />
      ) : (
        <TokenIcon symbol={symbol} size={20} />
      )}
      <span className="text-[14px] font-medium uppercase tracking-wide">
        {symbol}
      </span>

      <span className="text-[14px] font-semibold text-[#eee0ff80]">
        {formatUsd(price)}
      </span>
      <span
        className={clsx(
          "ml-auto text-[11px] font-semibold rounded-sm px-1",
          isPositive
            ? "text-[#36d399] bg-[#36d39933]"
            : "text-[#F87272] bg-[#F8727233]",
        )}
      >
        {formatPercentChange(change)}
      </span>
    </div>
  );
};

export const TrendingTokensStrip = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { tokens, status, error } = useTrendingTokens();
  const isLoading = status === "idle" || status === "loading";
  const infoClass = useMemo(
    () =>
      [
        collapsed
          ? "max-h-0 py-0 opacity-0 pointer-events-none"
          : "max-h-[520px] py-[10px] opacity-100",
      ].join(" "),
    [collapsed],
  );
  return (
    <div className="flex w-full flex-shrink-0">
      <div className="relative">
        <div className={infoClass} aria-hidden={collapsed}>
        <div className="no-scrollbar flex h-11 w-full items-center gap-3 overflow-x-auto px-4 py-1">
          {status === "unauthorized" && (
            <StripMessage>
              Connect NEXT_PUBLIC_CODEX_API_KEY to unlock trending tokens.
            </StripMessage>
          )}
          {status === "error" && (
            <StripMessage>
              {error ?? "Unable to load trending tokens."}
            </StripMessage>
          )}
          {status !== "unauthorized" && status !== "error" && (
            <>
              {isLoading && tokens.length === 0
                ? PLACEHOLDER_ITEMS.map((_, idx) => (
                    <PlaceholderChip key={`placeholder-${idx}`} />
                  ))
                : null}
              {!isLoading && tokens.length === 0 ? (
                <StripMessage>
                  No trending tokens available right now.
                </StripMessage>
              ) : null}
              {tokens.map((token) => (
                <TokenChip
                  key={token.id}
                  symbol={token.symbol}
                  name={token.name}
                  price={token.priceUsd}
                  change={token.change24}
                  imageUrl={token.imageUrl}
                />
              ))}
            </>
          )}
        </div>
      </div>
      <CollapseToggle
          isCollapsed={collapsed}
          onClick={() => setCollapsed((p) => !p)}
        />
      </div>
    </div>
  );
};
