'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getCodexClient } from '@/lib/codex/client';
import { fetchRecentTokenEvents, subscribeToTokenEvents, type GraphqlTokenEvent } from '@/lib/codex/tokenEvents';

export type CodexTrade = {
  id: string;
  timestamp: number;
  makerAddress: string | null;
  side: 'buy' | 'sell';
  amountToken: number;
  amountUsd: number;
  priceUsd: number | null;
};

type UseLatestTradesOptions = {
  address: string;
  networkId: number;
  maxEvents?: number;
};

type ConnectionState = 'idle' | 'connecting' | 'ready' | 'reconnecting' | 'error' | 'unauthorized';

const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toTimestampMs = (value?: string | number | null) => {
  if (value === null || value === undefined) return Date.now();
  if (typeof value === 'number') {
    return value > 1e12 ? value : value * 1000;
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric > 1e12 ? numeric : numeric * 1000;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
};

const normalizeEvent = (event: GraphqlTokenEvent): CodexTrade | null => {
  if (!event.id) return null;
  const tokenAmount = toNumber(event.amount0) ?? toNumber(event.amount1) ?? 0;
  const amountUsd = toNumber(event.amountUSD) ?? 0;
  const priceUsd = tokenAmount && amountUsd ? amountUsd / tokenAmount : null;

  return {
    id: event.id,
    timestamp: toTimestampMs(event.timestamp),
    makerAddress: event.makerAddress ?? null,
    side: event.eventDisplayType?.toLowerCase() === 'sell' ? 'sell' : 'buy',
    amountToken: tokenAmount,
    amountUsd,
    priceUsd,
  };
};

export const useLatestTrades = ({ address, networkId, maxEvents = 60 }: UseLatestTradesOptions) => {
  const [trades, setTrades] = useState<CodexTrade[]>([]);
  const [status, setStatus] = useState<ConnectionState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState(() => Date.now());
  const reconnectAttemptsRef = useRef(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_CODEX_API_KEY;
  const getTradeKey = useCallback((trade: CodexTrade) => {
    const timestamp = Number.isFinite(trade.timestamp) ? trade.timestamp : 0;
    const maker = trade.makerAddress ?? '';
    return `${trade.id}:${timestamp}:${maker}`;
  }, []);

  const handleIncomingEvents = useCallback(
    (payloadEvents: GraphqlTokenEvent[]) => {
      setTrades((prev) => {
        const mapped = payloadEvents
          .map((event) => normalizeEvent(event))
          .filter((event): event is CodexTrade => Boolean(event));
        if (!mapped.length) return prev;
        const dedup = new Map<string, CodexTrade>();
        [...mapped, ...prev].forEach((trade) => {
          const key = getTradeKey(trade);
          if (!dedup.has(key)) {
            dedup.set(key, trade);
          }
        });
        return Array.from(dedup.values())
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, maxEvents);
      });
    },
    [maxEvents, getTradeKey],
  );

  useEffect(() => {
    setTrades([]);
  }, [address, networkId]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const interval = window.setInterval(() => {
      setClock(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!address || !networkId) return undefined;
    if (!apiKey) return undefined;

    const sdk = getCodexClient(apiKey);
    if (!sdk) return undefined;

    let isCancelled = false;

    const loadInitial = async () => {
      try {
        const recent = await fetchRecentTokenEvents({
          sdk,
          address,
          networkId,
          limit: maxEvents,
        });
        console.log({recent})
        if (!isCancelled && recent.length) {
          handleIncomingEvents(recent);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to preload Codex trades', err);
        }
      }
    };

    loadInitial();

    return () => {
      isCancelled = true;
    };
  }, [address, networkId, apiKey, maxEvents, handleIncomingEvents]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!address || !networkId) return undefined;
    if (!apiKey) {
      setStatus('unauthorized');
      setError('Missing NEXT_PUBLIC_CODEX_API_KEY');
      return undefined;
    }

    const sdk = getCodexClient(apiKey);
    if (!sdk) return undefined;

    reconnectAttemptsRef.current = 0;
    let isActive = true;

    const cleanup = () => {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };

    const scheduleReconnect = () => {
      if (!isActive) return;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      reconnectAttemptsRef.current += 1;
      const delay = Math.min(30_000, 1000 * 2 ** reconnectAttemptsRef.current);
      setStatus('reconnecting');
      reconnectTimerRef.current = window.setTimeout(() => {
        startSubscription();
      }, delay);
    };

    const startSubscription = async () => {
      if (!isActive) return;
      setStatus(reconnectAttemptsRef.current === 0 ? 'connecting' : 'reconnecting');
      try {
        const unsubscribe = await subscribeToTokenEvents({
          sdk,
          address,
          networkId,
          onEvents: handleIncomingEvents,
          onError: (message) => {
            setStatus('error');
            setError(message);
            scheduleReconnect();
          },
          // variant: 'evm'
        });
        if (!isActive) {
          unsubscribe();
          return;
        }
        unsubscribeRef.current = unsubscribe;
        reconnectAttemptsRef.current = 0;
        setStatus('ready');
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start Codex subscription';
        setStatus('error');
        setError(message);
        scheduleReconnect();
      }
    };

    startSubscription();

    return () => {
      isActive = false;
      cleanup();
    };
  }, [address, networkId, apiKey, handleIncomingEvents]);

  const memoized = useMemo(
    () => ({
      trades,
      status,
      error,
      clock,
    }),
    [trades, status, error, clock],
  );

  return memoized;
};
