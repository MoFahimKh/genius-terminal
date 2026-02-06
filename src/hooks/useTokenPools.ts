"use client";

import { useEffect, useState } from "react";
import {
  PairRankingAttribute,
  RankingDirection,
  type FilterPairsQuery,
} from "@codex-data/sdk";

import { getCodexClient } from "@/lib/codex/client";

export type TokenPool = {
  id: string;
  exchangeName: string;
  exchangeIcon: string | null;
  exchangeAddress: string | null;
  tradeUrl: string | null;
  pairLabel: string;
  token0Icon: string | null;
  token1Icon: string | null;
  liquidityTokenSymbol: string | null;
  liquidityTokenAmount: number | null;
  liquidityUsd: number | null;
  volumeUsd: {
    "1h": number | null;
    "4h": number | null;
    "12h": number | null;
    "24h": number | null;
  };
  createdAt: number | null;
};

type PoolsState = {
  pools: TokenPool[];
  loading: boolean;
  error: string | null;
};

const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const pickTokenSymbol = (token?: any) =>
  token?.symbol ?? token?.info?.symbol ?? "—";

const pickTokenIcon = (token?: any) =>
  token?.info?.imageSmallUrl ?? token?.info?.imageThumbUrl ?? null;

const mapPool = (result: any, index: number): TokenPool | null => {
  if (!result || !result.pair) {
    return null;
  }

  const pair = result.pair;

  const token0Symbol = pickTokenSymbol(pair.token0Data);
  const token1Symbol = pickTokenSymbol(pair.token1Data);
  const liquidityTokenSymbol: any =
    pair.liquidityToken?.toLowerCase() === pair.token0?.toLowerCase()
      ? token0Symbol
      : pair.liquidityToken?.toLowerCase() === pair.token1?.toLowerCase()
        ? token1Symbol
        : null;

  const pooled0 = toNumber(pair.pooled?.token0);
  const pooled1 = toNumber(pair.pooled?.token1);
  const liquidityTokenAmount =
    pair.liquidityToken?.toLowerCase() === pair.token0?.toLowerCase()
      ? pooled0
      : pair.liquidityToken?.toLowerCase() === pair.token1?.toLowerCase()
        ? pooled1
        : null;

  const createdAtSeconds = pair.createdAt ?? null;

  return {
    id: pair.id ?? `${pair.address}-${index}`,
    exchangeName: result.exchange?.name ?? "Unknown",
    exchangeIcon: result.exchange?.iconUrl ?? null,
    exchangeAddress: result.exchange?.address ?? null,
    tradeUrl: result.exchange?.tradeUrl ?? null,
    pairLabel: `${token0Symbol}/${token1Symbol}`,
    token0Icon: pickTokenIcon(pair.token0Data),
    token1Icon: pickTokenIcon(pair.token1Data),
    liquidityTokenSymbol,
    liquidityTokenAmount,
    liquidityUsd: toNumber(result.liquidity),
    volumeUsd: {
      "1h": toNumber(result.volumeUSD1),
      "4h": toNumber(result.volumeUSD4),
      "12h": toNumber(result.volumeUSD12),
      "24h": toNumber(result.volumeUSD24),
    },
    createdAt: createdAtSeconds
      ? createdAtSeconds > 1e12
        ? createdAtSeconds
        : createdAtSeconds * 1000
      : null,
  };
};

export const useTokenPools = (
  tokenAddress?: string | null,
  networkId?: number | null,
  limit = 10,
) => {
  const apiKey = process.env.NEXT_PUBLIC_CODEX_API_KEY;
  const [state, setState] = useState<PoolsState>({
    pools: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!tokenAddress || !networkId) {
      setState((prev) => ({
        ...prev,
        pools: [],
        loading: false,
        error: null,
      }));
      return;
    }

    if (!apiKey) {
      setState({
        pools: [],
        loading: false,
        error: "Missing NEXT_PUBLIC_CODEX_API_KEY",
      });
      return;
    }

    const sdk = getCodexClient(apiKey);
    if (!sdk) {
      setState({
        pools: [],
        loading: false,
        error: "Failed to initialize Codex client",
      });
      return;
    }

    let cancelled = false;

    const fetchPools = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));

        const response = await sdk.queries.filterPairs({
          limit,
          rankings: [
            {
              attribute: PairRankingAttribute.Liquidity,
              direction: RankingDirection.Desc,
            },
          ],
          filters: {
            network: [networkId],
            tokenAddress: [tokenAddress.toLowerCase()],
            liquidity: { gt: 0 },
          },
        });

        if (cancelled) return;

        const results = response.filterPairs?.results ?? [];

        const pools = results
          .map((result, idx) => mapPool(result, idx))
          .filter((pool): pool is TokenPool => Boolean(pool));

        setState({
          pools,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        const rawMessage =
          err instanceof Error ? err.message : "Failed to load pools";
        const unauthorized =
          rawMessage.includes("Not authorized") ||
          rawMessage.includes("NOT_AUTHORIZED");
        setState({
          pools: [],
          loading: false,
          error: unauthorized
            ? "Your Codex plan does not include pools data. Upgrade your plan or use a different API key."
            : rawMessage,
        });
      }
    };

    fetchPools();

    return () => {
      cancelled = true;
    };
  }, [apiKey, tokenAddress, networkId, limit]);

  return state;
};
