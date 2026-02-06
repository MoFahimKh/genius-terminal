import type { Codex, FilterTokensQuery } from "@codex-data/sdk";

export type CodexTrade = {
  id: string;
  timestamp: number;
  makerAddress: string | null;
  side: "buy" | "sell";
  amountToken: number;
  amountUsd: number;
  priceUsd: number | null;
};

export type UseLatestTradesOptions = {
  address: string;
  networkId: number;
  maxEvents?: number;
};

export type ConnectionState =
  | "idle"
  | "connecting"
  | "ready"
  | "reconnecting"
  | "error"
  | "unauthorized";

export interface Holder {
  address: string;
  shiftedBalance: number;
  balanceUsd: number | null;
  rank: number;
}

export interface HoldersState {
  holders: Holder[];
  totalCount: number;
  top10HoldersPercent: number | null;
  loading: boolean;
  error: string | null;
}

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

export type PoolsState = {
  pools: TokenPool[];
  loading: boolean;
  error: string | null;
};

export type FilterTokensResult = NonNullable<
  NonNullable<NonNullable<FilterTokensQuery["filterTokens"]>["results"]>[number]
>;

export type TrendingToken = {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number | null;
  marketCapUsd: number | null;
  change24: number | null;
  imageUrl: string | null;
  networkId: number | null;
};

export type HookStatus = "loading" | "ready" | "error" | "unauthorized";

export type UseTrendingTokensOptions = {
  limit?: number;
  refreshMs?: number;
  minLiquidityUsd?: number;
};


export type Metric = {
  label: string;
  primary: string;
  secondary?: string;
  primaryTone: string;
  secondaryTone?: string;
  lineColor: string;
};

export type SubscriptionVariant = 'evm' | 'sol';

export type GraphqlTokenEvent = {
  id: string;
  timestamp?: string | number | null;
  makerAddress?: string | null;
  networkId?: number | null;
  eventDisplayType?: string | null;
  amount0?: string | number | null;
  amount1?: string | number | null;
  amountUSD?: string | number | null;
  raw?: Record<string, unknown> | null;
};

export type Unsubscribe = () => void | Promise<void>;
export type RawUnsubscribe = Unsubscribe | { unsubscribe: Unsubscribe } | void;

export type SubscriptionVariables = {
  address: string;
  networkId: number;
};

export type ExecutionPayload<TData> = {
  data?: TData | null;
  errors?: Array<{ message?: string | null }> | null;
};

export type CodexSink<TData> = {
  next: (payload: ExecutionPayload<TData>) => void;
  error?: (err: unknown) => void;
  complete?: () => void;
};

export type SubscriptionDescriptor<TData, TVariables> = {
  subscribe: (sdk: Codex, variables: TVariables, sink: CodexSink<TData>) => Promise<RawUnsubscribe> | RawUnsubscribe;
  select: (data?: TData | null) => Array<Record<string, unknown> | null>;
  toVariables: (variables: SubscriptionVariables) => TVariables;
};
