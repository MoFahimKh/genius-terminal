# Genius Terminal - Asset Page Recreation

A Next.js application that reproduces the asset page functionality from TradeGenius, featuring real-time token data.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm (package manager)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/MoFahimKh/genius-terminal.git
   cd genius-terminal
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**
   ```bash
   pnpm build
   pnpm start
   ```

---

## 📦 Dependencies & Libraries

**Core**: Next.js 15, React 19, TypeScript | **Styling**: Tailwind CSS, PostCSS, Tailwind Merge | **Data**: Codex SDK (@codex-data/sdk) for real-time socket events | **UI/UX**: Framer Motion (animations), Lucide React (icons), React Hot Toast (notifications), clsx (conditional styling)

---

## ✨ Features Implemented

### **Routing Flow**
- `/` is now a lightweight entry page with a button that routes to the asset view.
- `/assets?address=<tokenAddress>` renders the full terminal for the given token.
- If `address` is missing or invalid, it falls back to the default Bubble token.
- Unknown routes (e.g. `/swap`) show a friendly message with a button back to `/`.

### 1. **Trending Tokens Strip**
   - Horizontally scrollable component displaying trending tokens
   - Fully collapsible/expandable toggle feature to save screen space
   - Real-time token updates

### 2. **Token Stats Panel**
   - Displays comprehensive token statistics (price, volume, market cap, holders, etc.)
   - Right-side collapsible panel for a clean, organized layout
   - Dynamic collapse/expand functionality with smooth animations

### 3. **Live Data Tables**
   - **Live Trades Table**: Streams real-time transaction events using `onUnconfirmedEventsCreated` (Solana) / `onTokenEventsCreated` (EVM chains)
   - **Pools Table**: Fetches and displays liquidity pool data with live updates via `onPairMetadataUpdated`
   - Both tables support sorting and filtering with responsive design

### 4. **Right Pane Collapse Feature**
   - Smooth collapse/expand animations for token stats sidebar
   - Maximize viewing area when detailed info isn't needed
   - Persistent state management across navigation

### 5. **Holders Data Structure**
   - Code infrastructure prepared for token holders data
   - Currently awaiting Codex API paid tier access (holder data requires premium subscription)

### 6. **Search in Tables** *(In Progress)*
   - Search functionality being added to filter trades and pools tables
   - Coming soon: enhanced data discovery across all tables

---

## 🏗️ Project Structure

```
src/
├── app/                           # Next.js App Router pages
│   ├── layout.tsx                # Root layout wrapper
│   ├── page.tsx                  # Home page entry point
│   ├── not-found.tsx             # 404 fallback page
│   ├── globals.css               # Global styles
│   ├── (routes)/                 # Route group (empty)
│   └── assets/
│       └── page.tsx              # Asset/token page (/assets?address=...)
│
├── components/                    # Reusable React components
│   ├── Chart.tsx                 # Chart placeholder component
│   ├── TerminalView.tsx          # Main asset terminal layout wrapper
│   ├── common/                   # Shared UI components
│   │   ├── CollapseToggle.tsx    # Toggle button for collapse/expand
│   │   ├── DragHandle.tsx        # Draggable handle component
│   │   ├── TerminalMobileNav.tsx # Mobile navigation menu
│   │   ├── ToastProvider.tsx     # Toast notification provider
│   │   ├── TokenIcon.tsx         # Token logo/icon display
│   │   └── TrendingTokensStrip.tsx # Horizontally scrollable trending tokens
│   ├── sidebar/                  # Right sidebar components
│   │   ├── RightSidebar.tsx      # Token stats sidebar container
│   │   └── TokenBanner.tsx       # Token header banner
│   ├── stats/                    # Token statistics display
│   │   └── TokenStats.tsx        # Comprehensive token info display
│   └── tables/                   # Data tables
│       ├── LiveTradesTable.tsx   # Real-time transactions table
│       ├── PoolsTable.tsx        # Liquidity pools table
│       └── TableSection.tsx      # Table wrapper/container
│
├── hooks/                        # Custom React hooks
│   ├── useIsMobile.ts            # Mobile viewport detection
│   ├── useLatestTrades.ts        # Fetch & stream live trade events
│   ├── useTokenPools.ts          # Fetch & stream pool metadata updates
│   ├── useTokenStats.ts          # Fetch token statistics
│   ├── useTokenHolders.ts        # Token holders data (requires premium API)
│   ├── useTrendingTokens.ts      # Fetch trending tokens list
│   └── useVerticalSplit.tsx      # Manage sidebar collapse state
│
├── lib/                          # Utilities & API clients
│   ├── codex/                    # Codex SDK integration
│   │   ├── client.ts             # Codex SDK instance setup
│   │   ├── tokenEvents.ts        # Socket handlers for token events
│   │   └── tokenEventUtils.ts    # Utility functions for event processing
│   ├── chains.ts                 # Blockchain network configurations
│   ├── format.ts                 # Data formatting utilities (prices, dates, etc.)
│   └── toNumber.ts               # Safe number parsing & conversion
│
├── context/                      # React Context providers
│   └── TokenEventsContext.tsx    # Global token events context & broadcast
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # Type exports (Token, Pool, Trade, etc.)
│
├── config/                       # App configuration
│   └── market.ts                 # Market-related constants & configs
│
└── mock/                         # Mock data for development/testing
    └── data.ts                   # Sample token & market data

```

