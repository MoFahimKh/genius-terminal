'use client';

import type { OrderLevel, TradeEntry } from '@/mock/data';
import { twMerge } from 'tailwind-merge';

export const SellOrderCard = ({ asks }: { asks: OrderLevel[] }) => (
  <div className="flex flex-col">
    {asks.map((ask, idx) => (
      <div
        key={`ask-${idx}`}
        className={twMerge(
          'relative grid grid-cols-3 border-[#454545]/80 px-4 py-1',
          idx % 2 === 0 ? 'bg-[#17181b]/50' : '',
        )}>
        <div
          className="absolute inset-y-0 left-0 bg-[#780000]/30"
          style={{ width: `${ask.depthPercent}%` }}
        />
        <span className="z-10 text-[11px] font-semibold text-[#FF0000]">{ask.price}</span>
        <span className="z-10 text-center text-[11px] font-semibold text-white">{ask.amount}</span>
        <span className="z-10 text-right text-[11px] font-semibold text-white">{ask.total}</span>
      </div>
    ))}
  </div>
);

export const BuyOrderCard = ({ bids }: { bids: OrderLevel[] }) => (
  <div className="flex flex-col">
    {bids.map((bid, idx) => (
      <div
        key={`bid-${idx}`}
        className={twMerge(
          'relative grid grid-cols-3 border-[#454545]/80 px-4 py-1',
          idx % 2 === 0 ? 'bg-[#17181b]/50' : '',
        )}>
        <div
          className="absolute inset-y-0 left-0 bg-green-900/40"
          style={{ width: `${bid.depthPercent}%` }}
        />
        <span className="z-10 text-[11px] font-semibold text-[#00FF26]">{bid.price}</span>
        <span className="z-10 text-center text-[11px] font-semibold text-white">{bid.amount}</span>
        <span className="z-10 text-right text-[11px] font-semibold text-white">{bid.total}</span>
      </div>
    ))}
  </div>
);

export const TradeHistoryCard = ({ trades }: { trades: TradeEntry[] }) => (
  <div className="flex flex-col">
    {trades.map((trade, idx) => (
      <div
        key={`trade-${idx}`}
        className={twMerge(
          'relative grid grid-cols-3 px-4 py-1.5 text-xs font-bold',
          idx % 2 === 0 ? 'bg-[#17181b]/50' : '',
        )}>
        <span className={twMerge('z-10 text-[11px]', trade.type === 'buy' ? 'text-[#00FF26]' : 'text-[#FF0000]')}>
          {trade.price}
        </span>
        <span className="z-10 text-center text-[11px] text-white">{trade.amount}</span>
        <span className="z-10 text-right text-[11px] text-white">{trade.time}</span>
      </div>
    ))}
  </div>
);
