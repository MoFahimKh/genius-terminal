import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-white">
      <div className="rounded-default border border-white/10 p-8 text-center">
        <p className="text-lg font-semibold">Page not found</p>
        <p className="mt-2 text-sm text-white/60">
          This route does not exist yet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-sm bg-[#ffa4c8] px-5 py-2 text-sm font-semibold text-[#1D0035]"
        >
          Go to Home
        </Link>
      </div>
    </main>
  );
}
