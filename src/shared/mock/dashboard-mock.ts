import { ProductDetail } from "../types/api";

export const MOCK_PRODUCT_DETAIL: ProductDetail = {
  balance: 10000,
  profitToday: 150.25,
  avgProfitWeek: 750.50,
  avgProfitMonth: 2500.00,
  winrate: 65,
  recoveryFactor: 3.2,
  maxdd: 12.5,
  profitFactor: 1.85,
  equityCurve: Array.from({ length: 30 }, (_, i) => ({
    time: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
    equity: 9000 + Math.random() * 2000,
    ticket: i,
  })),
  symbolStats: {
    totaltrades: 120,
    list: [
      { symbol: "XAUUSD", trades: 50, profit: 1200, winRate: 70 },
      { symbol: "EURUSD", trades: 40, profit: 800, winRate: 65 },
      { symbol: "GBPUSD", trades: 30, profit: 500, winRate: 60 },
    ],
  },
};
