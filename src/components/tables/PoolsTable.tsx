"use client";
import { Copy, ExternalLink } from "lucide-react";

import { useTokenEvents } from "@/context/TokenEventsContext";
import { useTokenPools } from "@/hooks/useTokenPools";
import { formatTokenAmount, formatUsd, truncateAddress } from "@/lib/format";
import { useState } from "react";

type PoolsTableProps = {
  searchTerm: string;
};

type LabelType = "1h" | "4h" | "12h" | "24h"

const VOLUME_WINDOWS:{key:string,label:LabelType}[] = [
  { key: "1h", label: "1h" },
  { key: "4h", label: "4h" },
  { key: "12h", label: "12h" },
  { key: "24h", label: "24h" },
];

export const PoolsTable = ({ searchTerm }: PoolsTableProps) => {
  const { address, networkId } = useTokenEvents();
  const [selectedVolume, setSelectedVolume] = useState<LabelType>(
    VOLUME_WINDOWS[0].label,
  );
  const { pools, loading, error } = useTokenPools(
    address,
    networkId ?? undefined,
  );

  if (!address || !networkId) {
    return <EmptyState message="Select a token to see its pools." />;
  }

  if (error) {
    return <EmptyState message={error} />;
  }

  if (loading) {
    return <EmptyState message="Loading pools…" />;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredPools =
    normalizedSearch.length === 0
      ? pools
      : pools.filter(
          (pool) =>
            pool.exchangeName.toLowerCase().includes(normalizedSearch) ||
            pool.pairLabel.toLowerCase().includes(normalizedSearch),
        );

  if (filteredPools.length === 0) {
    return (
      <EmptyState
        message={
          normalizedSearch
            ? "No pools match your search term."
            : "No pools found for this token yet."
        }
      />
    );
  }

  const handleCopy = (value?: string | null) => {
    if (!value || typeof navigator === "undefined") return;
    void navigator.clipboard?.writeText(value).catch(() => undefined);
  };

  return (
    <div className="rounded-default border border-white/10">
      <table className="w-full min-w-[800px] table-fixed text-sm text-white">
        <thead className="bg-[#1a1031] text-[11px] uppercase text-muted">
          <tr>
            <th className="px-3 py-2 text-left">Pool</th>
            <th className="px-3 py-2 text-left">Pair</th>
            <th className="px-3 py-2 text-left">Price / Mark Diff</th>
            <th className="px-3 py-2 text-left">Backing Asset Liquidity</th>
            <th className="px-3 py-2 text-left">
              <div className="flex gap-4 justify-center">
                Volume{" "}
                <div className="flex gap-2 text-white/40">
                  {VOLUME_WINDOWS.map((window) => (
                    <span
                      onClick={() => setSelectedVolume(window.label)}
                      className={`cursor-pointer select-none ${selectedVolume === window.label ? "text-[#eee0ff]" : ""}`}
                      key={window.key}
                    >
                      {window.label}
                    </span>
                  ))}
                </div>
              </div>
            </th>
            <th className="px-3 py-2 text-left">Age</th>
            <th className="px-3 py-2 text-left">Buy / Sell</th>
          </tr>
        </thead>
        <tbody>
          {filteredPools.map((pool) => (
            <tr key={pool.id} className="border-b border-white/5 text-[13px]">
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <ExchangeAvatar
                    name={pool.exchangeName}
                    iconUrl={pool.exchangeIcon}
                  />
                  <span className="font-semibold text-[14px] text-[#eee0ff]">
                    {pool.exchangeName}
                  </span>
                  <div className="flex gap-1 text-white/50">
                    <button
                      type="button"
                      onClick={() => handleCopy(pool.exchangeAddress)}
                      className="p-1 hover:text-white"
                      aria-label="Copy pool address"
                    >
                      <Copy className="size-3" />
                    </button>
                    {pool.tradeUrl && (
                      <a
                        href={pool.tradeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className=" p-1 hover:text-white"
                        aria-label="Open trade link"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              </td>

              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <TokenPairIcons
                    token0Icon={pool.token0Icon}
                    token1Icon={pool.token1Icon}
                  />
                  <span className="font-semibold text-[#eee0ff]">
                    {pool.pairLabel}
                  </span>
                </div>
              </td>

              <td className="px-3 py-3 text-white/60">Coming soon</td>

              <td className="px-3 py-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-[#eee0ff]">
                    {pool.liquidityTokenAmount && pool.liquidityTokenSymbol
                      ? `${formatTokenAmount(pool.liquidityTokenAmount)} ${pool.liquidityTokenSymbol}`
                      : "—"}
                  </span>
                  <span className="text-xs text-white/60">
                    {pool.liquidityUsd === null
                      ? "—"
                      : formatUsd(pool.liquidityUsd)}
                  </span>
                </div>
              </td>

              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-4 justify-center">
                  <span className="text-[#eee0ff]">{formatUsd(pool.volumeUsd[selectedVolume])}</span>
                </div>
              </td>

              <td className="px-3 py-3 text-[#eee0ff]">
                {formatAge(pool.createdAt)}
              </td>

              <td className="px-3 py-3 text-white/60">
                Coming soon
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex h-full min-h-[200px] items-center justify-center rounded-default border border-white/10 bg-black/20 text-sm text-white/70">
    {message}
  </div>
);

const ExchangeAvatar = ({
  name,
  iconUrl,
}: {
  name: string;
  iconUrl: string | null;
}) => {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={name}
        width={24}
        height={24}
        loading="lazy"
        className="size-6 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-[#2b1e4b] text-xs font-semibold uppercase text-white">
      {name.slice(0, 2)}
    </div>
  );
};

const TokenPairIcons = ({
  token0Icon,
  token1Icon,
}: {
  token0Icon: string | null;
  token1Icon: string | null;
}) => (
  <div className="relative flex size-8 items-center justify-center">
    <TokenIconCircle iconUrl={token0Icon} className="z-10" />
    <TokenIconCircle iconUrl={token1Icon} className="absolute left-4 top-1" />
  </div>
);

const TokenIconCircle = ({
  iconUrl,
  className,
}: {
  iconUrl: string | null;
  className?: string;
}) => (
  <div
    className={`flex size-5 items-center justify-center rounded-full border border-white/10 bg-[#1c1340] ${className ?? ""}`}
  >
    {iconUrl ? (
      <img
        src={iconUrl}
        alt=""
        width={20}
        height={20}
        loading="lazy"
        className="size-5 rounded-full object-cover"
      />
    ) : (
      <span className="text-[8px] text-white/70">?</span>
    )}
  </div>
);

const formatAge = (timestamp: number | null) => {
  if (!timestamp) return "—";
  const diff = Date.now() - timestamp;
  if (diff <= 0) return "0m";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days > 0) {
    return `${days}d${hours ? `, ${hours}h` : ""}`;
  }
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};
