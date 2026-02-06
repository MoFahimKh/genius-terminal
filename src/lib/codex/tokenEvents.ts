"use client";

import {
  SubscriptionDescriptor,
  SubscriptionVariant,
  GraphqlTokenEvent,
  CodexSink,
  RawUnsubscribe,
} from "@/types";
import {
  extractErrorMessage,
  normalizeSdkEvent,
  toSafeUnsubscribe,
} from "@/lib/codex/tokenEventUtils";
import type {
  Codex,
  GetTokenEventsQuery,
  OnTokenEventsCreatedSubscription,
  OnTokenEventsCreatedSubscriptionVariables,
  OnUnconfirmedEventsCreatedSubscription,
  OnUnconfirmedEventsCreatedSubscriptionVariables,
} from "@codex-data/sdk";
import { RankingDirection } from "@codex-data/sdk";

const SUBSCRIPTIONS = {
  evm: {
    subscribe: (sdk, variables, sink) =>
      sdk.subscriptions.onTokenEventsCreated(
        variables,
        sink as Parameters<Codex["subscriptions"]["onTokenEventsCreated"]>[1],
      ),
    select: (data) =>
      (data?.onTokenEventsCreated?.events as
        | Array<Record<string, unknown> | null>
        | null
        | undefined) ?? [],
    toVariables: ({ address, networkId }) => ({
      input: {
        tokenAddress: address,
        networkId,
      },
    }),
  } satisfies SubscriptionDescriptor<
    OnTokenEventsCreatedSubscription,
    OnTokenEventsCreatedSubscriptionVariables
  >,
  sol: {
    subscribe: (sdk, variables, sink) =>
      sdk.subscriptions.onUnconfirmedEventsCreated(
        variables,
        sink as Parameters<
          Codex["subscriptions"]["onUnconfirmedEventsCreated"]
        >[1],
      ),
    select: (data) =>
      (data?.onUnconfirmedEventsCreated?.events as
        | Array<Record<string, unknown> | null>
        | null
        | undefined) ?? [],
    toVariables: ({ address }) => ({
      address,
    }),
  } satisfies SubscriptionDescriptor<
    OnUnconfirmedEventsCreatedSubscription,
    OnUnconfirmedEventsCreatedSubscriptionVariables
  >,
} as const;

type SubscribeToTokenEventsOptions = {
  sdk: Codex;
  address: string;
  networkId: number;
  variant: SubscriptionVariant;
  onEvents: (events: GraphqlTokenEvent[]) => void;
  onError?: (message: string) => void;
};

const subscribeWithDescriptor = async <TData, TVariables>(
  descriptor: SubscriptionDescriptor<TData, TVariables>,
  {
    sdk,
    address,
    networkId,
    onEvents,
    onError,
  }: Omit<SubscribeToTokenEventsOptions, "variant">,
) => {
  const normalizedAddress = address.toLowerCase();
  const variables = descriptor.toVariables({
    address: normalizedAddress,
    networkId,
  });

  const sink: CodexSink<TData> = {
    next: (result) => {
      if (result.errors?.length) {
        const message =
          result.errors
            .map((error) => error?.message)
            .filter(Boolean)
            .join(", ") ?? "Subscription error";
        onError?.(message);
        return;
      }
      const events = descriptor
        .select(result.data ?? null)
        .map((event) => normalizeSdkEvent(event))
        .filter((event): event is GraphqlTokenEvent =>
          Boolean(event && (!event.networkId || event.networkId === networkId)),
        );
      if (events.length) onEvents(events);
    },
    error: (err) => {
      const message = extractErrorMessage(err) ?? "Subscription error";
      onError?.(message);
    },
    complete: () => undefined,
  };

  let unsubscribe: RawUnsubscribe | void;
  try {
    unsubscribe = await Promise.resolve(
      descriptor.subscribe(sdk, variables, sink),
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to start token events subscription";
    onError?.(message);
    throw error;
  }

  return toSafeUnsubscribe(unsubscribe);
};

export const subscribeToTokenEvents = (
  options: SubscribeToTokenEventsOptions,
) => {
  const { variant, ...rest } = options;
  if (variant === "sol") {
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

export const fetchRecentTokenEvents = async ({
  sdk,
  address,
  networkId,
  limit,
}: FetchRecentOptions) => {
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
    const message =
      error instanceof Error ? error.message : "Failed to fetch token events";
    throw new Error(message);
  }

  const items = response.getTokenEvents?.items ?? [];
  console.log({items})
  return items
    .map((event) => normalizeSdkEvent(event as Record<string, unknown> | null))
    .filter((event): event is GraphqlTokenEvent =>
      Boolean(event && (!event.networkId || event.networkId === networkId)),
    )
    .sort((a, b) => {
      const aTs =
        typeof a.timestamp === "number"
          ? a.timestamp
          : Date.parse(String(a.timestamp ?? 0));
      const bTs =
        typeof b.timestamp === "number"
          ? b.timestamp
          : Date.parse(String(b.timestamp ?? 0));
      return bTs - aTs;
    })
    .slice(0, limit);
};
