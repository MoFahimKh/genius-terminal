'use client';

import { useEffect, useMemo, useState } from 'react';

import { TokenPairStatisticsType } from '@codex-data/sdk';

import { getCodexClient } from '@/lib/codex/client';
import { useTokenEvents } from '@/context/TokenEventsContext';
import {toNumber} from "@/lib/format";
import { FilterTokensResult } from '@/types';

const toTimestamp = (value?: string | number | null) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return value > 1e12 ? value : value * 1000;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const pickExchange = (result: FilterTokensResult) => {
  if (result.exchanges?.length) return result.exchanges[0];
  const tokenExchanges = result.token?.exchanges;
  if (tokenExchanges?.length) return tokenExchanges[0];
  return null;
};

type TokenSnapshot = {
  address: string;
  symbol: string;
  name: string;
  imageUrl: string | null;
  priceUsd: number | null;
  change24: number | null;
  volume24Usd: number | null;
  buyCount24: number | null;
  sellCount24: number | null;
  buyVolume24Usd: number | null;
  sellVolume24Usd: number | null;
  volumeChange24: number | null;
  marketCapUsd: number | null;
  liquidityUsd: number | null;
  holders: number | null;
  createdAt: number | null;
  supply: number | null;
  platformIconUrl: string | null;
  platformName: string | null;
};

const mapTokenSnapshot = (result: FilterTokensResult): TokenSnapshot => {
  const tokenData = result.token;
  const tokenInfo = tokenData?.info;
  const exchange = pickExchange(result);
  const symbol = (tokenData?.symbol ?? tokenInfo?.symbol ?? 'TKN').toUpperCase();
  const name = tokenInfo?.name ?? tokenData?.name ?? symbol;

  return {
    address: (tokenData?.address ?? '').toLowerCase(),
    symbol,
    name,
    imageUrl: tokenInfo?.imageSmallUrl ?? tokenInfo?.imageThumbUrl ?? tokenInfo?.imageLargeUrl ?? null,
    priceUsd: toNumber(result.priceUSD),
    change24: toNumber(result.change24 ?? '-'),
    volume24Usd: toNumber(result.volume24 ?? '-'),
    buyCount24: toNumber(result.buyCount24 ?? '-'),
    sellCount24: toNumber(result.sellCount24 ?? '-'),
    buyVolume24Usd: toNumber(result.buyVolume24 ?? '-'),
    sellVolume24Usd: toNumber(result.sellVolume24 ?? '-'),
    volumeChange24: toNumber(result.volumeChange24 ?? '-'),
    marketCapUsd: toNumber(result.marketCap ?? result.circulatingMarketCap),
    liquidityUsd: toNumber(result.liquidity ?? result.liquidPairLiquidity),
    holders: toNumber(result.holders),
    createdAt: toTimestamp(result.createdAt ?? tokenData?.createdAt ),
    supply: toNumber(tokenInfo?.circulatingSupply ?? tokenInfo?.totalSupply),
    platformIconUrl: exchange?.iconUrl ?? null,
    platformName: exchange?.name ?? null,
  };
};

type HookStatus = 'idle' | 'loading' | 'ready' | 'refreshing' | 'error' | 'unauthorized';

type UseTokenStatsOptions = {
  refreshMs?: number;
  buyPressureWindowMs?: number;
};

export type TokenStatsData = {
  snapshot: TokenSnapshot | null;
  priceUsd: number | null;
  change24: number | null;
  volume24Usd: number | null;
  buyCount24: number | null;
  sellCount24: number | null;
  buyVolume24Usd: number | null;
  sellVolume24Usd: number | null;
  volumeChange24: number | null;
  marketCapUsd: number | null;
  liquidityUsd: number | null;
  holders: number | null;
  ageMs: number | null;
  supply: number | null;
  buyPressure: number | null;
  platformIconUrl: string | null;
  platformName: string | null;
};

