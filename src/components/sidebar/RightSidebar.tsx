'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Apple, Wallet } from 'lucide-react';
import { Metric } from '@/types';

const WELCOME_IMAGE = {
  src: '/assets/images/welcome.png',
  width: 688,
  height: 692,
};


const METRICS: Metric[] = [
  {
    label: '24H VOLUME',
    primary: '$785.18K',
    primaryTone: '#F8F4FF',
    lineColor: '#4CE0FF',
  },
  {
    label: 'BUYS',
    primary: '1.2K',
    secondary: '$380.55K',
    primaryTone: '#34F5C6',
    secondaryTone: '#34F5C6',
    lineColor: '#2CCF9D',
  },
  {
    label: 'SELLS',
    primary: '1.1K',
    secondary: '$404.62K',
    primaryTone: '#FF7A8A',
    secondaryTone: '#FF7A8A',
    lineColor: '#FF5E73',
  },
  {
    label: 'VOL. CHANGE',
    primary: '+47421.00%',
    primaryTone: '#66FF9B',
    lineColor: '#47D97C',
  },
];

type AuthButton = {
  label: string;
  icon: ReactNode;
};

const BUTTONS: AuthButton[] = [
  {
    label: 'Continue with Google',
    icon: (
      <span className="flex h-7 w-7 items-center justify-center rounded-md text-base font-black text-[#1D0035]">
        G
      </span>
    ),
  },
  {
    label: 'Continue with Apple',
    icon: <Apple className="h-5 w-5 text-[#1D0035]" strokeWidth={2.2} />,
  },
  {
    label: 'Connect with Wallet',
    icon: <Wallet className="h-5 w-5 text-[#1D0035]" strokeWidth={2.2} />,
  },
];

const buttonBaseClasses =
  'flex w-[320px] items-center gap-3 rounded-sm bg-[#ffa4c8] px-5 py-3 text-sm text-[#1D0035]';

export const RightSidebar = () => (
  <aside className="invisible-scroll flex h-full min-h-0 flex-col overflow-y-auto border-l border-white/5">
    <section className=" border border-white/10 p-2 h-[70px]">
      <div className="grid grid-cols-4 gap-3">
        {METRICS.map(
          ({ label, primary, secondary, primaryTone, secondaryTone, lineColor }) => (
            <div key={label} className="space-y-2 text-left">
              <p className="text-[10px] uppercase text-white/60">
                {label}
              </p>
              <div className="text-sm leading-tight" style={{ color: primaryTone }}>
                {primary}
                {secondary && (
                  <>
                    <span className="px-1 text-xs text-white/40">/</span>
                    <span className="text-xs" style={{ color: secondaryTone ?? primaryTone }}>
                      {secondary}
                    </span>
                  </>
                )}
              </div>
              <div className="h-0.5 w-full rounded-full" style={{ backgroundColor: lineColor }} />
            </div>
          ),
        )}
      </div>
    </section>

    <div className="flex flex-1 flex-col overflow-y-auto text-center align-middle">
      <div className="flex flex-col items-center">
        <Image
          src={WELCOME_IMAGE.src}
          alt="Welcome to Genius Terminal"
          width={WELCOME_IMAGE.width}
          height={WELCOME_IMAGE.height}
          className="w-full"
          priority
        />
        
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {BUTTONS.map(({ label, icon }) => (
          <button key={label} className={buttonBaseClasses} type="button">
            <span className="flex h-11 w-11 items-center justify-center rounded-xs">
              {icon}
            </span>
            <span className="flex-1 text-left">{label}</span>
          </button>
        ))}
      </div>
    </div>
  </aside>
);
