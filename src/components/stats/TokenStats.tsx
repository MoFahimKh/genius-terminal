"use client";

import { useCallback, useMemo, useState, type ReactNode, type WheelEvent } from "react";

import { TokenIcon } from '@/components/common/TokenIcon';
import { Chart } from '@/components/Chart';
import { useTokenStats } from '@/hooks/useTokenStats';
import {formatAge, formatCount, formatUsd, truncatePlatformName } from '@/lib/format';
import clsx from "clsx";
import { formatPercentChange } from "../common/TrendingTokensStrip";



const STATUS_STYLES =
  "rounded-default border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-white/80";

export const TokenStats = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { data, status, error } = useTokenStats();
  const infoClass = useMemo(
    () =>
      [
        "flex w-full min-w-0 flex-col gap-4 overflow-x-auto invisible-scroll px-4 transition-all duration-300 ease-in-out",
        collapsed
          ? "max-h-0 py-0 opacity-0 pointer-events-none"
          : "max-h-[520px] py-[10px] opacity-100",
      ].join(" "),
    [collapsed],
  );

  const isLoading = status === "loading";
  const isUnauthorized = status === "unauthorized";
  const isError = status === "error";
  const symbol = data.snapshot?.symbol ?? "—";
  const name = data.snapshot?.name ?? "Awaiting token";

  const changeDirection: "positive" | "negative" | "neutral" =
    typeof data.change24 === "number"
      ? data.change24 >= 0
        ? "positive"
        : "negative"
      : "neutral";

  const statsItems = [
    { label: "Volume", value: formatUsd(data.volume24Usd) },
    { label: "M. Cap", value: formatUsd(data.marketCapUsd) },
    { label: "Liquidity", value: formatUsd(data.liquidityUsd) },
    { label: "Holders", value: formatCount(data.holders) },
    { label: "Age", value: formatAge(data.ageMs) },
    {
      label: "Supply",
      value: data.supply ? formatUsd(data.supply) : "—",
    },
  ];

  const platformShortName = data.platformName
    ? truncatePlatformName(data.platformName)
    : null;
  const buyPressurePercent =
    data.buyPressure !== null ? Math.round(data.buyPressure * 100) : null;

  // Allow horizontal scrolling with a vertical mouse wheel to keep stats accessible on all inputs.
  const handleStatsWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (target.scrollWidth <= target.clientWidth) {
      return;
    }

    const { deltaX, deltaY } = event;
    if (deltaY === 0 || Math.abs(deltaY) <= Math.abs(deltaX)) {
      return;
    }

    const maxScrollLeft = target.scrollWidth - target.clientWidth;
    const tolerance = 1;
    const isAtStart = target.scrollLeft <= tolerance;
    const isAtEnd = target.scrollLeft >= maxScrollLeft - tolerance;

    if ((deltaY < 0 && isAtStart) || (deltaY > 0 && isAtEnd)) {
      return;
    }

    event.preventDefault();
    const nextScrollLeft = Math.max(
      0,
      Math.min(maxScrollLeft, target.scrollLeft + deltaY),
    );
    target.scrollLeft = nextScrollLeft;
  }, []);

  return (
    <div className="border-default relative flex h-full min-h-0 flex-1 flex-col border-r border-white/5">
      <div className="relative">
        <div className={infoClass} aria-hidden={collapsed}>
          <div
            className="invisible-scroll no-scrollbar w-full overflow-x-auto"
            onWheel={handleStatsWheel}
          >
            <div className="flex min-w-max items-center gap-4">
              <TokenIcon
                symbol={symbol}
                imageUrl={data.snapshot?.imageUrl ?? null}
                size={48}
              />
              <button className="shrink-0 flex flex-row cursor-pointer items-center gap-1 text-left">
                <p className="text-lg font-semibold uppercase tracking-wide text-white">
                  {name}
                </p>
                <span className="text-sm uppercase font-medium text-[#eee0ff80]">
                  {symbol}
                </span>
              </button>

              {(isUnauthorized || isError) && (
                <div className={STATUS_STYLES}>
                  {isUnauthorized
                    ? "Add NEXT_PUBLIC_CODEX_API_KEY to enable live token stats."
                    : (error ?? "Unable to load token stats right now.")}
                </div>
              )}

              <div className="flex gap-2 items-center mx-8">
                <span className="text-[18px] font-medium text-[#EEE0FF]">
                  ${data.priceUsd?.toFixed(9)}
                </span>
                <span
                  className={clsx(
                    "ml-auto text-[11px] font-semibold rounded-sm px-1",
                    changeDirection === "positive"
                      ? "text-[#36d399] bg-[#36d39933]"
                      : "text-[#F87272] bg-[#F8727233]",
                  )}
                >
                  {formatPercentChange(data.change24)}
                </span>
              </div>

              {statsItems.map((item) => (
                <StatBlock
                  key={item.label}
                  label={item.label}
                  value={isLoading ? "—" : (item.value ?? "—")}
                />
              ))}
              <StatBlock label="Platform">
                <PlatformBadge
                  name={data.platformName}
                  shortName={platformShortName}
                  iconUrl={data.platformIconUrl}
                />
              </StatBlock>
              <StatBlock label="Buy Pressure">
                <BuyPressure value={buyPressurePercent} />
              </StatBlock>
            </div>
          </div>
        </div>
      </div>

      <div className="border-default relative flex-1 border-t border-white/5">
        <Chart />
      </div>
    </div>
  );
};

const StatBlock = ({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
}) => (
  <div className="flex min-w-[70px] flex-col">
    <span className="text-xs text-[#eee0ff80]">
      {label}
    </span>
    {children ?? <p className="text-sm text-white">{value ?? "—"}</p>}
  </div>
);

const PlatformBadge = ({
  name,
  shortName,
  iconUrl,
}: {
  name: string | null;
  shortName: string | null;
  iconUrl: string | null;
}) => {
  if (!name || !shortName) {
    return <p className="mt-1 text-base font-semibold text-white/60">—</p>;
  }
  return (
    <div className="mt-1 flex items-center gap-2">
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={name}
          className="h-6 w-6 rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold uppercase text-white">
          {shortName.slice(0, 2)}
        </div>
      )}
    </div>
  );
};

const BuyPressure = ({ value }: { value: number | null }) => {
  if (value === null) {
    return <p className="text-sm font-semibold text-white/60">—</p>;
  }
  const accent = value >= 0 ? "text-[#00FF26]" : "text-[#FF6B6B]";
  return (
    <p className={`text-sm font-semibold ${accent}`}>
      {value >= 0 ? `+${value}%` : `${value}%`}
    </p>
  );
};
