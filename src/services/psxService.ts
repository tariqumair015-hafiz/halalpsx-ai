import type { StockQuote, MacroData } from '../types';
import { INITIAL_PSX_STOCKS } from '../data/psxStocks';

const WORKER_API_URL = import.meta.env.VITE_WORKER_API_URL || 'http://localhost:8787';

export interface PSXMarketItem {
  symbol: string;
  ldcp: number;
  open: number;
  high: number;
  low: number;
  price: number;
  change: number;
  changePct: number;
  vol: number;
  halal: boolean;
  techSignal: string;
}

/**
 * Fetch Full PSX Market Watch Scraped Dictionary (Investify Grade)
 */
export async function fetchPSXMarketWatch(): Promise<Record<string, PSXMarketItem> | null> {
  try {
    const res = await fetch(`${WORKER_API_URL}/api/psx/market-watch`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.market) {
        return data.market;
      }
    }
  } catch (e) {}
  return null;
}

export async function fetchStockUniverse(): Promise<StockQuote[]> {
  try {
    const res = await fetch(`${WORKER_API_URL}/api/psx/stocks`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.stocks && Array.isArray(data.stocks) && data.stocks.length > 0) {
        return data.stocks;
      }
    }
  } catch (e) {}
  return INITIAL_PSX_STOCKS;
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const res = await fetch(`${WORKER_API_URL}/api/psx/quote?symbol=${symbol}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}

  const local = INITIAL_PSX_STOCKS.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
  return local || null;
}

export async function fetchMacroData(): Promise<MacroData> {
  try {
    const res = await fetch(`${WORKER_API_URL}/api/psx/macro`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}

  return {
    kmi30: { index: 142850.40, change: 845.20, changePercent: 0.60, sparkline: [141200, 141600, 142100, 141900, 142400, 142650, 142850] },
    kse100: { index: 98420.15, change: 612.80, changePercent: 0.63, sparkline: [97100, 97450, 97800, 97600, 98100, 98250, 98420] },
    usdPkr: { rate: 278.45, change: -0.15 },
    goldTolaPkr: { rate: 284500.00, change: 1200.00 },
    silverTolaPkr: { rate: 3350.00, change: 0.00 },
    marketBreadth: {
      advancing: 218,
      declining: 142,
      unchanged: 34,
      totalTraded: 394,
    },
    fearAndGreedIndex: {
      score: 68,
      status: 'GREED',
      description: 'PSX sentiment is bullish. Strong institutional buying in KMI-30 Islamic constituents.',
    },
  };
}
