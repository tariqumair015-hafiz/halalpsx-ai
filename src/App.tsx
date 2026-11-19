import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { MacroTickerBar } from './components/MacroTickerBar';
import { FearGreedMeter } from './components/FearGreedMeter';
import { PortfolioHeroCard } from './components/PortfolioHeroCard';
import { StockScreener } from './components/StockScreener';
import { StockDetailModal } from './components/StockDetailModal';
import { CreateRuleModal } from './components/CreateRuleModal';
import { PortfolioTabs } from './components/PortfolioTabs';
import { CalculatorsTab } from './components/CalculatorsTab';
import { AiChatDrawer } from './components/AiChatDrawer';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SettingsModal } from './components/SettingsModal';
import { AddHoldingModal } from './components/AddHoldingModal';
import { InvestifyHome } from './components/InvestifyHome';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';

import type { StockQuote, PortfolioHolding, PsxRule, TradeHistoryItem, MacroData, BrokerType, RuleTriggerType } from './types';
import { INITIAL_PSX_STOCKS } from './data/psxStocks';
import { fetchStockUniverse, fetchMacroData } from './services/psxService';
import { calculatePsxTrade } from './services/calculatorService';
import confetti from 'canvas-confetti';

import { 
  BarChart3, 
  Briefcase, 
  Calculator, 
  Sparkles,
  Flame
} from 'lucide-react';

