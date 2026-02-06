'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { TokenIcon } from '@/components/common/TokenIcon';
import { CollapseToggle } from '@/components/common/CollapseToggle';
import { Chart } from '@/components/Chart';
import { useTokenStats } from '@/hooks/useTokenStats';
import { formatTokenAmount, formatUsd } from '@/lib/format';

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

const STATUS_STYLES =
  'rounded-default border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-white/80';

export const TokenStats = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { data, status, error } = useTokenStats();

  const infoClass = useMemo(
    () =>
      [
        'flex w-full flex-col gap-4 overflow-hidden px-4 transition-all duration-300 ease-in-out',
        collapsed ? 'max-h-0 py-0 opacity-0 pointer-events-none' : 'max-h-[520px] py-4 opacity-100',
      ].join(' '),
    [collapsed],
  );

  const isLoading = status === 'loading';
  const isRefreshing = status === 'refreshing';
  const isUnauthorized = status === 'unauthorized';
  const isError = status === 'error';

  const symbol = data.snapshot?.symbol ?? '—';
  const name = data.snapshot?.name ?? 'Awaiting token';

  const changeDirection: 'positive' | 'negative' | 'neutral' =
    typeof data.change24 === 'number' ? (data.change24 >= 0 ? 'positive' : 'negative') : 'neutral';

  const statsItems = [
    { label: 'Volume', value: formatUsd(data.volume24Usd) },
    { label: 'M. Cap', value: formatUsd(data.marketCapUsd) },
    { label: 'Liquidity', value: formatUsd(data.liquidityUsd) },
    { label: 'Holders', value: formatCount(data.holders) },
    { label: 'Age', value: formatAge(data.ageMs) },
    { label: 'Supply', value: data.supply ? formatTokenAmount(data.supply) : '—' },
  ];

  const platformShortName = data.platformName ? truncatePlatformName(data.platformName) : null;
  const buyPressurePercent = data.buyPressure !== null ? Math.round(data.buyPressure * 100) : null;

  return (
    <div className="border-default relative flex h-full min-h-0 flex-1 flex-col border-r border-white/5">
      <div className="relative pb-4">
        <div className={infoClass} aria-hidden={collapsed}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <TokenIcon symbol={symbol} imageUrl={data.snapshot?.imageUrl ?? null} size={48} />
                <div className="min-w-0">
                  <button className="flex cursor-pointer flex-wrap items-center gap-2 text-left">
                    <p className="text-lg font-semibold uppercase tracking-wide text-white">{name}</p>
                    <span className="text-sm uppercase text-white/60">{symbol}</span>
                    <ChevronDown size={14} className="text-white/70" />
                  </button>
                  <p className="text-xs uppercase text-white/40">Live via Codex Stream</p>
                </div>
              </div>

              <div className="ml-auto flex flex-col items-start text-white md:items-end">
                <span className="text-xs font-semibold uppercase text-white/50">Price (USD)</span>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-2xl font-semibold tracking-tight">{formatUsd(data.priceUsd)}</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeTone(changeDirection)}`}>
                    {formatPercent(data.change24)}
                  </span>
                </div>
                {isRefreshing && <span className="text-[10px] uppercase text-white/50">Updating…</span>}
              </div>
            </div>

            {(isUnauthorized || isError) && (
              <div className={STATUS_STYLES}>
                {isUnauthorized
                  ? 'Add NEXT_PUBLIC_CODEX_API_KEY to enable live token stats.'
                  : error ?? 'Unable to load token stats right now.'}
              </div>
            )}

            <div className="invisible-scroll flex flex-row flex-nowrap items-center gap-6 overflow-x-auto pb-1">
              {statsItems.map((item) => (
                <StatBlock key={item.label} label={item.label} value={isLoading ? '—' : item.value ?? '—'} />
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

        <CollapseToggle isCollapsed={collapsed} onClick={() => setCollapsed((p) => !p)} />
      </div>

      <div className="border-default relative min-h-[320px] flex-1 border-t border-white/5">
        <Chart />
      </div>
    </div>
  );
};

const StatBlock = ({ label, value, children }: { label: string; value?: string; children?: ReactNode }) => (
  <div className="flex min-w-[110px] flex-col">
    <span className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</span>
    {children ?? <p className="text-sm font-semibold text-white">{value ?? '—'}</p>}
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
        <img src={iconUrl} alt={name} className="h-6 w-6 rounded-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold uppercase text-white">
          {shortName.slice(0, 2)}
        </div>
      )}
      <span className="text-sm font-semibold text-white" title={name}>
        {shortName}
      </span>
    </div>
  );
};

const BuyPressure = ({ value }: { value: number | null }) => {
  if (value === null) {
    return <p className="text-sm font-semibold text-white/60">—</p>;
  }
  const accent = value >= 0 ? 'text-[#00FF26]' : 'text-[#FF6B6B]';
  return (
    <p className={`text-sm font-semibold ${accent}`}>{value >= 0 ? `+${value}%` : `${value}%`}</p>
  );
};

const formatPercent = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return '—';
  const fixed = value.toFixed(2);
  return `${value >= 0 ? '+' : ''}${fixed}%`;
};

const formatCount = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return '—';
  if (value < 1_000) return value.toLocaleString();
  return compactNumberFormatter.format(value);
};

const formatAge = (ageMs: number | null) => {
  if (!ageMs || Number.isNaN(ageMs)) return '—';
  const totalMinutes = Math.floor(ageMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d, ${hours}h`;
  if (hours > 0) return `${hours}h, ${minutes}m`;
  return `${Math.max(minutes, 0)}m`;
};

const truncatePlatformName = (value: string) => {
  if (value.length <= 7) return value;
  return `${value.slice(0, 7)}…`;
};

const badgeTone = (direction: 'positive' | 'negative' | 'neutral') => {
  if (direction === 'positive') {
    return 'bg-[#00FF26]/10 text-[#00FF26]';
  }
  if (direction === 'negative') {
    return 'bg-[#FF6B6B]/10 text-[#FF6B6B]';
  }
  return 'bg-white/10 text-white';
};
