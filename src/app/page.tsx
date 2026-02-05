import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-6 text-white">
      <h1 className="text-2xl font-semibold">Genius Terminal</h1>
      <p className="text-center text-sm text-white/70">Open the mock terminal at /[chain]/core/[tokenId]</p>
      <Link
        href="/hype/core/HYPE"
        className="rounded-default border border-white/30 px-4 py-2 text-sm font-semibold uppercase">
        View Terminal
      </Link>
    </main>
  );
}
