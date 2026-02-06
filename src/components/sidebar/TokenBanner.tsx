'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { TokenIcon } from '@/components/common/TokenIcon';

type TokenBannerProps = {
  name: string | null;
  symbol: string | null;
  imageUrl: string | null;
};

export const TokenBanner = ({ name, symbol, imageUrl }: TokenBannerProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const headerLabel = 'Token Banner';

  return (
    <div className="w-full text-left">
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="flex w-full items-center justify-between border-y border-white/10 px-2 py-2 text-sm font-medium text-white/80"
        aria-expanded={!collapsed}
      >
        <span>{headerLabel}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${collapsed ? '-rotate-90' : ''}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${collapsed ? 'max-h-0 opacity-0' : 'max-h-[220px] opacity-100'}`}
      >
        <div className="mt-3 p-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name ?? 'Token banner'}
              className="h- w-full"
              loading="lazy"
            />
          ) : (
            <div className="flex h-[120px] items-center justify-center rounded-md bg-gradient-to-br from-[#2b1446] via-[#12081f] to-[#0b0620]">
              <TokenIcon symbol={symbol ?? '—'} imageUrl={imageUrl} size={48} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
