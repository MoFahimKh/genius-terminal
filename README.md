# Genius Terminal

Pixel-accurate recreation of the Funnel core terminal view built with Next.js 15, React 19, and Tailwind CSS. The UI mirrors `https://funnel.markets/hype/core/HYPE` but runs entirely on mocked data, omitting the global navbar and footer for a focused test deliverable.

## Tech Stack

- Next.js 15 (App Router, TypeScript, React 19)
- Tailwind CSS for utility-first styling
- Framer Motion & Lucide icons for subtle UI polish
- PNPM for dependency management (matches the original stack)

## Getting Started

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000/hype/core/HYPE](http://localhost:3000/hype/core/HYPE) to view the terminal layout.

## Project Highlights

- **Mocked data only**: market stats, order book levels, trade history, and tables are generated locally in `src/mock/data.ts`.
- **Chart placeholder**: `MockChart` renders a stylized candle grid instead of using TradingView, keeping the repo self-contained.
- **Responsive layout**: desktop matches the split-pane layout with resizable stats/table areas, while mobile mode surfaces tabbed navigation.
- **Zero chrome**: no navbar or footer to satisfy the test brief.

Feel free to adapt the mocks or hook real data sources later—the component boundaries match the production architecture, so wiring APIs should be straightforward.
