
const TOKEN_FORMATTER = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export const formatUsd = (value: number | null) => {
  if (!value) return "0";
  const absValue = Math.abs(value);

  const format = (num: number) =>
    num % 1 === 0 ? `$${num}` : num.toFixed(1).replace(/\.0$/, "");

  if (absValue >= 1_000_000_000) {
    return `${value < 0 ? "-" : ""}${format(absValue / 1_000_000_000)}B`;
  }
  if (absValue >= 1_000_000) {
    return `$${value < 0 ? "-" : ""}${format(absValue / 1_000_000)}M`;
  }
  if (absValue >= 1_000) {
    return `$${value < 0 ? "-" : ""}${format(absValue / 1_000)}K`;
  }

  return `$${value.toFixed(2)}`;
};

export const formatTokenAmount = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(3)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(3)}K`;
  }
  return TOKEN_FORMATTER.format(value);
};

export const truncateAddress = (address?: string | null, chars = 4) => {
  if (!address) return "—";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
};

const RELATIVE_INTERVALS = [
  { label: "d", ms: 86_400_000 },
  { label: "h", ms: 3_600_000 },
  { label: "m", ms: 60_000 },
  { label: "s", ms: 1000 },
] as const;

export const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = Math.max(0, now - timestamp);

  for (const interval of RELATIVE_INTERVALS) {
    if (diff >= interval.ms || interval.label === "s") {
      const value = Math.floor(diff / interval.ms);
      return `${value}${interval.label}`;
    }
  }
  return "0s";
};

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export const formatCount = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "—";
  if (value < 1_000) return value.toLocaleString();
  return compactNumberFormatter.format(value);
};

export const formatAge = (ageMs: number | null) => {
  if (!ageMs || Number.isNaN(ageMs)) return "—";
  const totalMinutes = Math.floor(ageMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d, ${hours}h`;
  if (hours > 0) return `${hours}h, ${minutes}m`;
  return `${Math.max(minutes, 0)}m`;
};

export const truncatePlatformName = (value: string) => {
  if (value.length <= 7) return value;
  return `${value.slice(0, 7)}…`;
};