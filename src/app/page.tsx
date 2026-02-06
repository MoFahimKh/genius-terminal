import Link from 'next/link';
import { DEFAULT_CODEX_MARKET } from '@/config/market';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-white">
      <div className="rounded-default border border-white/10 p-8 text-center">
        <p className="text-lg font-semibold">Open Genius Terminal</p>
        <p className="mt-2 text-sm text-white/60">
          Default token: Bubble
        </p>
        <Link
          href={`/assets?address=${DEFAULT_CODEX_MARKET.address}`}
          className="mt-6 inline-flex items-center justify-center rounded-sm bg-[#ffa4c8] px-5 py-2 text-sm font-semibold text-[#1D0035]"
        >
          Open Assets
        </Link>
      </div>
    </main>
  );
}
