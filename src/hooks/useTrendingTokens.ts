"use client";

import { useEffect, useState } from "react";
import {
  RankingDirection,
  TokenRankingAttribute,
  type FilterTokensQuery,
} from "@codex-data/sdk";

import { getCodexClient } from "@/lib/codex/client";
import toNumber from "@/lib/toNumber";
import { FilterTokensResult, TrendingToken, UseTrendingTokensOptions, HookStatus } from "@/types";

const mapToken = (
  item: FilterTokensResult | null,
  index: number,
): TrendingToken | null => {
  if (!item) return null;
  const token = item.token;
  const info = token?.info;

  const imageUrl =
    info?.imageSmallUrl ??
    info?.imageThumbUrl ??
    info?.imageLargeUrl ??
    null;

  return {
    id:
      token?.address ??
      item.pair?.address ??
      `${token?.symbol ?? "token"}-${index}`,
    symbol: (token?.symbol ?? info?.symbol ?? "TKN").toUpperCase(),
    name: info?.name ?? token?.name ?? "Unknown",
    imageUrl,
    networkId: info?.networkId ?? token?.networkId ?? item.liquidPair?.networkId ?? null,
    priceUsd: toNumber(item.priceUSD),
    marketCapUsd: toNumber(item.marketCap ?? item.circulatingMarketCap),
    change24: toNumber(item.change24),
  };
};

export function useTrendingTokens({
  limit = 200,
  refreshMs = 30_000,
  minLiquidityUsd = 10_000,
}: UseTrendingTokensOptions = {}) {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [status, setStatus] = useState<HookStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_CODEX_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setStatus("unauthorized");
      setError("Missing NEXT_PUBLIC_CODEX_API_KEY");
      return;
    }

    const sdk = getCodexClient(apiKey);
    if (!sdk) {
      setStatus("error");
      setError("Failed to initialize Codex client");
      return;
    }

    let cancelled = false;

    const fetchTokens = async () => {
      try {
        setStatus("loading");

        const res = await sdk.queries.filterTokens({
          limit,
          rankings: [
            {
              attribute: TokenRankingAttribute.TrendingScore24,
              direction: RankingDirection.Desc,
            },
          ],
          filters: {
            liquidity: { gt: minLiquidityUsd },
          },
        });

        if (cancelled) return;

        const results = res.filterTokens?.results ?? [];

        const mapped = results
          .map((r, i) => mapToken(r, i))
          .filter((token): token is TrendingToken => Boolean(token));

        setTokens(mapped);

        setStatus("ready");
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to load tokens");
      }
    };

    fetchTokens();

    if (refreshMs > 0) {
      const id = setInterval(fetchTokens, refreshMs);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [apiKey, limit, refreshMs, minLiquidityUsd]);
  return { tokens, status, error };
}
