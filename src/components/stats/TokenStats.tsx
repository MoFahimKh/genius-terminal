'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';

import { mockMarketData } from '@/mock/data';
import { TokenIcon } from '@/components/common/TokenIcon';
import { CollapseToggle } from '@/components/common/CollapseToggle';
import { MockChart } from '@/components/chart/MockChart';

export const TokenStats = () => {
  const [collapsed, setCollapsed] = useState(false);

  const infoClass = useMemo(
    () =>
      [
        'flex w-full flex-col gap-2 px-4 transition-all duration-300 ease-in-out md:flex-row md:gap-3 overflow-hidden',
        collapsed ? 'max-h-0 py-0 opacity-0 pointer-events-none' : 'max-h-[500px] py-3 opacity-100',
      ].join(' '),
    [collapsed],
  );

  return (
    <div className="border-default relative flex h-full min-h-0 flex-1 flex-col border-r border-white/5">
      <div className="relative pb-4">
        <div className={infoClass} aria-hidden={collapsed}>
          <div className="flex shrink-0 items-center gap-2">
            <TokenIcon symbol={mockMarketData.symbol} size={40} />
            <div className="flex flex-col">
              <button className="flex cursor-pointer items-center gap-1">
                <p className="text-lg font-semibold tracking-wide text-white uppercase">{mockMarketData.symbol}</p>
                <ChevronDown size={14} className="text-white" />
              </button>
              <span className="text-xs uppercase text-white/60">{mockMarketData.pair}</span>
            </div>
          </div>

          <div className="flex w-full flex-col justify-between gap-2 md:flex-row md:flex-nowrap md:items-center md:gap-6">
            <div className="flex w-full items-center justify-between gap-4 md:contents">
              <Stat label="Price" value={`$${mockMarketData.price.toLocaleString()}`} />
              <Stat
                label="24H Change"
                value={`${mockMarketData.changePct > 0 ? '+' : ''}${mockMarketData.changePct.toFixed(2)}%`}
                accent={mockMarketData.changePct >= 0 ? 'text-[#00FF26]' : 'text-[#FF0000]'}
              />
              <Stat label="24H Volume" value={`$${(mockMarketData.volume24h / 1_000_000).toFixed(2)}M`} />
            </div>

            <div className="flex w-full items-center justify-between gap-4 md:contents">
              <Stat label="Market Cap" value={`$${(mockMarketData.marketCap / 1_000_000_000).toFixed(2)}B`} />
              <div className="flex flex-col">
                <span className="text-muted text-[10px] font-bold uppercase">Contract</span>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{mockMarketData.contract}</p>
                  <ExternalLink size={13} className="text-white/50 transition-colors hover:text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <CollapseToggle isCollapsed={collapsed} onClick={() => setCollapsed((p) => !p)} />
      </div>

      <div className="border-default relative min-h-[320px] flex-1 border-t border-white/5">
        <MockChart />
      </div>
    </div>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
  <div className="flex flex-col">
    <span className="text-muted text-[10px] font-bold uppercase">{label}</span>
    <p className={`text-sm font-medium text-white ${accent ?? ''}`}>{value}</p>
  </div>
);
