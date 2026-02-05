'use client';

import type {
  Codex,
  GetTokenEventsQuery,
  OnTokenEventsCreatedSubscription,
  OnTokenEventsCreatedSubscriptionVariables,
  OnUnconfirmedEventsCreatedSubscription,
  OnUnconfirmedEventsCreatedSubscriptionVariables,
} from '@codex-data/sdk';
import { RankingDirection } from '@codex-data/sdk';

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
type Unsubscribe = () => void | Promise<void>;
type RawUnsubscribe = Unsubscribe | { unsubscribe: Unsubscribe } | void;

type SubscriptionVariables = {
  address: string;
  networkId: number;
};

type ExecutionPayload<TData> = {
  data?: TData | null;
  errors?: Array<{ message?: string | null }> | null;
};

type CodexSink<TData> = {
  next: (payload: ExecutionPayload<TData>) => void;
  error?: (err: unknown) => void;
  complete?: () => void;
};

type SubscriptionDescriptor<TData, TVariables> = {
  subscribe: (sdk: Codex, variables: TVariables, sink: CodexSink<TData>) => Promise<RawUnsubscribe> | RawUnsubscribe;
  select: (data?: TData | null) => Array<Record<string, unknown> | null>;
  toVariables: (variables: SubscriptionVariables) => TVariables;
};

const SUBSCRIPTIONS = {
  evm: {
    subscribe: (sdk, variables, sink) =>
      sdk.subscriptions.onTokenEventsCreated(
        variables,
        sink as Parameters<Codex['subscriptions']['onTokenEventsCreated']>[1],
      ),
    select: (data) =>
      (data?.onTokenEventsCreated?.events as Array<Record<string, unknown> | null> | null | undefined) ?? [],
    toVariables: ({ address, networkId }) => ({
      input: {
        tokenAddress: address,
        networkId,
      },
    }),
  } satisfies SubscriptionDescriptor<OnTokenEventsCreatedSubscription, OnTokenEventsCreatedSubscriptionVariables>,
  sol: {
    subscribe: (sdk, variables, sink) =>
      sdk.subscriptions.onUnconfirmedEventsCreated(
        variables,
        sink as Parameters<Codex['subscriptions']['onUnconfirmedEventsCreated']>[1],
      ),
    select: (data) =>
      (data?.onUnconfirmedEventsCreated?.events as Array<Record<string, unknown> | null> | null | undefined) ?? [],
    toVariables: ({ address }) => ({
      address,
    }),
  } satisfies SubscriptionDescriptor<OnUnconfirmedEventsCreatedSubscription, OnUnconfirmedEventsCreatedSubscriptionVariables>,
} as const;

type SubscribeToTokenEventsOptions = {
  sdk: Codex;
  address: string;
  networkId: number;
  variant: SubscriptionVariant;
  onEvents: (events: GraphqlTokenEvent[]) => void;
  onError?: (message: string) => void;
};

const hasUnsubscribe = (value: unknown): value is { unsubscribe: Unsubscribe } =>
  Boolean(
    value &&
      typeof value === 'object' &&
      'unsubscribe' in value &&
      typeof (value as { unsubscribe?: unknown }).unsubscribe === 'function',
  );

const toSafeUnsubscribe = (value?: RawUnsubscribe | null) => {
  if (typeof value === 'function') {
    return () => {
      const maybePromise = value();
      if (maybePromise && typeof (maybePromise as Promise<void>).catch === 'function') {
        (maybePromise as Promise<void>).catch(() => undefined);
      }
    };
  }
  if (hasUnsubscribe(value)) {
    return toSafeUnsubscribe(value.unsubscribe);
  }
  return () => undefined;
};

const extractErrorMessage = (value: unknown): string | null => {
  if (value instanceof Error && value.message) return value.message;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const messages = value
      .map((item) => extractErrorMessage(item))
      .filter((msg): msg is string => Boolean(msg));
    return messages.length ? messages.join(', ') : null;
  }
  if (value && typeof value === 'object' && 'message' in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return null;
};

