'use client';

import { MutableRefObject } from 'react';
import type { OrderLevel, TradeEntry } from '@/mock/data';
import { SellOrderCard, BuyOrderCard, TradeHistoryCard } from './OrderBookCards';
import { OrderBookFooter, LayoutSetting } from './OrderBookFooter';

export type Denom = 'base' | 'quote';

export type OrderBookContentProps = {
  asks: OrderLevel[];
  bids: OrderLevel[];
  showSellSide: boolean;
  showBuySide: boolean;
  showSpread: boolean;
  isStackedLayout: boolean;
  sellScrollRef: MutableRefObject<HTMLDivElement | null>;
  spread: string;
  spreadPercent: string;
  grouping: number;
  setGrouping: (val: number) => void;
  baseToken: string;
  quoteToken: string;
  denom: Denom;
  setDenom: (val: Denom) => void;
  setTabLayoutSetting: (val: LayoutSetting) => void;
  tradeHistory: TradeEntry[];
};

export const TradeHistoryContent = ({ tradeHistory }: { tradeHistory: TradeEntry[] }) => (
  <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
    <div className="invisible-scroll min-h-0 flex-1 overflow-y-auto">
      <TradeHistoryCard trades={tradeHistory} />
    </div>
  </div>
);

const SpreadRow = ({ spread, spreadPercent }: { spread: string; spreadPercent: string }) => (
  <div className="border-default grid grid-cols-3 border-t border-b px-4 py-1.5 text-xs font-bold text-neutral-200">
    <span className="text-[11px]">Spread</span>
    <span className="text-center text-[11px]">{spread}</span>
    <span className="text-right text-[11px]">{spreadPercent}</span>
  </div>
);

export const OrderBookContent = ({
  asks,
  bids,
  showSellSide,
  showBuySide,
  showSpread,
  isStackedLayout,
  sellScrollRef,
  spread,
  spreadPercent,
  grouping,
  setGrouping,
  baseToken,
  quoteToken,
  denom,
  setDenom,
  setTabLayoutSetting,
  tradeHistory,
}: OrderBookContentProps) => (
  <div className="flex h-full min-h-0 flex-col">
    {showSellSide && (
      <div ref={sellScrollRef} className="invisible-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-end">
          <SellOrderCard asks={asks} />
        </div>
      </div>
    )}
    {showSpread && <SpreadRow spread={spread} spreadPercent={spreadPercent} />}
    {showBuySide && (
      <div className="invisible-scroll min-h-0 flex-1 overflow-y-auto">
        <BuyOrderCard bids={bids} />
      </div>
    )}
    {!isStackedLayout && (
      <OrderBookFooter
        setTabLayoutSetting={setTabLayoutSetting}
        grouping={grouping}
        setGrouping={setGrouping}
        baseToken={baseToken}
        quoteToken={quoteToken}
        currentDenom={denom}
        setDenom={setDenom}
      />
    )}
  </div>
);
