'use client';

import { ExternalLinkIcon } from 'lucide-react';
import { useMemo } from 'react';

import { useTokenEvents } from '@/context/TokenEventsContext';
import { formatTimeAgo, formatTokenAmount, formatUsd, truncateAddress } from '@/lib/format';

const blockchainExplorerByNetwork: Record<number, string> = {
  56: 'https://bscscan.com/address/',
};

const buildExplorerLink = (maker: string | null, networkId: number) => {
  if (!maker) return null;
  const base = blockchainExplorerByNetwork[networkId];
  if (!base) return null;
  return `${base}${maker}`;
};

const STATUS_MESSAGES: Record<string, string> = {
  unauthorized: 'Add NEXT_PUBLIC_CODEX_API_KEY to use live trades.',
  error: 'Unable to load live trades right now.',
};

const STATUS_STYLES =
  'rounded-default border border-white/10 bg-black/20 px-4 py-6 text-center text-sm font-medium text-white/70';

export const LiveTradesTable = () => {
  const { trades, status, error, networkId } = useTokenEvents();

  const maxUsd = useMemo(() => trades.reduce((acc, trade) => Math.max(acc, trade.amountUsd ?? 0), 0), [trades]);

  if (status === 'unauthorized') {
    return <div className={STATUS_STYLES}>{STATUS_MESSAGES.unauthorized}</div>;
  }

  if (status === 'error') {
    return <div className={STATUS_STYLES}>{error ?? STATUS_MESSAGES.error}</div>;
  }

  const isLoading = trades.length === 0 && (status === 'connecting' || status === 'ready' || status === 'reconnecting');
  const placeholderRows = Array.from({ length: 6 });

  return (
    <div className="invisible-scroll min-h-0 flex-1 overflow-y-auto">
      <table className="w-full min-w-[640px] table-fixed text-sm text-white">
        <thead className="text-[11px] uppercase text-muted">
          <tr className="border-b border-white/10">
            <th className="px-4 py-2 text-left">Age</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Price</th>
            <th className="px-4 py-2 text-left">Amount</th>
            <th className="px-4 py-2 text-left">Total USD</th>
            <th className="px-4 py-2 text-left">Trader</th>
          </tr>
        </thead>
        <tbody className="text-[13px]">
          {isLoading &&
            placeholderRows.map((_, idx) => (
              <tr key={`placeholder-${idx}`} className="animate-pulse border-b border-white/5">
                <td className="px-4 py-3 text-white/20">—</td>
                <td className="px-4 py-3 text-white/20">—</td>
                <td className="px-4 py-3 text-white/20">—</td>
                <td className="px-4 py-3 text-white/20">—</td>
                <td className="px-4 py-3 text-white/20">—</td>
                <td className="px-4 py-3 text-white/20">—</td>
              </tr>
            ))}
          {!isLoading &&
            trades.map((trade) => {
              const usdFraction = maxUsd ? Math.max(0.1, Math.min(1, trade.amountUsd / maxUsd)) : 0;
              const explorerLink = buildExplorerLink(trade.makerAddress, networkId);
              const rowKey = `${trade.id}-${trade.timestamp}-${trade.makerAddress ?? 'unknown'}`;
              return (
                <tr key={rowKey} className="border-b border-white/5 transition-colors duration-200 hover:bg-row-hover">
                  <td className="px-4 py-3 text-white/80">{formatTimeAgo(trade.timestamp)}</td>
                  <td className={`px-4 py-3 font-semibold ${trade.side === 'sell' ? 'text-[#FF6B6B]' : 'text-[#00FF26]'}`}>
                    {trade.side === 'sell' ? 'Sell' : 'Buy'}
                  </td>
                  <td className="px-4 py-3">{trade.priceUsd ? formatUsd(trade.priceUsd) : '—'}</td>
                  <td className="px-4 py-3">{formatTokenAmount(trade.amountToken)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={trade.side === 'sell' ? 'text-[#FF6B6B]' : 'text-[#00FF26]'}>{formatUsd(trade.amountUsd)}</span>
                      <span
                        className="h-3 flex-1 rounded-full bg-gradient-to-r from-white/5"
                        style={{
                          background: `linear-gradient(90deg, ${
                            trade.side === 'sell' ? '#FF6B6B' : '#00FF26'
                          }33 ${usdFraction * 100}%, transparent ${usdFraction * 100}%)`,
                        }}
                        aria-hidden
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {explorerLink ? (
                      <a
                        href={explorerLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-white/80 hover:text-white"
                      >
                        {truncateAddress(trade.makerAddress)}
                        <ExternalLinkIcon className="size-3" />
                      </a>
                    ) : (
                      <span className="text-white/50">{truncateAddress(trade.makerAddress)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          {!isLoading && trades.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-sm text-white/60">
                No trades received yet. Waiting for onTokenEventsCreated…
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