const subscribeWithDescriptor = async <TData, TVariables>(
  descriptor: SubscriptionDescriptor<TData, TVariables>,
  { sdk, address, networkId, onEvents, onError }: Omit<SubscribeToTokenEventsOptions, 'variant'>,
) => {
  const normalizedAddress = address.toLowerCase();
  const variables = descriptor.toVariables({ address: normalizedAddress, networkId });

  const sink: CodexSink<TData> = {
    next: (result) => {
      if (result.errors?.length) {
        const message =
          result.errors.map((error) => error?.message).filter(Boolean).join(', ') ?? 'Subscription error';
        onError?.(message);
        return;
      }
      const events = descriptor
        .select(result.data ?? null)
        .map((event) => normalizeSdkEvent(event))
        .filter(
          (event): event is GraphqlTokenEvent =>
            Boolean(event && (!event.networkId || event.networkId === networkId)),
        );
      if (events.length) onEvents(events);
    },
    error: (err) => {
      const message = extractErrorMessage(err) ?? 'Subscription error';
      onError?.(message);
    },
    complete: () => undefined,
  };

  let unsubscribe: RawUnsubscribe | void;
  try {
    unsubscribe = await Promise.resolve(descriptor.subscribe(sdk, variables, sink));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start token events subscription';
    onError?.(message);
    throw error;
  }

  return toSafeUnsubscribe(unsubscribe);
};

export const subscribeToTokenEvents = (options: SubscribeToTokenEventsOptions) => {
  const { variant, ...rest } = options;
  if (variant === 'sol') {
    return subscribeWithDescriptor(SUBSCRIPTIONS.sol, rest);
  }
  return subscribeWithDescriptor(SUBSCRIPTIONS.evm, rest);
};

type FetchRecentOptions = {
  sdk: Codex;
  address: string;
  networkId: number;
  limit: number;
};

