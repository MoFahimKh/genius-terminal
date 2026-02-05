'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { mockTables } from '@/mock/data';

const FILTERS = ['Balances', 'Positions', 'Open Orders', 'Trade History', 'Order History'] as const;

type Filter = (typeof FILTERS)[number];

type TableComponentProps = { searchTerm: string };

const BalancesTable = ({ searchTerm }: TableComponentProps) => {
  const rows = mockTables.balances.filter((row) => row.coin.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <table className="w-full text-left text-sm text-white">
      <thead className="text-[11px] uppercase text-muted">
        <tr className="border-b border-white/10">
          <th className="px-4 py-2">Coin</th>
          <th className="px-4 py-2">Total Balance</th>
          <th className="px-4 py-2">Available Balance</th>
          <th className="px-4 py-2">PNL Value</th>
          <th className="px-4 py-2">Send</th>
          <th className="px-4 py-2">Transfer</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.coin} className="border-b border-white/5 text-[13px]">
            <td className="px-4 py-2">{row.coin}</td>
            <td className="px-4 py-2">{row.total}</td>
            <td className="px-4 py-2">{row.available}</td>
            <td className="px-4 py-2 text-[#00FF26]">{row.pnl}</td>
            <td className="px-4 py-2">{row.send ? '—' : ''}</td>
            <td className="px-4 py-2">{row.transfer ? '—' : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

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

const TradeHistoryTable = () => (
  <table className="w-full text-left text-sm text-white">
    <thead className="text-[11px] uppercase text-muted">
      <tr className="border-b border-white/10">
        <th className="px-4 py-2">Price</th>
        <th className="px-4 py-2">Amount</th>
        <th className="px-4 py-2">Time</th>
      </tr>
    </thead>
    <tbody>
      {mockTables.tradeHistory.map((row, idx) => (
        <tr key={`${row.price}-${idx}`} className="border-b border-white/5 text-[13px]">
          <td className={twMerge('px-4 py-2', row.type === 'buy' ? 'text-[#00FF26]' : 'text-[#FF0000]')}>{row.price}</td>
          <td className="px-4 py-2">{row.amount}</td>
          <td className="px-4 py-2">{row.time}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const OrderHistoryTable = () => (
  <table className="w-full text-left text-sm text-white">
    <thead className="text-[11px] uppercase text-muted">
      <tr className="border-b border-white/10">
        <th className="px-4 py-2">Pair</th>
        <th className="px-4 py-2">Action</th>
        <th className="px-4 py-2">Size</th>
        <th className="px-4 py-2">Price</th>
        <th className="px-4 py-2">Time</th>
      </tr>
    </thead>
    <tbody>
      {mockTables.orderHistory.map((row) => (
        <tr key={row.pair} className="border-b border-white/5 text-[13px]">
          <td className="px-4 py-2">{row.pair}</td>
          <td className="px-4 py-2">{row.action}</td>
          <td className="px-4 py-2">{row.size}</td>
          <td className="px-4 py-2">{row.price}</td>
          <td className="px-4 py-2">{row.time}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TABLE_COMPONENTS: Record<Filter, React.FC<TableComponentProps>> = {
  Balances: BalancesTable,
  Positions: PositionsTable,
  'Open Orders': OpenOrdersTable,
  'Trade History': TradeHistoryTable,
  'Order History': OrderHistoryTable,
};

export const TableSection = () => {
  const [selectedFilter, setSelectedFilter] = useState<Filter>('Balances');
  const [searchInput, setSearchInput] = useState('');

  const TableComponent = useMemo(() => TABLE_COMPONENTS[selectedFilter], [selectedFilter]);

  return (
    <div className="flex h-full min-h-0 flex-1 shrink-0 flex-col overflow-hidden">
      <div className="invisible-scroll flex shrink-0 items-center justify-between overflow-x-auto border-y border-[#454545]/50 px-3 py-1">
        <div className="flex shrink-0 flex-nowrap items-center">
          {FILTERS.map((item) => (
            <button
              key={item}
              className={twMerge(
                'rounded-default mx-2 flex-shrink-0 border-none px-3 py-1.5 text-xs font-semibold uppercase transition-all duration-200',
                selectedFilter === item ? 'bg-[#022D9299] text-white' : 'text-muted',
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
      <div className="invisible-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="min-w-[640px]">
          <TableComponent searchTerm={searchInput} />
        </div>
      </div>
    </div>
  );
};
