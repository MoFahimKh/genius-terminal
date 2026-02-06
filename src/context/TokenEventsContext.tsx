'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { DEFAULT_CODEX_MARKET } from '@/config/market';
import { useLatestTrades, type CodexTrade } from '@/hooks/useLatestTrades';

type TokenEventsContextValue = {
  address: string;
  networkId: number;
  trades: CodexTrade[];
  status: ReturnType<typeof useLatestTrades>['status'];
  error: ReturnType<typeof useLatestTrades>['error'];
  clock: number;
};

const TokenEventsContext = createContext<TokenEventsContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  address?: string;
  networkId?: number;
  maxEvents?: number;
};

export const TokenEventsProvider = ({
  children,
  address = DEFAULT_CODEX_MARKET.address,
  networkId = DEFAULT_CODEX_MARKET.networkId,
  maxEvents = 60,
}: ProviderProps) => {
  const { trades, status, error, clock } = useLatestTrades({ address, networkId, maxEvents });

  const value = useMemo(
    () => ({
      address,
      networkId,
      trades,
      status,
      error,
      clock,
    }),
    [address, networkId, trades, status, error, clock],
  );

  return <TokenEventsContext.Provider value={value}>{children}</TokenEventsContext.Provider>;
};

export const useTokenEvents = () => {
  const context = useContext(TokenEventsContext);
  if (!context) {
    throw new Error('useTokenEvents must be used within TokenEventsProvider');
  }
  return context;
};