const MainDashboard: React.FC = () => {
  const { user, deductCash, addCash } = useAuth();

  // Core Data States
  const [stocks, setStocks] = useState<StockQuote[]>(INITIAL_PSX_STOCKS);
  const [macro, setMacro] = useState<MacroData>({
    kmi30: { index: 254174.09, change: 1564.51, changePercent: 0.62 },
    kse100: { index: 178182.95, change: 309.08, changePercent: 0.17 },
    kmiAll: { index: 68450.20, change: 420.10, changePercent: 0.62 },
    kse30: { index: 58920.30, change: 185.40, changePercent: 0.32 },
    usdPkr: { rate: 276.80, change: -0.15 },
    goldTolaPkr: { rate: 398500.00, change: -1200.00 },
    silverTolaPkr: { rate: 4650.00, change: -45.00 },
    petrolPkr: { rate: 322.00, change: 0.00 },
    crudeOilUsd: { rate: 72.80, change: 0.45 },
    marketBreadth: { advancing: 234, declining: 128, unchanged: 32, totalTraded: 394 },
    fearAndGreedIndex: {
      score: 72,
      status: 'GREED',
      description: 'PSX sentiment is strong bullish. Record institutional buying in KMI-30 Islamic constituents.',
    },
    lastUpdated: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });

  // Local Storage Initializers for Portfolios & Rules
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(() => {
    const saved = localStorage.getItem('halalpsx_holdings');
    return saved ? JSON.parse(saved) : [
      { id: 'h1', symbol: 'MLCF', quantity: 200, avg_buy_price: 98.50, broker: 'KTrade', shariah_compliant: true },
      { id: 'h2', symbol: 'MEBL', quantity: 50, avg_buy_price: 242.00, broker: 'KTrade', shariah_compliant: true },
    ];
  });

  const [rules, setRules] = useState<PsxRule[]>(() => {
    const saved = localStorage.getItem('halalpsx_rules');
    return saved ? JSON.parse(saved) : [
      {
        id: 'r1',
        symbol: 'MLCF',
        buy_target: 102.50,
        sell_target: 114.00,
        quantity: 100,
        broker: 'KTrade',
        status: 'WAITING_BUY',
        created_at: new Date().toISOString(),
      },
      {
        id: 'r2',
        symbol: 'HUBC',
        buy_target: 112.00,
        sell_target: 122.50,
        quantity: 150,
        broker: 'KTrade',
        status: 'BOUGHT_WAITING_SELL',
        created_at: new Date().toISOString(),
      },
    ];
  });

  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>(() => {
    const saved = localStorage.getItem('halalpsx_trade_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 'th-1',
        symbol: 'MIIETF',
        quantity: 500,
        buy_price: 14.50,
        sell_price: 16.20,
        gross_pnl: 850.00,
        broker_commission: 24.50,
        fed_tax: 3.92,
        cdc_charges: 5.00,
        cgt_tax: 122.48,
        net_pnl: 694.10,
        broker: 'KTrade',
        holding_days: 14,
        closed_at: '2026-11-10T14:30:00Z',
      },
    ];
  });

  // Navigation Tab State: 'home' | 'screener' | 'portfolio' | 'calculators'
  const [activeMainSection, setActiveMainSection] = useState<'home' | 'screener' | 'portfolio' | 'calculators'>('home');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [isAddHoldingOpen, setIsAddHoldingOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [detailStock, setDetailStock] = useState<StockQuote | null>(null);
  const [rulePreset, setRulePreset] = useState<{ triggerType: RuleTriggerType; sellPercentage: 25 | 50 | 75 | 100 } | undefined>();

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('halalpsx_holdings', JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem('halalpsx_rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('halalpsx_trade_history', JSON.stringify(tradeHistory));
  }, [tradeHistory]);

  // Periodic PSX quote refresh
  useEffect(() => {
    const refreshData = async () => {
      const liveUniverse = await fetchStockUniverse();
      if (liveUniverse && liveUniverse.length > 0) {
        setStocks(liveUniverse);
      }
      const liveMacro = await fetchMacroData();
      if (liveMacro) {
        setMacro(liveMacro);
      }
    };

    refreshData();
    const interval = setInterval(refreshData, 30000); // 30 sec live update
    return () => clearInterval(interval);
  }, []);

  // Handlers for Rule Lifecycle
  const handleSaveRule = (newRule: {
    symbol: string;
    triggerType?: RuleTriggerType;
    buy_target: number;
    sell_target: number;
    stop_loss_target?: number;
    quantity: number;
    sellPercentage?: 25 | 50 | 75 | 100;
    broker: BrokerType;
  }) => {
    const created: PsxRule = {
      id: `rule-${Date.now()}`,
      symbol: newRule.symbol,
      triggerType: newRule.triggerType || 'TARGET_PRICE',
      buy_target: newRule.buy_target,
      sell_target: newRule.sell_target,
      stop_loss_target: newRule.stop_loss_target,
      quantity: newRule.quantity,
      sellPercentage: newRule.sellPercentage || 100,
      broker: newRule.broker,
      status: 'WAITING_BUY',
      created_at: new Date().toISOString(),
    };
    setRules(prev => [created, ...prev]);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleConfirmBought = (rule: PsxRule) => {
    const quote = stocks.find(s => s.symbol === rule.symbol);
    const executionPrice = quote ? quote.currentPrice : rule.buy_target;
    const estCost = executionPrice * rule.quantity * 1.015;

    deductCash(estCost);

    const newHolding: PortfolioHolding = {
      id: `holding-${Date.now()}`,
      symbol: rule.symbol,
      quantity: rule.quantity,
      avg_buy_price: executionPrice,
      broker: rule.broker,
      shariah_compliant: true,
      created_at: new Date().toISOString(),
    };
    setHoldings(prev => [newHolding, ...prev]);

    setRules(prev =>
      prev.map(r => (r.id === rule.id ? { ...r, status: 'BOUGHT_WAITING_SELL', execution_buy_price: executionPrice } : r))
    );
  };

  const handleRecordSold = (rule: PsxRule) => {
    const quote = stocks.find(s => s.symbol === rule.symbol);
    const executionSellPrice = quote ? quote.currentPrice : rule.sell_target;
    const buyPrice = rule.execution_buy_price || rule.buy_target;
    
    // Partial or 100% sell ("Aadha maal ya poora maal")
    const sellPct = rule.sellPercentage || 100;
    const sharesToSell = sellPct < 100 ? Math.max(1, Math.round((rule.quantity * sellPct) / 100)) : rule.quantity;

    const trade = calculatePsxTrade({
      shares: sharesToSell,
      buyPrice,
      sellPrice: executionSellPrice,
      taxStatus: user.tax_status,
      broker: rule.broker,
    });

    addCash(trade.netSellProceeds);

    const historyItem: TradeHistoryItem = {
      id: `th-${Date.now()}`,
      symbol: rule.symbol,
      quantity: sharesToSell,
      buy_price: buyPrice,
      sell_price: executionSellPrice,
      gross_pnl: trade.grossProfit,
      broker_commission: trade.buyCommission + trade.sellCommission,
      fed_tax: trade.buyFed + trade.sellFed,
      cdc_charges: trade.buyCdc + trade.sellCdc,
      cgt_tax: trade.cgtTax,
      net_pnl: trade.netProfit,
      broker: rule.broker,
      holding_days: 7,
      closed_at: new Date().toISOString(),
    };
    setTradeHistory(prev => [historyItem, ...prev]);

    if (sharesToSell >= rule.quantity) {
      setHoldings(prev => prev.filter(h => h.symbol !== rule.symbol));
    } else {
      setHoldings(prev =>
        prev.map(h => (h.symbol === rule.symbol ? { ...h, quantity: h.quantity - sharesToSell } : h))
      );
    }

    setRules(prev =>
      prev.map(r => (r.id === rule.id ? { ...r, status: 'COMPLETED', execution_sell_price: executionSellPrice, realized_pnl: trade.netProfit } : r))
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleDeleteHolding = (id: string) => {
    setHoldings(prev => prev.filter(h => h.id !== id));
  };

  const handleImportScreenshotHoldings = (newHoldings: PortfolioHolding[], cash: number) => {
    setHoldings(prev => [...newHoldings, ...prev]);
    if (cash > 0) {
      addCash(cash);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1012] text-[#E5EBEF] flex flex-col font-sans selection:bg-[#028C8C] selection:text-white">
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        onNavigateTab={tab => setActiveMainSection(tab)}
        activeTab={activeMainSection}
        stocks={stocks}
        onSearchSymbol={query => {
          const match = stocks.find(s => s.symbol.toUpperCase() === query.toUpperCase() || s.name.toUpperCase().includes(query.toUpperCase()));
          if (match) setDetailStock(match);
        }}
      />

      <MacroTickerBar macro={macro} />

      <main className="flex-1 w-full mx-auto py-4 space-y-6">
        {/* If user is in Portfolio or Screener view, show the quick summary cards */}
        {activeMainSection !== 'home' && (
          <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PortfolioHeroCard
                holdings={holdings}
                rules={rules}
                stocks={stocks}
                onOpenCreateRule={() => setIsCreateRuleOpen(true)}
                onOpenScreenshotModal={() => setActiveMainSection('portfolio')}
                onOpenAddHolding={() => setIsAddHoldingOpen(true)}
              />
            </div>

            <div className="lg:col-span-1">
              <FearGreedMeter
                score={macro.fearAndGreedIndex.score}
                status={macro.fearAndGreedIndex.status}
                description={macro.fearAndGreedIndex.description}
              />
            </div>
          </div>
        )}

        <div className="hidden md:flex max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 items-center justify-between border-b border-[#1F383D] pb-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMainSection('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'home'
                  ? 'bg-[#028C8C] text-white shadow-sm'
                  : 'bg-[#12262A] text-[#9AA3AF] hover:text-white border border-[#1F383D]'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>PSX Market Home</span>
            </button>

            <button
              onClick={() => setActiveMainSection('screener')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'screener'
                  ? 'bg-[#028C8C] text-white shadow-sm'
                  : 'bg-[#12262A] text-[#9AA3AF] hover:text-white border border-[#1F383D]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Screener & Technicals</span>
            </button>

            <button
              onClick={() => setActiveMainSection('portfolio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'portfolio'
                  ? 'bg-[#028C8C] text-white shadow-sm'
                  : 'bg-[#12262A] text-[#9AA3AF] hover:text-white border border-[#1F383D]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>4-Tab Portfolio & Watcher</span>
            </button>

            <button
              onClick={() => setActiveMainSection('calculators')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeMainSection === 'calculators'
                  ? 'bg-[#028C8C] text-white shadow-sm'
                  : 'bg-[#12262A] text-[#9AA3AF] hover:text-white border border-[#1F383D]'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Calculators & Zakat</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeMainSection === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <InvestifyHome
                stocks={stocks}
                macro={macro}
                onSelectStock={stock => setDetailStock(stock)}
                onSetRule={stock => {
                  setDetailStock(stock);
                  setIsCreateRuleOpen(true);
                }}
                onOpenCreateRule={() => setIsCreateRuleOpen(true)}
              />
            </motion.div>
          )}

          {activeMainSection === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <PortfolioTabs
                holdings={holdings}
                rules={rules}
                tradeHistory={tradeHistory}
                stocks={stocks}
                onConfirmBought={handleConfirmBought}
                onRecordSold={handleRecordSold}
                onDeleteRule={handleDeleteRule}
                onDeleteHolding={handleDeleteHolding}
                onImportScreenshotHoldings={handleImportScreenshotHoldings}
                onOpenCreateRule={() => setIsCreateRuleOpen(true)}
                onOpenAddHolding={() => setIsAddHoldingOpen(true)}
              />
            </motion.div>
          )}

          {activeMainSection === 'screener' && (
            <motion.div
              key="screener"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <StockScreener
                stocks={stocks}
                onSelectStock={stock => setDetailStock(stock)}
                onSetRule={stock => {
                  setDetailStock(stock);
                  setIsCreateRuleOpen(true);
                }}
              />
            </motion.div>
          )}

          {activeMainSection === 'calculators' && (
            <motion.div
              key="calculators"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <CalculatorsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Roman Urdu AI Co-Pilot Button (Desktop only; on mobile it's in the BottomNav) */}
      <motion.button
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsAiDrawerOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 text-slate-950 font-extrabold shadow-2xl shadow-emerald-500/40 transition-all group"
      >
        <Sparkles className="w-5 h-5 text-slate-950 animate-spin-slow" />
        <span className="text-xs sm:text-sm">Roman Urdu AI Co-Pilot</span>
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
      </motion.button>

      <StockDetailModal
        stock={detailStock}
        onClose={() => setDetailStock(null)}
        onSetRule={(stock, preset) => {
          setDetailStock(stock);
          if (preset) {
            setRulePreset({ triggerType: preset.triggerType, sellPercentage: preset.sellPercentage as 25 | 50 | 75 | 100 });
          } else {
            setRulePreset(undefined);
          }
          setIsCreateRuleOpen(true);
        }}
      />

      <CreateRuleModal
        isOpen={isCreateRuleOpen}
        onClose={() => {
          setIsCreateRuleOpen(false);
          setRulePreset(undefined);
        }}
        stock={detailStock}
        stocks={stocks}
        initialPreset={rulePreset}
        onSaveRule={handleSaveRule}
      />

      <AddHoldingModal
        isOpen={isAddHoldingOpen}
        onClose={() => setIsAddHoldingOpen(false)}
        stocks={stocks}
        onAddHolding={h => {
          setHoldings(prev => [
            {
              id: `h-${Date.now()}`,
              ...h,
              shariah_compliant: true,
              created_at: new Date().toISOString(),
            },
            ...prev,
          ]);
        }}
      />

      <AiChatDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        holdings={holdings}
        rules={rules}
        stocks={stocks}
        onSetRuleFromAi={rule => {
          handleSaveRule({
            ...rule,
            broker: user.broker,
          });
        }}
      />

      <SubscriptionModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <Footer />

      {/* Mobile Bottom Navigation Bar (Sticky Investify App Navigation) */}
      <BottomNav
        activeTab={activeMainSection}
        onNavigateTab={setActiveMainSection}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}
