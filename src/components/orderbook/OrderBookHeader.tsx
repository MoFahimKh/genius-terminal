'use client';

import { EllipsisVertical } from 'lucide-react';
import { useState, useRef, Dispatch, SetStateAction } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import type { LayoutType } from './OrderBookSection';

export const OrderBookHeader = ({
  currentTab,
  setCurrentTab,
  currentOrderbookLayout,
  setCurrentOrderbookLayout,
  isTabLayout,
  isLargeLayout,
  settableLayoutSetting,
}: {
  currentTab: 'orderBook' | 'traders';
  setCurrentTab: (tab: 'orderBook' | 'traders') => void;
  currentOrderbookLayout: LayoutType;
  setCurrentOrderbookLayout: (layout: LayoutType) => void;
  isTabLayout: boolean;
  isLargeLayout: boolean;
  settableLayoutSetting: Dispatch<SetStateAction<'onlySell' | 'onlyBuy' | 'both'>>;
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setOpen(false));

  return (
    <div className="border-default flex w-full items-center justify-between border-b p-2 h-[50px] md:h-auto">
      {isTabLayout ? (
        <div className="flex gap-2">
          {['orderBook', 'traders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab as 'orderBook' | 'traders')}
              className={twMerge(
                'rounded-default px-2 py-1 text-xs h-[39px] md:h-auto w-[156px] md:w-auto font-bold uppercase tracking-wide',
                currentTab === tab ? 'bg-neutral-800 text-white' : 'text-muted',
              )}>
              {tab === 'orderBook' ? 'Order Book' : 'Trades'}
            </button>
          ))}
        </div>
      ) : isLargeLayout ? (
        <div className="flex w-full items-center justify-between">
          <p className="text-xs font-semibold tracking-wide text-white uppercase">Order Book</p>
          <p className="relative right-[30%] text-xs font-semibold tracking-wide text-white uppercase">Trades</p>
        </div>
      ) : (
        <p className="text-xs font-semibold tracking-wide text-white uppercase">Order Book</p>
      )}

      <button onClick={() => setOpen((prev) => !prev)} className="relative z-20 cursor-pointer">
        <EllipsisVertical size={15} className="opacity-60 transition-opacity duration-200 hover:opacity-100" />
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-default card-bg border-default absolute top-5 right-0 z-20 flex flex-col border text-xs font-semibold tracking-wide capitalize shadow-lg">
              {['tab', 'stacked', 'large'].map((layout) => (
                <button
                  key={layout}
                  onClick={(e) => {
                    e.stopPropagation();
                    settableLayoutSetting('both');
                    setCurrentOrderbookLayout(layout as LayoutType);
                    setOpen(false);
                  }}
                  className={twMerge(
                    'w-full py-1 pr-4 pl-2.5 text-left text-neutral-400 capitalize transition-colors duration-200 hover:bg-neutral-800 hover:text-white',
                    currentOrderbookLayout === layout ? 'text-white' : '',
                  )}>
                  {layout}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
