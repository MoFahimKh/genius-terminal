'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { LiveTradesTable } from '@/components/tables/LiveTradesTable';
import { PoolsTable as TokenPoolsTable } from '@/components/tables/PoolsTable';
import { useTokenEvents } from '@/context/TokenEventsContext';
import { useTokenHolders } from '@/hooks/useTokenHolders';
import { formatTokenAmount, formatUsd, truncateAddress } from '@/lib/format';
import { mockTables } from '@/mock/data';

const FILTERS = ['Trades', 'Positions', 'Pools', 'Holders', 'Traders', 'Orders', 'History', 'Exited'] as const;

type Filter = (typeof FILTERS)[number];

type TableComponentProps = { searchTerm: string };

const PositionsTable = () => (
  <table className="w-full text-left text-sm text-white">
    <thead className="text-[11px] uppercase text-muted">
      <tr className="border-b border-white/10">
        <th className="px-4 py-2">Pair</th>
        <th className="px-4 py-2">Size</th>
        <th className="px-4 py-2">Entry</th>
        <th className="px-4 py-2">Mark</th>
        <th className="px-4 py-2">PNL</th>
      </tr>
    </thead>
    <tbody>
      {mockTables.positions.map((row) => (
        <tr key={row.pair} className="border-b border-white/5 text-[13px]">
          <td className="px-4 py-2">{row.pair}</td>
          <td className="px-4 py-2">{row.size}</td>
          <td className="px-4 py-2">{row.entry}</td>
          <td className="px-4 py-2">{row.mark}</td>
          <td className="px-4 py-2 text-[#FFB347]">{row.pnl}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const OpenOrdersTable = () => (
  <table className="w-full text-left text-sm text-white">
    <thead className="text-[11px] uppercase text-muted">
      <tr className="border-b border-white/10">
        <th className="px-4 py-2">Pair</th>
        <th className="px-4 py-2">Type</th>
        <th className="px-4 py-2">Size</th>
        <th className="px-4 py-2">Price</th>
        <th className="px-4 py-2">Status</th>
      </tr>
    </thead>
    <tbody>
      {mockTables.openOrders.map((row) => (
        <tr key={row.pair} className="border-b border-white/5 text-[13px]">
          <td className="px-4 py-2">{row.pair}</td>
          <td className="px-4 py-2">{row.type}</td>
          <td className="px-4 py-2">{row.size}</td>
          <td className="px-4 py-2">{row.price}</td>
          <td className="px-4 py-2 text-[#FFA500]">{row.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const OrdersTable = () => (
  <table className="w-full text-left text-sm text-white">
    <thead className="text-[11px] uppercase text-muted">
      <tr className="border-b border-white/10">
        <th className="px-4 py-2">Pair</th>
        <th className="px-4 py-2">Type</th>
        <th className="px-4 py-2">Size</th>
        <th className="px-4 py-2">Price</th>
        <th className="px-4 py-2">Status</th>
      </tr>
    </thead>
    <tbody>
      {mockTables.openOrders.map((row) => (
        <tr key={row.pair} className="border-b border-white/5 text-[13px]">
          <td className="px-4 py-2">{row.pair}</td>
          <td className="px-4 py-2">{row.type}</td>
          <td className="px-4 py-2">{row.size}</td>
          <td className="px-4 py-2">{row.price}</td>
          <td className="px-4 py-2 text-[#FFA500]">{row.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const PlaceholderTable = ({ message }: { message: string }) => (
  <div className="flex h-full min-h-[240px] items-center justify-center rounded-default border border-white/10 bg-black/10 text-sm text-white/60">
    {message}
  </div>
);

const TradesTable: React.FC<TableComponentProps> = () => <LiveTradesTable />;
const HoldersTable: React.FC<TableComponentProps> = ({ searchTerm }) => {
  const { address, networkId } = useTokenEvents();
  const { holders, loading, error, totalCount, top10HoldersPercent } = useTokenHolders(address, networkId);

  if (!address || !networkId) {
    return <PlaceholderTable message="Select a token to view top holders." />;
  }

  if (error) {
    return <PlaceholderTable message={error} />;
  }

  if (loading) {
    return <PlaceholderTable message="Loading holders…" />;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredHolders =
    normalizedSearch.length === 0
      ? holders
      : holders.filter((holder) => holder.address.toLowerCase().includes(normalizedSearch));

  if (filteredHolders.length === 0) {
    return <PlaceholderTable message={normalizedSearch ? 'No holders match your search.' : 'No holder data received yet.'} />;
  }

  const maxBalance = Math.max(...filteredHolders.map((holder) => holder.shiftedBalance), 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-4 text-xs text-white/70">
        <span>Total holders: {totalCount.toLocaleString()}</span>
        {top10HoldersPercent !== null && (
          <span>Top 10 control {Number(top10HoldersPercent).toFixed(2)}%</span>
        )}
      </div>
      <div className="invisible-scroll overflow-x-auto rounded-default border border-white/10">
        <table className="w-full min-w-[640px] table-fixed text-sm text-white">
          <thead className="bg-white/5 text-[11px] uppercase text-muted">
            <tr>
              <th className="w-12 px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Holder</th>
              <th className="px-3 py-2 text-left">Balance</th>
              <th className="px-3 py-2 text-left">Balance (USD)</th>
            </tr>
          </thead>
          <tbody>
            {filteredHolders.map((holder) => (
              <tr key={holder.address} className="border-b border-white/5 text-[13px]">
                <td className="px-3 py-3 text-white/60">{holder.rank}</td>
                <td className="px-3 py-3 font-semibold text-[#7DD3FC]">{truncateAddress(holder.address)}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-white">{formatTokenAmount(holder.shiftedBalance)}</span>
                    {maxBalance > 0 && (
                      <div className="h-1.5 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#F472B6]"
                          style={{ width: `${(holder.shiftedBalance / maxBalance) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-white/80">
                  {holder.balanceUsd === null ? '—' : formatUsd(holder.balanceUsd)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const TradersTable: React.FC<TableComponentProps> = () => <PlaceholderTable message="Traders data is not available yet." />;
const HistoryTable: React.FC<TableComponentProps> = () => <PlaceholderTable message="Nothing here yet, it is ok." />;
const ExitedTable: React.FC<TableComponentProps> = () => <PlaceholderTable message="Nothing here yet, it is ok." />;

const TABLE_COMPONENTS: Record<Filter, React.FC<TableComponentProps>> = {
  Trades: TradesTable,
  Positions: PositionsTable,
  Pools: (props) => <TokenPoolsTable {...props} />,
  Holders: HoldersTable,
  Traders: TradersTable,
  Orders: OrdersTable,
  History: HistoryTable,
  Exited: ExitedTable,
};

export const TableSection = () => {
  const [selectedFilter, setSelectedFilter] = useState<Filter>('Trades');
  const [searchInput, setSearchInput] = useState('');

  const TableComponent = useMemo(() => TABLE_COMPONENTS[selectedFilter], [selectedFilter]);

  return (
    <div className="flex h-full min-h-0 flex-1 shrink-0 flex-col overflow-hidden">
      <div className="invisible-scroll flex shrink-0 items-center justify-between overflow-x-auto border-y border-[#454545]/50 px-3 py-3">
        <div className="flex shrink-0 flex-nowrap items-center">
          {FILTERS.map((item) => (
            <button
              key={item}
              className={twMerge(
                'rounded-sm flex-shrink-0 border-none px-2 py-0.5 text-[14px] font-medium transition-all duration-200',
                selectedFilter === item ? 'bg-[#231646] text-[#eee0ff]' : 'text-[#eee0ff99]',
              )}
              onClick={() => setSelectedFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <div className="rounded-default flex items-center bg-[#1B1B1B] px-2 py-0.5">
            <input
              type="text"
              placeholder="Search"
              onChange={(e) => setSearchInput(e.target.value)}
              value={searchInput}
              className="bg-transparent text-sm font-semibold text-white placeholder:text-[#727272] focus:outline-none"
            />
            <Search className="size-3 text-[#727272]" />
          </div>
        </div>
      </div>
      <div className="invisible-scroll min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <TableComponent searchTerm={searchInput} />
      </div>
    </div>
  );
};
