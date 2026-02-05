'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { mockAsks, mockBids, mockMarketData, mockTrades } from '@/mock/data';
import { OrderBookContent, TradeHistoryContent, Denom } from './OrderBookContent';
import { OrderBookHeader } from './OrderBookHeader';
import { ExpandButton } from './ExpandButton';

export type LayoutType = 'tab' | 'stacked' | 'large';

type TabView = 'orderBook' | 'traders';

type Props = {
  isExpanded: boolean;
  onToggleExpand: () => void;
};

export const OrderBookSection = ({ isExpanded, onToggleExpand }: Props) => {
  const quoteToken = mockMarketData.quoteSymbol;

  const [grouping, setGrouping] = useState(0.01);
  const [denom, setDenom] = useState<Denom>('base');
  const [currentTab, setCurrentTab] = useState<TabView>('orderBook');
  const [currentOrderbookLayout, setCurrentOrderbookLayout] = useState<LayoutType>('tab');
  const [tabLayoutSetting, setTabLayoutSetting] = useState<'onlySell' | 'onlyBuy' | 'both'>('both');

  const sellScrollRef = useRef<HTMLDivElement | null>(null);
  const hasSnappedRef = useRef(false);

  const isTabLayout = currentOrderbookLayout === 'tab';
  const isStackedLayout = currentOrderbookLayout === 'stacked';
  const isLargeLayout = currentOrderbookLayout === 'large';
  const showSellSide = tabLayoutSetting !== 'onlyBuy';
  const showBuySide = tabLayoutSetting !== 'onlySell';
  const showSpread = showSellSide && showBuySide;

  useEffect(() => {
    hasSnappedRef.current = false;
  }, [grouping, denom, currentTab, currentOrderbookLayout, tabLayoutSetting]);

  useEffect(() => {
    if (!showSellSide) return;
    if (!hasSnappedRef.current && mockAsks.length > 0) {
      const el = sellScrollRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
        hasSnappedRef.current = true;
      }
    }
  }, [showSellSide]);

  const spread = mockAsks[0] && mockBids[0] ? (Number(mockAsks[0].price) - Number(mockBids[0].price)).toFixed(3) : '0.000';
  const spreadPercent = `${(((Number(spread) / Number(mockBids[0]?.price || 1)) || 0) * 100).toFixed(2)}%`;

  const amountLabel = denom === 'base' ? `AMOUNT(${mockMarketData.symbol})` : `SIZE(${quoteToken})`;
  const totalLabel = denom === 'base' ? `TOTAL(${mockMarketData.symbol})` : `TOTAL(${quoteToken})`;

  const contentProps = {
    asks: mockAsks,
    bids: mockBids,
    showSellSide,
    showBuySide,
    showSpread,
    isStackedLayout,
    sellScrollRef,
    spread,
    spreadPercent,
    grouping,
    setGrouping,
    baseToken: mockMarketData.symbol,
    quoteToken,
    denom,
    setDenom,
    setTabLayoutSetting,
    tradeHistory: mockTrades,
  } as const;

  return (
    <div
      className={twMerge(
        'border-default relative flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden border-b border-l border-white/5 transition-[max-height] duration-300 ease-in-out',
        isLargeLayout ? 'md:w-[35rem]' : 'md:w-[18rem]',
      )}>
      <OrderBookHeader
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentOrderbookLayout={currentOrderbookLayout}
        setCurrentOrderbookLayout={setCurrentOrderbookLayout}
        settableLayoutSetting={setTabLayoutSetting}
        isTabLayout={isTabLayout}
        isLargeLayout={isLargeLayout}
      />
      <div className="min-h-0 flex-1 overflow-hidden">
        {isTabLayout && (
          <div className="flex h-full min-h-0 flex-col">
            <ColumnHeader view={currentTab} amountLabel={amountLabel} totalLabel={totalLabel} ticker={mockMarketData.symbol} />
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {currentTab === 'orderBook' ? (
                <OrderBookContent {...contentProps} />
              ) : (
                <TradeHistoryContent tradeHistory={mockTrades} />
              )}
            </div>
          </div>
        )}
        {isStackedLayout && (
          <div className="flex h-full min-h-0 flex-col">
            <ColumnHeader view="orderBook" amountLabel={amountLabel} totalLabel={totalLabel} ticker={mockMarketData.symbol} />
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <OrderBookContent {...contentProps} />
            </div>
            <ColumnHeader view="traders" amountLabel={amountLabel} totalLabel={totalLabel} ticker={mockMarketData.symbol} />
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <TradeHistoryContent tradeHistory={mockTrades} />
            </div>
          </div>
        )}
        {isLargeLayout && (
          <div className="flex h-full min-h-0">
            <div className="flex min-h-0 flex-1 flex-col">
              <ColumnHeader view="orderBook" amountLabel={amountLabel} totalLabel={totalLabel} ticker={mockMarketData.symbol} />
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <OrderBookContent {...contentProps} />
              </div>
            </div>
            <div className="flex min-h-0 flex-[0.85] flex-col">
              <ColumnHeader view="traders" amountLabel={amountLabel} totalLabel={totalLabel} ticker={mockMarketData.symbol} />
              <div className="border-default flex min-h-0 flex-1 flex-col overflow-hidden border-l border-white/5">
                <TradeHistoryContent tradeHistory={mockTrades} />
              </div>
            </div>
          </div>
        )}
      </div>
      <ExpandButton onClick={onToggleExpand} isExpanded={isExpanded} isLargeLayout={isLargeLayout} />
    </div>
  );
};

const ColumnHeader = ({ view, amountLabel, totalLabel, ticker }: { view: TabView; amountLabel: string; totalLabel: string; ticker: string }) => (
  <div className="border-default z-[10] grid grid-cols-[0.7fr_1fr_1fr] border-b bg-[#0D0D0E] text-xs font-bold text-neutral-500 uppercase">
    <span className="w-full px-2 py-1.5 text-left text-[11px]">PRICE</span>
    <span className="ml-7 w-full py-1.5 text-left text-[11px]">
      {view === 'orderBook' ? amountLabel : `Size(${ticker})`}
    </span>
    <span className="w-full px-2 py-1.5 text-right text-[11px]">{view === 'orderBook' ? totalLabel : 'Time'}</span>
  </div>
);
