'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { RankingDirection, TokenRankingAttribute, type FilterTokensQuery } from '@codex-data/sdk';

import { getCodexClient } from '@/lib/codex/client';

const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

type FilterTokensResult = NonNullable<
  NonNullable<NonNullable<FilterTokensQuery['filterTokens']>['results']>[number]
>;

export type TrendingToken = {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number | null;
  change24: number | null;
  imageUrl: string | null;
};

type HookStatus = 'idle' | 'loading' | 'ready' | 'error' | 'unauthorized';

type UseTrendingTokensOptions = {
  limit?: number;
  refreshMs?: number;
  minLiquidityUsd?: number;
};

const mapTokenResult = (result: FilterTokensResult, index: number): TrendingToken => {
  const tokenData = result.token;
  const tokenInfo = tokenData?.info;
  const id =
    tokenData?.address ??
    result.pair?.address ??
    result.quoteToken ??
    `${tokenData?.symbol ?? 'token'}-${index}`;

  const symbol = (tokenData?.symbol ?? tokenInfo?.symbol ?? 'TKN').toUpperCase();
  const name = tokenInfo?.name ?? tokenData?.name ?? symbol;
  const imageUrl =
    tokenInfo?.imageSmallUrl ??
    tokenInfo?.imageThumbUrl ??
    tokenInfo?.imageLargeUrl ??
    null;

  return {
    id,
    symbol,
    name,
    imageUrl,
    priceUsd: toNumber(result.priceUSD),
    change24: toNumber(result.change24),
  };
};

export const useTrendingTokens = ({
  limit = 20,
  refreshMs = 30_000,
  minLiquidityUsd = 10_000,
}: UseTrendingTokensOptions = {}) => {
  const apiKey = process.env.NEXT_PUBLIC_CODEX_API_KEY;
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [status, setStatus] = useState<HookStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (!apiKey) {
      setStatus('unauthorized');
      setError('Missing NEXT_PUBLIC_CODEX_API_KEY');
      setTokens([]);
      return undefined;
    }

    const sdk = getCodexClient(apiKey);
    if (!sdk) return undefined;

    let isMounted = true;

    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleNext = () => {
      if (refreshMs <= 0) return;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        void fetchTokens();
      }, refreshMs);
    };

    const fetchTokens = async () => {
      if (!isMounted) return;
      setStatus((prev) => (prev === 'ready' ? prev : 'loading'));
      try {
        const response = await sdk.queries.filterTokens({
          limit,
          rankings: [
            {
              attribute: TokenRankingAttribute.TrendingScore24,
              direction: RankingDirection.Desc,
            },
          ],
          filters: {
            liquidity: {
              gt: minLiquidityUsd,
            },
          },
        });
        if (!isMounted) return;
        const results = response.filterTokens?.results ?? [];
        const mapped = results
          .map((item, idx) => (item ? mapTokenResult(item, idx) : null))
          .filter((item): item is TrendingToken => Boolean(item));
        setTokens(mapped);
        setStatus('ready');
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unable to load trending tokens');
      } finally {
        if (!isMounted) return;
        scheduleNext();
      }
    };

    void fetchTokens();

    return () => {
      isMounted = false;
      clearTimer();
    };
  }, [apiKey, limit, refreshMs, minLiquidityUsd]);

  const memoized = useMemo(
    () => ({
      tokens,
      status,
      error,
    }),
    [tokens, status, error],
  );

  return memoized;
};
