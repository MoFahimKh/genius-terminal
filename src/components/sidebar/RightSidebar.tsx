'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { mockMarketData, mockRouteInfo } from '@/mock/data';

const TokenBuySellButtons = ({ selected, onChange }: { selected: 'BUY' | 'SELL'; onChange: (value: 'BUY' | 'SELL') => void }) => (
  <div className="grid grid-cols-2 font-medium">
    {(['BUY', 'SELL'] as const).map((option) => (
      <button
        key={option}
        onClick={() => onChange(option)}
        className={twMerge(
          'cursor-pointer py-2 text-center text-xs font-bold',
          option === 'BUY' ? 'rounded-l-default' : 'rounded-r-default',
          selected === option
            ? option === 'BUY'
              ? 'bg-[#00c22063] text-[#00FF26]'
              : 'bg-[#ff000063] text-[#FF0000]'
            : 'text-muted',
        )}>
        {option}
      </button>
    ))}
  </div>
);

export const RightSidebar = () => {
  const [selectedOption, setSelectedOption] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [limit, setLimit] = useState('');

  return (
    <div className="invisible-scroll flex h-full min-h-0 flex-col overflow-y-auto md:border-l md:border-white/5">
      <div className="sticky top-0 z-10 bg-[#121212]">
        <TokenBuySellButtons selected={selectedOption} onChange={setSelectedOption} />
      </div>
      <div className="flex flex-col gap-4 px-4 py-4">
        <section className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-muted">Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="rounded-default border border-white/10 bg-[#0D0D0E] px-3 py-2 text-white outline-none"
          />
          <label className="text-xs font-semibold text-muted">Limit Price (USDC)</label>
          <input
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder={mockMarketData.price.toFixed(3)}
            className="rounded-default border border-white/10 bg-[#0D0D0E] px-3 py-2 text-white outline-none"
          />
          <button className="rounded-default bg-white px-4 py-2 text-xs font-bold text-black uppercase transition-transform active:scale-95">
            {selectedOption} {mockMarketData.symbol}
          </button>
        </section>
        <section className="rounded-default border border-white/10 bg-[#0D0D0E] p-3 text-xs text-white/80">
          <h4 className="mb-2 text-[11px] font-bold uppercase text-muted">Route</h4>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            {mockRouteInfo.route.map((hop, idx) => (
              <span key={hop} className="flex items-center gap-2">
                {hop}
                {idx < mockRouteInfo.route.length - 1 && <span className="text-muted">→</span>}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1 text-[11px]">
            <p>Fees: {mockRouteInfo.fees}</p>
            <p>Price Impact: {mockRouteInfo.priceImpact}</p>
          </div>
        </section>
        <section className="rounded-default border border-white/10 bg-[#0D0D0E] p-3 text-xs text-white/80">
          <h4 className="mb-2 text-[11px] font-bold uppercase text-muted">Account</h4>
          <p>Wallet disconnected</p>
          <button className="mt-3 rounded-default border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase">Connect</button>
        </section>
      </div>
    </div>
  );
};
