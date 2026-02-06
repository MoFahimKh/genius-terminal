import { useEffect, useState } from 'react';

import { getCodexClient } from '@/lib/codex/client';
import toNumber from '@/lib/toNumber';
import { HoldersState } from '@/types';

export function useTokenHolders(tokenAddress: string, networkId: number, limit = 50) {
  const [data, setData] = useState<HoldersState>({
    holders: [],
    totalCount: 0,
    top10HoldersPercent: null,
    loading: true,
    error: null,
  });

  const apiKey = process.env.NEXT_PUBLIC_CODEX_API_KEY;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!tokenAddress || !networkId) return;

    if (!apiKey) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: 'Missing NEXT_PUBLIC_CODEX_API_KEY',
      }));
      return;
    }

    const sdk = getCodexClient(apiKey);
    
    if (!sdk) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize Codex client',
      }));
      return;
    }

    let cancelled = false;

    const fetchHolders = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true }));

        const response = await sdk.queries.holders({
          input: {
            tokenId: `${tokenAddress}:${networkId}`,
            limit,
            // sort: { attribute: 'BALANCE' },
          },
        });

        if (cancelled) return;

        const holdersConnection = response.holders;
        const items = holdersConnection?.items ?? [];

        setData({
          holders: items
            .filter(Boolean)
            .map((holder, idx) => ({
              address: holder!.address,
              shiftedBalance: Number(holder!.shiftedBalance ?? 0),
              balanceUsd: toNumber(holder!.balanceUsd),
              rank: idx + 1,
            })),
          totalCount: holdersConnection?.count ?? items.length,
          top10HoldersPercent: toNumber(holdersConnection?.top10HoldersPercent),
          loading: false,
          error: null,
        });
      } catch (err) {
        const rawMessage =
          err instanceof Error ? err.message : 'Failed to fetch holders';
        const isUnauthorized =
          rawMessage.includes('Not authorized') ||
          rawMessage.includes('NOT_AUTHORIZED');

        if (cancelled) return;
        setData((prev) => ({
          ...prev,
          loading: false,
          error: isUnauthorized
            ? 'Your Codex plan does not include holders data. Add a valid NEXT_PUBLIC_CODEX_API_KEY or upgrade your plan.'
            : rawMessage,
        }));
      }
    };

    fetchHolders();

    return () => {
      cancelled = true;
    };
  }, [tokenAddress, networkId, limit, apiKey]);

  return data;
}
