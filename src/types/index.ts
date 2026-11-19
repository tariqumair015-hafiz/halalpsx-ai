export type BrokerType = 
  | 'KTrade' 
  | 'Finqalab' 
  | 'Zindagi' 
  | 'AKD Trade' 
  | 'Arif Habib' 
  | 'MStock'
  | 'Al-Meezan';

export type TaxStatus = 'FILER' | 'NON_FILER';

export type SubscriptionPlan = 'FREE' | 'PRO' | 'PREMIUM';

export type RuleStatus = 'WAITING_BUY' | 'BOUGHT_WAITING_SELL' | 'COMPLETED' | 'CANCELLED';

export type RuleTriggerType = 'TARGET_PRICE' | 'UPPER_LOCK' | 'STOP_LOSS_LOW' | 'TRAILING_STOP';

export type TechnicalSignal = 'DIP_BUY_ZONE' | 'BULLISH' | 'NEUTRAL' | 'OVERBOUGHT_WAIT';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  broker: BrokerType;
  budget: number;
  tax_status: TaxStatus;
  plan: SubscriptionPlan;
  ai_credits: number;
  ntfy_topic: string;
  gemini_api_key?: string;
  groq_api_key?: string;
  ai_provider?: 'groq' | 'gemini';
  created_at?: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  sector: string;
  shariahCompliant: boolean;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  low52: number;
  high52: number;
  eps: number;
  pe: number;
  dividendYield: number;
  purificationPercent: number;
  upperLockPrice: number; // +7.5% Upper Circuit
  lowerLockPrice: number; // -7.5% Lower Circuit
  technicalSignal: TechnicalSignal;
  aiResearchSummary?: string; // Investify-style AI research insight
  sparkline?: number[]; // 7-day or intraday trend points for SVG sparkline
  updatedAt: string;
}

export interface PortfolioHolding {
  id: string;
  user_id?: string;
  symbol: string;
  name?: string;
  quantity: number;
  avg_buy_price: number;
  broker: BrokerType;
  shariah_compliant: boolean;
  created_at?: string;
}

export interface PsxRule {
  id: string;
  user_id?: string;
  symbol: string;
  triggerType: RuleTriggerType; // TARGET_PRICE, UPPER_LOCK, STOP_LOSS_LOW
  buy_target: number;
  sell_target: number;
  stop_loss_target?: number;
  quantity: number;
  sellPercentage: 25 | 50 | 75 | 100; // "Aadha maal ya poora maal"
  broker: BrokerType;
  status: RuleStatus;
  execution_buy_price?: number;
  execution_sell_price?: number;
  realized_pnl?: number;
  notes?: string;
  alert_triggered_at?: string;
  created_at: string;
}

export interface TradeHistoryItem {
  id: string;
  symbol: string;
  quantity: number;
  buy_price: number;
  sell_price: number;
  gross_pnl: number;
  broker_commission: number;
  fed_tax: number;
  cdc_charges: number;
  cgt_tax: number;
  net_pnl: number;
  broker: BrokerType;
  holding_days: number;
  closed_at: string;
}

export interface MacroData {
  kmi30: { index: number; change: number; changePercent: number; sparkline?: number[] };
  kse100: { index: number; change: number; changePercent: number; sparkline?: number[] };
  kmiAll?: { index: number; change: number; changePercent: number; sparkline?: number[] };
  kse30?: { index: number; change: number; changePercent: number; sparkline?: number[] };
  usdPkr: { rate: number; change: number };
  goldTolaPkr: { rate: number; change: number };
  silverTolaPkr: { rate: number; change: number };
  petrolPkr?: { rate: number; change: number };
  crudeOilUsd?: { rate: number; change: number };
  marketBreadth: {
    advancing: number;
    declining: number;
    unchanged: number;
    totalTraded: number;
  };
  fearAndGreedIndex: {
    score: number;
    status: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED';
    description: string;
  };
  lastUpdated?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  ruleAction?: {
    action: 'SET_RULE';
    symbol: string;
    triggerType: RuleTriggerType;
    buy_target: number;
    sell_target: number;
    stop_loss_target?: number;
    quantity: number;
    sellPercentage: 25 | 50 | 75 | 100;
  };
}
