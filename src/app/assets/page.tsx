import { TerminalView } from '@/components/TerminalView';
import { DEFAULT_CODEX_MARKET } from '@/config/market';

type AssetsPageProps = {
  searchParams?: Promise<{
    address?: string;
  }>;
};

const isValidAddress = (value?: string) => {
  if (!value) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(value);
};

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
  const params = (await searchParams) ?? {};
  const address = isValidAddress(params.address)
    ? params.address
    : DEFAULT_CODEX_MARKET.address;

  return (
    <TerminalView
      address={address}
      networkId={DEFAULT_CODEX_MARKET.networkId}
    />
  );
}