export const fetchRecentTokenEvents = async ({ sdk, address, networkId, limit }: FetchRecentOptions) => {
  const normalizedAddress = address.toLowerCase();
  let response: GetTokenEventsQuery;
  try {
    response = await sdk.queries.getTokenEvents({
      limit,
      direction: RankingDirection.Desc,
      query: {
        address: normalizedAddress,
        networkId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch token events';
    throw new Error(message);
  }

  const items = response.getTokenEvents?.items ?? [];
  return items
    .map((event) => normalizeSdkEvent(event as Record<string, unknown> | null))
    .filter(
      (event): event is GraphqlTokenEvent => Boolean(event && (!event.networkId || event.networkId === networkId)),
    )
    .sort((a, b) => {
      const aTs = typeof a.timestamp === 'number' ? a.timestamp : Date.parse(String(a.timestamp ?? 0));
      const bTs = typeof b.timestamp === 'number' ? b.timestamp : Date.parse(String(b.timestamp ?? 0));
      return bTs - aTs;
    })
    .slice(0, limit);
};

type AmountFields = {
  amount0?: string | number | null;
  amount0Shifted?: string | number | null;
  amount1?: string | number | null;
  amount1Shifted?: string | number | null;
};

type SwapEventFields = AmountFields & {
  amount0In?: string | number | null;
  amount0Out?: string | number | null;
  amount1In?: string | number | null;
  amount1Out?: string | number | null;
  amountNonLiquidityToken?: string | number | null;
  amountNonLiquidityTokenShifted?: string | number | null;
  amountBaseToken?: string | number | null;
  priceBaseToken?: string | number | null;
  priceBaseTokenTotal?: string | number | null;
  priceUsd?: string | number | null;
  priceUsdTotal?: string | number | null;
};

const extractScalar = (value: unknown): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  return null;
};

const pickScalar = (values: Array<string | number | null | undefined>) => {
  for (const value of values) {
    const scalar = extractScalar(value);
    if (scalar !== null && scalar !== undefined) {
      if (typeof scalar === 'string') {
        if (scalar.trim() === '') continue;
      }
      return scalar;
    }
  }
  return null;
};

const getScalarField = (source: Record<string, unknown>, key: string) => extractScalar(source[key]);

const getStringField = (source: Record<string, unknown>, key: string) => {
  const value = source[key];
  return typeof value === 'string' ? value : null;
};

const getTimestampField = (source: Record<string, unknown>, key: string) => {
  const value = source[key];
  if (typeof value === 'number' || typeof value === 'string') return value;
  return null;
};

const getNumberField = (source: Record<string, unknown>, key: string) => {
  const value = source[key];
  return typeof value === 'number' ? value : null;
};

const buildEventId = (incoming: Record<string, unknown>) => {
  const rawId = getScalarField(incoming, 'id');
  if (rawId !== null && rawId !== undefined) {
    const asString = typeof rawId === 'number' ? rawId.toString() : rawId;
    if (asString) return asString;
  }

  const txHash = getStringField(incoming, 'transactionHash');
  const logIndex = getNumberField(incoming, 'logIndex');
  const supplementalIndex = getNumberField(incoming, 'supplementalIndex');
  if (txHash) {
    return [txHash, logIndex ?? '0', supplementalIndex ?? '0'].join(':');
  }

  const maker = getStringField(incoming, 'maker');
  const timestamp = getTimestampField(incoming, 'timestamp');
  if (maker && (timestamp || timestamp === 0)) {
    return [maker, timestamp].join(':');
  }

  return null;
};

const normalizeSdkEvent = (incoming: Record<string, unknown> | null | undefined): GraphqlTokenEvent | null => {
  if (!incoming || typeof incoming !== 'object') return null;
  const id = buildEventId(incoming);
  if (!id) return null;
  const data = (incoming as { data?: Record<string, unknown> | null }).data;
  const amountFields: AmountFields = {};
  let amountUsd: string | number | null = null;

  if (data && typeof data === 'object') {
    const typename = typeof data.__typename === 'string' ? data.__typename : undefined;
    if (
      typename === 'SwapEventData' ||
      typename === 'PoolBalanceChangedEventData' ||
      typename === 'BurnEventData' ||
      typename === 'MintEventData'
    ) {
      const swap = data as SwapEventFields;
      amountFields.amount0 = pickScalar([
        swap.amount0,
        swap.amount0Shifted,
        swap.amount0In,
        swap.amount0Out,
        swap.amountBaseToken,
        swap.amountNonLiquidityToken,
        swap.amountNonLiquidityTokenShifted,
      ]);
      amountFields.amount1 = pickScalar([
        swap.amount1,
        swap.amount1Shifted,
        swap.amount1In,
        swap.amount1Out,
        swap.amountNonLiquidityToken,
        swap.amountNonLiquidityTokenShifted,
        swap.amountBaseToken,
      ]);
      amountUsd = pickScalar([swap.priceUsdTotal, swap.priceUsd, swap.priceBaseTokenTotal, swap.priceBaseToken]);
    } else if (typename === 'UnconfirmedSwapEventData') {
      const swap = data as SwapEventFields;
      amountFields.amount0 = pickScalar([
        swap.amountBaseToken,
        swap.amount0,
        swap.amount0Shifted,
        swap.amount0In,
        swap.amount0Out,
      ]);
      amountFields.amount1 = pickScalar([
        swap.amountNonLiquidityToken,
        swap.amountNonLiquidityTokenShifted,
        swap.amount1,
        swap.amount1Shifted,
        swap.amount1In,
        swap.amount1Out,
      ]);
      amountUsd = pickScalar([swap.priceUsdTotal, swap.priceUsd, swap.priceBaseTokenTotal, swap.priceBaseToken]);
    } else if (typename === 'UnconfirmedLiquidityChangeEventData') {
      const swap = data as AmountFields;
      amountFields.amount0 = pickScalar([swap.amount0, swap.amount0Shifted]);
      amountFields.amount1 = pickScalar([swap.amount1, swap.amount1Shifted]);
    }
  }

  return {
    id,
    timestamp: getTimestampField(incoming, 'timestamp'),
    makerAddress: getStringField(incoming, 'maker') ?? getStringField(incoming, 'makerAddress'),
    networkId: getNumberField(incoming, 'networkId'),
    eventDisplayType: getStringField(incoming, 'eventDisplayType'),
    amount0: amountFields.amount0 ?? getScalarField(incoming, 'amount0'),
    amount1: amountFields.amount1 ?? getScalarField(incoming, 'amount1'),
    amountUSD: amountUsd ?? getScalarField(incoming, 'amountUSD'),
    raw: incoming,
  };
};