---

## 🔧 Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Frontend** | React 19 |
| **Styling** | Tailwind CSS + PostCSS |
| **Real-time Data** | Codex Data SDK (WebSocket) |
| **Animations** | Framer Motion |
| **UI Components** | Lucide React Icons |
| **Notifications** | React Hot Toast |
| **Build Tool** | Turbo (turbopack) |
| **Linting** | ESLint |
| **Formatting** | Prettier + Prettier Tailwind Plugin |

---

## 🔌 Codex API Integration

The app integrates with [Codex Data API](https://docs.codex.io/) for live blockchain data:

- **Latest Transactions**: `onUnconfirmedEventsCreated` (Solana) / `onTokenEventsCreated` (EVM)
- **Pair Metadata**: `onPairMetadataUpdated` (liquidity pool updates)
- **Holders**: `onHoldersUpdated` (requires paid tier subscription)

All WebSocket handlers are in `src/lib/codex/` with event context broadcast via React Context.

---

## 📝 Available Scripts

```bash
pnpm dev       # Start development server with Turbo
pnpm build     # Build for production
pnpm start     # Start production server
pnpm lint      # Run ESLint checks
pnpm format    # Format code with Prettier
```

---

## ⚡ Performance Notes

- Uses **Next.js 15 Turbo** for faster dev builds
- **Tailwind CSS JIT** for optimized styles
- **Framer Motion** for performant animations
- **React Context** for efficient state management (non-Redux)

---

## 🚧 Known Limitations

- Chart component is a placeholder (can be replaced with a charting library like trading view)
- Holders data requires Codex Premium API access (not included in free tier)
- Search functionality in tables is under active development
- **Chain support note**: The current implementation is focused on BNB Chain. Solana support is possible, but was not completed due to time constraints.
- **Mobile view is in progress** —The mobile responsiveness is not fully optimized yet. Desktop experience is fully functionalg events, and liquidity pool information using Codex API.
- **Auth login buttons are in progress** — In future would add auth for google, apple and wallet or all simultaneously with Privy.
---

## 📄 Assessment Details

This is a take-home assessment for the **Frontend Engineer** position at TradeGenius. The objective was to recreate the asset page from [tradegenius.com/asset](https://tradegenius.com/asset) within 10-12 hours using real-time Codex API data, focusing on:

✅ Token stats display  
✅ Live transaction feeds  
✅ Liquidity pool data  
✅ Trending tokens with collapse feature  
✅ Responsive sidebar with collapse  
🚧 Search/filtering in tables (in progress)  
⏳ Holders data (blocked by API tier)  

