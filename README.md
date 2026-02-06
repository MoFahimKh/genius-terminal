# Genius Terminal - Asset Page Recreation

A Next.js application that reproduces the asset page functionality from TradeGenius, featuring real-time token data, live t## 🚧 Known Limitations

- Chart component is a placeholder (can be replaced with a charting library like Chart.js or Recharts)
- Holders data requires Codex Premium API access (not included in free tier)
- Search functionality in tables is under active development
- **Mobile view is in progress** — Due to time constraints, the mobile responsiveness is not fully optimized yet. Desktop experience is fully functionalg events, and liquidity pool information using Codex API.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm (package manager)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repo-url>
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
├── app/                    # Next.js app router & pages
├── components/             # Reusable React components
│   ├── Chart.tsx          # Chart placeholder
│   ├── TerminalView.tsx   # Main asset page
│   ├── common/            # UI components (toggles, icons, mobile nav, etc.)
│   ├── sidebar/           # Token stats & trending tokens
│   ├── stats/             # Token statistics display
│   └── tables/            # Live trades & pools tables
├── hooks/                 # Custom React hooks
│   ├── useLatestTrades.ts # Fetch live trade events
│   ├── useTokenPools.ts   # Fetch liquidity pools
│   ├── useTokenStats.ts   # Fetch token statistics
│   └── useTokenHolders.ts # Holders data (pending premium access)
├── lib/                   # Utilities & API clients
│   ├── codex/            # Codex SDK integration & socket handlers
│   ├── chains.ts         # Blockchain network configs
│   ├── format.ts         # Data formatting utilities
│   └── toNumber.ts       # Number conversion helpers
├── context/              # React Context for state management
│   └── TokenEventsContext.tsx # Token event broadcasting
├── types/                # TypeScript type definitions
├── config/               # Configuration files
└── mock/                 # Mock data for development

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