export const useTokenStats = ({
  refreshMs = 30_000,
  buyPressureWindowMs = 5 * 60 * 1000,
}: UseTokenStatsOptions = {}) => {
  const { address, trades, clock } = useTokenEvents();
  const apiKey = process.env.NEXT_PUBLIC_CODEX_API_KEY;
  const [snapshot, setSnapshot] = useState<TokenSnapshot | null>(null);
  const [status, setStatus] = useState<HookStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!address) return undefined;

    if (!apiKey) {
      setStatus('unauthorized');
      setError('Missing NEXT_PUBLIC_CODEX_API_KEY');
      setSnapshot(null);
      return undefined;
    }

    const sdk = getCodexClient(apiKey);
    if (!sdk) return undefined;

    let isMounted = true;
    let timer: number | null = null;

    const clearTimer = () => {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    };

    const fetchSnapshot = async () => {
      if (!isMounted) return;
      setStatus((prev) => (prev === 'ready' ? 'refreshing' : 'loading'));
      try {
        const response = await sdk.queries.filterTokens({
          tokens: [address.toLowerCase()],
          limit: 1,
          statsType: TokenPairStatisticsType.Filtered,
        });
        if (!isMounted) return;
        const result = response.filterTokens?.results?.[0];
        if (!result) {
          throw new Error('Token snapshot is unavailable');
        }
        setSnapshot(mapTokenSnapshot(result));
        setStatus('ready');
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unable to load token stats');
      } finally {
        if (!isMounted) return;
        if (refreshMs > 0) {
          clearTimer();
          timer = window.setTimeout(() => {
            void fetchSnapshot();
          }, refreshMs);
        }
      }
    };

    void fetchSnapshot();

    return () => {
      isMounted = false;
      clearTimer();
    };
  }, [address, apiKey, refreshMs]);

  const latestTrade = trades.length ? trades[0] : null;

  const priceUsd = latestTrade?.priceUsd ?? snapshot?.priceUsd ?? null;

  const buyPressure = useMemo(() => {
    if (!buyPressureWindowMs || buyPressureWindowMs <= 0) return null;
    const cutoff = clock - buyPressureWindowMs;
    const recentTrades = trades.filter((trade) => trade.timestamp >= cutoff);
    if (!recentTrades.length) return null;
    const totals = recentTrades.reduce(
      (acc, trade) => {
        const amount = trade.amountUsd ?? 0;
        if (trade.side === 'sell') {
          return {
            buy: acc.buy,
            total: acc.total + amount,
          };
        }
        return {
          buy: acc.buy + amount,
          total: acc.total + amount,
        };
      },
      { buy: 0, total: 0 },
    );
    if (!totals.total) return null;
    return Math.min(1, Math.max(0, totals.buy / totals.total));
  }, [trades, clock, buyPressureWindowMs]);

  const data: TokenStatsData = {
    snapshot,
    priceUsd,
    change24: snapshot?.change24 ?? null,
    volume24Usd: snapshot?.volume24Usd ?? null,
    buyCount24: snapshot?.buyCount24 ?? null,
    sellCount24: snapshot?.sellCount24 ?? null,
    buyVolume24Usd: snapshot?.buyVolume24Usd ?? null,
    sellVolume24Usd: snapshot?.sellVolume24Usd ?? null,
    volumeChange24: snapshot?.volumeChange24 ?? null,
    marketCapUsd: snapshot?.marketCapUsd ?? null,
    liquidityUsd: snapshot?.liquidityUsd ?? null,
    holders: snapshot?.holders ?? null,
    ageMs: snapshot?.createdAt ? Math.max(0, Date.now() - snapshot.createdAt) : null,
    supply: snapshot?.supply ?? null,
    buyPressure,
    platformIconUrl: snapshot?.platformIconUrl ?? null,
    platformName: snapshot?.platformName ?? null,
  };

  return {
    data,
    status,
    error,
  };
};
