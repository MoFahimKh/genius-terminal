export type OrderLevel = {
  price: string;
  amount: string;
  total: string;
  depthPercent: number;
};

export type TradeEntry = {
  price: string;
  amount: string;
  time: string;
  type: 'buy' | 'sell';
};

export const mockMarketData = {
  symbol: 'HYPE',
  pair: 'HYPE/USDC',
  price: 31.847,
  changePct: -7.15,
  volume24h: 239_360_000,
  marketCap: 9_570_000_000,
  contract: '0x0d01...4011ec',
  quoteSymbol: 'USDC',
};

const baseDepth = [5, 9, 12, 18, 22, 27, 31, 38, 44, 52, 61, 70];

const makeLevels = (start: number, dir: 'up' | 'down'): OrderLevel[] =>
  Array.from({ length: 15 }).map((_, idx) => {
    const price = dir === 'up' ? start + idx * 0.012 : start - idx * 0.012;
    const amount = 120 + idx * 5;
    const total = amount * price;
    return {
      price: price.toFixed(3),
      amount: amount.toFixed(2),
      total: total.toFixed(2),
      depthPercent: baseDepth[idx % baseDepth.length],
    };
  });

export const mockAsks = makeLevels(mockMarketData.price + 0.05, 'up');
export const mockBids = makeLevels(mockMarketData.price - 0.05, 'down');

export const mockTrades: TradeEntry[] = Array.from({ length: 25 }).map((_, idx) => ({
  price: (mockMarketData.price + (idx % 2 === 0 ? 0.01 * idx : -0.015 * idx)).toFixed(3),
  amount: (80 + idx * 3).toFixed(2),
  time: `14:${(10 + idx).toString().padStart(2, '0')}:32`,
  type: idx % 2 === 0 ? 'buy' : 'sell',
}));

export const mockTables = {
  balances: [
    { coin: 'HYPE', total: '1,245.30', available: '845.30', pnl: '+3,584', send: true, transfer: true },
    { coin: 'USDC', total: '32,400.00', available: '10,400.00', pnl: '+640', send: true, transfer: true },
  ],
  positions: [
    { pair: 'HYPE-PERP', size: '45,000', entry: '34.552', mark: '31.847', pnl: '-12.45%' },
  ],
  openOrders: [
    { pair: 'HYPE/USDC', type: 'Limit', size: '3,400', price: '32.200', status: 'Open' },
  ],
  tradeHistory: mockTrades.slice(0, 6),
  orderHistory: [
    { pair: 'HYPE/USDC', action: 'Filled', size: '6,200', price: '33.120', time: 'Jan 31, 11:03' },
  ],
};

export const mockRouteInfo = {
  fees: '0.04%',
  priceImpact: '0.08%',
  route: ['USDC', 'HYPE'],
};
