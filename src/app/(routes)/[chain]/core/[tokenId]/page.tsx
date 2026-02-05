import { TerminalView } from '@/components/TerminalView';

type PageProps = {
  params: {
    chain: string;
    tokenId: string;
  };
};

export default function Page({ params }: PageProps) {
  void params;
  return <TerminalView />;
}
