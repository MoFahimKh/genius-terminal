"use client";

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { Apple, Wallet } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Metric } from '@/types';
import toast from 'react-hot-toast';

import { formatPercentChange } from '@/components/common/TrendingTokensStrip';
import { TokenBanner } from '@/components/sidebar/TokenBanner';
import { useTokenStats } from '@/hooks/useTokenStats';
import { formatCount, formatUsd } from '@/lib/format';

const WELCOME_IMAGE = {
  src: "/assets/images/welcome.png",
  width: 688,
  height: 692,
};
type AuthButton = {
  label: string;
  icon: ReactNode;
};

const BUTTONS: AuthButton[] = [
  {
    label: "Continue with Google",
    icon: (
      <span className="flex h-7 w-7 items-center justify-center rounded-md text-base font-black text-[#1D0035]">
        G
      </span>
    ),
  },
  {
    label: "Continue with Apple",
    icon: <Apple className="h-5 w-5 text-[#1D0035]" strokeWidth={2.2} />,
  },
  {
    label: "Connect with Wallet",
    icon: <Wallet className="h-5 w-5 text-[#1D0035]" strokeWidth={2.2} />,
  },
];

const buttonBaseClasses =
  "flex w-[320px] items-center gap-3 rounded-sm bg-[#ffa4c8] px-5 py-3 text-sm text-[#1D0035]";

export const RightSidebar = () => {
  const { data } = useTokenStats();
  const [isConnected, setIsConnected] = useState(false);

  const formatUsdOrDash = (value: number | null) =>
    value === null || Number.isNaN(value) ? '—' : formatUsd(value);

  const volumeChangeTone = data.volumeChange24 !== null && data.volumeChange24 < 0 ? '#FF7A8A' : '#66FF9B';

  const metrics: Metric[] = [
    {
      label: '24H VOLUME',
      primary: formatUsdOrDash(data.volume24Usd),
      primaryTone: '#F8F4FF',
      tooltip: formatUsdOrDash(data.volume24Usd), 
    },
    {
      label: 'BUYS',
      primary: formatCount(data.buyCount24),
      secondary: formatUsdOrDash(data.buyVolume24Usd),
      primaryTone: '#34F5C6',
      tooltip: `${formatCount(data.buyCount24)}/${formatUsdOrDash(data.buyVolume24Usd)}`, 
      secondaryTone: '#34F5C6',
    },
    {
      label: 'SELLS',
      primary: formatCount(data.sellCount24),
      secondary: formatUsdOrDash(data.sellVolume24Usd),
      primaryTone: '#FF7A8A',
      tooltip: `${formatCount(data.sellCount24)}/${formatUsdOrDash(data.sellVolume24Usd)}`, 
      secondaryTone: '#FF7A8A',
    },
    {
      label: 'VOL. CHANGE',
      primary: formatPercentChange(data.volumeChange24),
      primaryTone: volumeChangeTone,
      tooltip: formatPercentChange(data.volumeChange24), 
    },
  ];

  const handleConnect = () => {
    if (isConnected) return;
    setIsConnected(true);
    toast.success('Connection successful!');
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <aside className="invisible-scroll flex h-full min-h-0 flex-col overflow-hidden border-l border-white/5">
        <section className="shrink-0 border border-white/10 border-l-0 px-4 py-2.5">
          <div className="flex items-start justify-between gap-6">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              {metrics.slice(0, 2).map(
                ({ label, primary, secondary, primaryTone, secondaryTone, tooltip }) => (
                  <Tooltip.Root key={label}>
                    <Tooltip.Trigger asChild>
                      <div className="min-w-0 flex-1 space-y-1 text-left ">
                        <p className="text-[10px] uppercase text-[#eee0ff80]">{label}</p>
                        <div
                          className="truncate text-[12px] leading-tight text-white"
                          style={{ color: primaryTone }}
                        >
                          {primary}
                          {secondary && (
                            <>
                              <span className="px-1 text-[12px] text-white/40">/</span>
                              <span className="text-[12px]" style={{ color: secondaryTone ?? primaryTone }}>
                                {secondary}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="z-50 rounded-md bg-[#1D0035] px-3 py-2 text-xs text-white shadow-lg border border-white/10"
                        sideOffset={5}
                      >
                        {tooltip}
                        <Tooltip.Arrow className="fill-[#1D0035]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ),
              )}
            </div>
            <div className="flex min-w-0 flex-1 items-start gap-4">
              {metrics.slice(2).map(
                ({ label, primary, secondary, primaryTone, secondaryTone, tooltip }) => (
                  <Tooltip.Root key={label}>
                    <Tooltip.Trigger asChild>
                      <div className="min-w-0 flex-1 space-y-1 text-left ">
                        <p className="text-[10px] uppercase text-[#eee0ff80]">{label}</p>
                        <div
                          className="truncate text-[12px] leading-tight text-white"
                          style={{ color: primaryTone }}
                        >
                          {primary}
                          {secondary && (
                            <>
                              <span className="px-1 text-[12px] text-white/40">/</span>
                              <span className="text-[12px]" style={{ color: secondaryTone ?? primaryTone }}>
                                {secondary}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="z-50 rounded-md bg-[#1D0035] px-3 py-2 text-xs text-white shadow-lg border border-white/10"
                        sideOffset={5}
                      >
                        {tooltip}
                        <Tooltip.Arrow className="fill-[#1D0035]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ),
              )}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-6">
            <div className="h-[3px] w-full rounded-full bg-[#34F5C6]" />
            <div className="h-[3px] w-full rounded-full bg-[#34F5C6]" />
          </div>
        </section>

        <div className="flex w-full min-h-0 flex-1 flex-col items-center overflow-y-auto text-center pb-6">
          {!isConnected && (
            <div className="w-full border-b border-white/10 pb-6">
              <div className="flex flex-col items-center">
                <Image
                  src={WELCOME_IMAGE.src}
                  alt="Welcome to Genius Terminal"
                  width={WELCOME_IMAGE.width}
                  height={WELCOME_IMAGE.height}
                  className="w-92 h-auto object-contain"
                  priority
                />
              </div>

              <div className="mt-6 flex flex-col items-center gap-3">
                {BUTTONS.map(({ label, icon }) => (
                  <button key={label} className={buttonBaseClasses} type="button" onClick={handleConnect}>
                    <span className="flex h-11 w-11 items-center  justify-center rounded-xs">
                      {icon}
                    </span>
                    <span className="flex-1 text-left">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="w-full">
            <TokenBanner
              name={data.snapshot?.name ?? null}
              symbol={data.snapshot?.symbol ?? null}
              imageUrl={data.snapshot?.imageUrl ?? null}
            />
          </div>
        </div>

      </aside>
    </Tooltip.Provider>
  );
};
