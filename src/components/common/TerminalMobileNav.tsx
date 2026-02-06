const TABS = [
  { id: 'trade', label: 'Trade' },
  { id: 'orderBook', label: 'Order Book' },
  { id: 'tables', label: 'Tables' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export const TerminalMobileNav = ({ selectedTab, onChange }: { selectedTab: TabId; onChange: (tab: TabId) => void }) => (
  <nav className="flex w-full border-b border-white/10 bg-[#0B0B0B]">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
          selectedTab === tab.id ? 'text-white' : 'text-muted'
        }`}>
        {tab.label}
      </button>
    ))}
  </nav>
);

export type TerminalTab = TabId;
