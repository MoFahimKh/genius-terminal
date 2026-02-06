"use client";

import type { GraphqlTokenEvent, Unsubscribe } from "@/types";

type RawUnsubscribe = Unsubscribe | { unsubscribe: Unsubscribe } | void;

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

export const hasUnsubscribe = (
  value: unknown,
): value is { unsubscribe: Unsubscribe } =>
  Boolean(
    value &&
      typeof value === "object" &&
      "unsubscribe" in value &&
      typeof (value as { unsubscribe?: unknown }).unsubscribe === "function",
  );

export const toSafeUnsubscribe = (value?: RawUnsubscribe | null): Unsubscribe => {
  if (typeof value === "function") {
    return () => {
      const maybePromise = value();
      if (
        maybePromise &&
        typeof (maybePromise as Promise<void>).catch === "function"
      ) {
        (maybePromise as Promise<void>).catch(() => undefined);
      }
    };
  }
  if (hasUnsubscribe(value)) {
    return toSafeUnsubscribe(value.unsubscribe);
  }
  return () => undefined;
};

export const extractErrorMessage = (value: unknown): string | null => {
  if (value instanceof Error && value.message) return value.message;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const messages = value
      .map((item) => extractErrorMessage(item))
      .filter((msg): msg is string => Boolean(msg));
    return messages.length ? messages.join(", ") : null;
  }
  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return null;
};

const extractScalar = (value: unknown): string | number | null => {
  if (typeof value === "string" || typeof value === "number") return value;
  return null;
};

const pickScalar = (values: Array<string | number | null | undefined>) => {
  for (const value of values) {
    const scalar = extractScalar(value);
    if (scalar !== null && scalar !== undefined) {
      if (typeof scalar === "string") {
        if (scalar.trim() === "") continue;
      }
      return scalar;
    }
  }
  return null;
};

const getScalarField = (source: Record<string, unknown>, key: string) =>
  extractScalar(source[key]);

const getStringField = (source: Record<string, unknown>, key: string) => {
  const value = source[key];
  return typeof value === "string" ? value : null;
};

const getTimestampField = (source: Record<string, unknown>, key: string) => {
  const value = source[key];
  if (typeof value === "number" || typeof value === "string") return value;
  return null;
};

const getNumberField = (source: Record<string, unknown>, key: string) => {
  const value = source[key];
  return typeof value === "number" ? value : null;
};

const buildEventId = (incoming: Record<string, unknown>) => {
  const rawId = getScalarField(incoming, "id");
  if (rawId !== null && rawId !== undefined) {
    const asString = typeof rawId === "number" ? rawId.toString() : rawId;
    if (asString) return asString;
  }

  const txHash = getStringField(incoming, "transactionHash");
  const logIndex = getNumberField(incoming, "logIndex");
  const supplementalIndex = getNumberField(incoming, "supplementalIndex");
  if (txHash) {
    return [txHash, logIndex ?? "0", supplementalIndex ?? "0"].join(":");
  }

  const maker = getStringField(incoming, "maker");
  const timestamp = getTimestampField(incoming, "timestamp");
  if (maker && (timestamp || timestamp === 0)) {
    return [maker, timestamp].join(":");
  }

  return null;
};

export const normalizeSdkEvent = (
  incoming: Record<string, unknown> | null | undefined,
): GraphqlTokenEvent | null => {
  if (!incoming || typeof incoming !== "object") return null;
  const id = buildEventId(incoming);
  if (!id) return null;
  const data = (incoming as { data?: Record<string, unknown> | null }).data;
  const amountFields: AmountFields = {};
  let amountUsd: string | number | null = null;
  let priceUsd: string | number | null = null;
  let priceUsdTotal: string | number | null = null;
  let amountNonLiquidityToken: string | number | null = null;

  if (data && typeof data === "object") {
    const typename =
      typeof data.__typename === "string" ? data.__typename : undefined;
    const swap = data as SwapEventFields;
    const hasSwapFields =
      "amount0" in data ||
      "amount1" in data ||
      "amount0In" in data ||
      "amount1In" in data ||
      "amountNonLiquidityToken" in data ||
      "priceUsd" in data ||
      "priceUsdTotal" in data;

    if (
      typename === "SwapEventData" ||
      typename === "PoolBalanceChangedEventData" ||
      typename === "BurnEventData" ||
      typename === "MintEventData" ||
      typename === "UnconfirmedSwapEventData" ||
      hasSwapFields
    ) {
      amountFields.amount0 = pickScalar([
        swap.amount0Shifted,
        swap.amount0,
        swap.amount0In,
        swap.amount0Out,
        swap.amountBaseToken,
        swap.amountNonLiquidityToken,
        swap.amountNonLiquidityTokenShifted,
      ]);
      amountFields.amount1 = pickScalar([
        swap.amount1Shifted,
        swap.amount1,
        swap.amount1In,
        swap.amount1Out,
        swap.amountNonLiquidityToken,
        swap.amountNonLiquidityTokenShifted,
        swap.amountBaseToken,
      ]);
      amountNonLiquidityToken = pickScalar([
        swap.amountNonLiquidityTokenShifted,
        swap.amountNonLiquidityToken,
      ]);
      priceUsd = pickScalar([swap.priceUsd, swap.priceBaseToken]);
      priceUsdTotal = pickScalar([swap.priceUsdTotal, swap.priceBaseTokenTotal]);
      amountUsd = pickScalar([priceUsdTotal]);
    } else if (typename === "UnconfirmedLiquidityChangeEventData") {
      const swapAmounts = data as AmountFields;
      amountFields.amount0 = pickScalar([
        swapAmounts.amount0Shifted,
        swapAmounts.amount0,
      ]);
      amountFields.amount1 = pickScalar([
        swapAmounts.amount1Shifted,
        swapAmounts.amount1,
      ]);
    }
  }

  return {
    id,
    timestamp: getTimestampField(incoming, "timestamp"),
    makerAddress:
      getStringField(incoming, "maker") ??
      getStringField(incoming, "makerAddress"),
    networkId: getNumberField(incoming, "networkId"),
    eventDisplayType: getStringField(incoming, "eventDisplayType"),
    amount0: amountFields.amount0 ?? getScalarField(incoming, "amount0"),
    amount1: amountFields.amount1 ?? getScalarField(incoming, "amount1"),
    amountUSD:
      amountUsd ??
      getScalarField(incoming, "amountUSD") ??
      getScalarField(incoming, "amountUsd"),
    amountNonLiquidityToken,
    priceUsd,
    priceUsdTotal,
    token0SwapValueUsd: getScalarField(incoming, "token0SwapValueUsd"),
    token1SwapValueUsd: getScalarField(incoming, "token1SwapValueUsd"),
    raw: incoming,
  };
};
