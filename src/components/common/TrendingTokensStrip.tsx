"use client";

import clsx from "clsx";
import { useMemo, useState, type ReactNode } from "react";

import { TokenIcon } from "@/components/common/TokenIcon";
import { useTrendingTokens } from "@/hooks/useTrendingTokens";
import { formatUsd } from "@/lib/format";
import { CollapseToggle } from "./CollapseToggle";
import { getChainVisualMeta, type ChainGlyph as ChainGlyphName } from "@/lib/chains";

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
  marketCap: number | null;
  change: number | null;
  imageUrl: string | null;
  networkId: number | null;
};

const TokenChip = ({
  symbol,
  name,
  price,
  marketCap,
  change,
  imageUrl,
  networkId,
}: TokenChipProps) => {
  const isPositive = (change ?? 0) >= 0;
  const displayValue = marketCap ?? price;
  return (
    <div className="cursor-pointer flex h-7 min-w-[168px] flex-shrink-0 items-center gap-3 rounded-sm px-1.5 text-xs text-white hover:bg-[#231646]">
      <div className="relative">
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
        {networkId != null && (
          <div className="absolute -bottom-1 -right-1">
            <ChainIcon networkId={networkId} size={12} />
          </div>
        )}
      </div>
      <span className="text-[14px] font-medium uppercase tracking-wide">
        {symbol}
      </span>

      <span className="text-[14px] font-semibold text-[#eee0ff80]">
        {formatUsd(displayValue)}
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
  const infoClass = useMemo(
    () =>
      [
        collapsed
          ? "max-h-0 py-0 opacity-0 pointer-events-none"
          : "max-h-[520px] opacity-100 px-5",
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
              {status === "loading" && tokens.length === 0
                ? PLACEHOLDER_ITEMS.map((_, idx) => (
                    <PlaceholderChip key={`placeholder-${idx}`} />
                  ))
                : null}
              {status !== "loading" && tokens.length === 0 ? (
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
                  marketCap={token.marketCapUsd}
                  change={token.change24}
                  imageUrl={token.imageUrl}
                  networkId={token.networkId}
                />
              ))}
            </>
          )}
        </div>
      </div>
      <CollapseToggle.vertical
          isCollapsed={collapsed}
          onClick={() => setCollapsed((p) => !p)}
        />
      </div>
    </div>
  );
};

const ChainIcon = ({ networkId, size = 20 }: { networkId: number | null; size?: number }) => {
  const meta = getChainVisualMeta(networkId ?? undefined);

  return (
    <span
      className="flex items-center justify-center rounded-full border border-white/15 font-black uppercase text-white"
      style={{
        width: size,
        height: size,
        background: meta.gradient,
        fontSize: Math.max(8, Math.round(size * 0.45)),
      }}
      title={meta.name}
      aria-label={meta.name}
    >
      {meta.glyph ? <ChainGlyph glyph={meta.glyph} /> : <span className="tracking-tight">{meta.abbr}</span>}
    </span>
  );
};

const ChainGlyph = ({ glyph }: { glyph: ChainGlyphName }) => {
  switch (glyph) {
    case "eth":
      return (
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" className="text-white">
          <path d="M12 2 6 12l6 3 6-3-6-10Z" fill="currentColor" opacity={0.9} />
          <path d="m6 13 6 9 6-9-6 3-6-3Z" fill="currentColor" opacity={0.6} />
        </svg>
      );
    case "bnb":
      return (
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" className="text-white">
          <path
            d="m12 3 3.6 3.6-2.1 2.1L12 7.2l-1.5 1.5-2.1-2.1L12 3Zm7.5 7.5-1.5 1.5-1.5-1.5 1.5-1.5 1.5 1.5Zm-15 0 1.5 1.5 1.5-1.5-1.5-1.5-1.5 1.5Zm7.5 4.8 2.1 2.1L12 21l-3.6-3.6 2.1-2.1L12 16.8Zm0-2.7 3-3L18.6 12 12 18.6 5.4 12l3.6-3.6 3 3Z"
            fill="currentColor"
          />
        </svg>
      );
    case "polygon":
      return (
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" className="text-white">
          <path
            d="m7.5 8.2 4.5-2.6 4.5 2.6v5.6l-4.5 2.6-4.5-2.6V8.2Z"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path d="m7.5 11 4.5 2.6 4.5-2.6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      );
    case "arbitrum":
      return (
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" className="text-white">
          <path
            d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path d="m9 8-2 7m5-7-2 7m5-7-2 7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      );
    case "optimism":
      return (
        <svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor" className="text-white">
          <rect x={4} y={6} width={16} height={12} rx={6} opacity={0.85} />
          <path d="M9 15V9h1.9c1.1 0 1.8.6 1.8 1.5 0 .9-.7 1.5-1.8 1.5H9Zm5-.2L16 9h1.5l-2 5.8H14Z" fill="#0A0A0A" />
        </svg>
      );
    case "base":
      return (
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" className="text-white">
          <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={2} />
          <path d="M7 12h10" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
        </svg>
      );
    case "avalanche":
      return (
        <svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor" className="text-white">
          <path d="M12 4 3 20h18L12 4Zm0 5 4 7H8l4-7Z" />
        </svg>
      );
    case "fantom":
      return (
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" className="text-white">
          <rect x={5} y={5} width={14} height={14} rx={2} stroke="currentColor" strokeWidth={2} />
          <path d="m8 9 4 2 4-2m-8 4 4 2 4-2" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      );
    case "zksync":
      return (
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" className="text-white">
          <path d="m6 9 4-4h8l-4 4H6Zm12 6-4 4H6l4-4h8Z" fill="currentColor" opacity={0.8} />
          <path d="m10 9 4 6" stroke="#0F0F0F" strokeWidth={1.4} strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};
