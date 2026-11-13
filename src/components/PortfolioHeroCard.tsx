import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import type { PortfolioHolding, PsxRule, StockQuote } from '../types';
import { calculatePsxTrade } from '../services/calculatorService';
import { Sparkline } from './Sparkline';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Camera, 
  PlusCircle, 
  Info
} from 'lucide-react';

interface PortfolioHeroCardProps {
  holdings: PortfolioHolding[];
  rules: PsxRule[];
  stocks: StockQuote[];
  onOpenCreateRule: () => void;
  onOpenScreenshotModal: () => void;
  onOpenAddHolding: () => void;
}

export const PortfolioHeroCard: React.FC<PortfolioHeroCardProps> = ({
  holdings,
  rules,
  stocks,
  onOpenCreateRule,
  onOpenScreenshotModal,
  onOpenAddHolding,
}) => {
  const { user } = useAuth();

  let totalInvestedCost = 0;
  let currentMarketValue = 0;
  let totalNetProfitAfterFees = 0;

  holdings.forEach(holding => {
    const quote = stocks.find(s => s.symbol.toUpperCase() === holding.symbol.toUpperCase());
    const livePrice = quote ? quote.currentPrice : holding.avg_buy_price;

    const tradeCalc = calculatePsxTrade({
      shares: holding.quantity,
      buyPrice: holding.avg_buy_price,
      sellPrice: livePrice,
      taxStatus: user.tax_status,
      broker: user.broker,
    });

    totalInvestedCost += tradeCalc.totalBuyCost;
    currentMarketValue += tradeCalc.grossSellValue;
    totalNetProfitAfterFees += tradeCalc.netProfit;
  });

  const activeRulesCount = rules.filter(r => r.status === 'WAITING_BUY' || r.status === 'BOUGHT_WAITING_SELL').length;
  const overallReturnPercent = totalInvestedCost > 0 ? (totalNetProfitAfterFees / totalInvestedCost) * 100 : 0;
  const isProfit = totalNetProfitAfterFees >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#12262A] border border-[#1F383D] rounded-[24px] p-6 shadow-xl relative overflow-hidden backdrop-blur-sm"
    >
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#028C8C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#028C8C]">
              Total Invested Portfolio
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0F1D21] text-[11px] text-[#9AA3AF] font-medium border border-[#1F383D]">
              Broker: <span className="text-white font-semibold">{user.broker}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                  Rs {(currentMarketValue + user.budget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
              </div>
              <span className="text-[11px] text-[#9AA3AF] font-sans block mt-0.5">
                (Holdings Value + Free Cash Balance)
              </span>
            </div>

            <div className="hidden sm:block pl-2">
              <Sparkline
                data={isProfit 
                  ? [user.budget * 0.96, user.budget * 0.97, user.budget * 0.985, user.budget * 0.99, user.budget * 1.01, (currentMarketValue + user.budget)]
                  : [user.budget * 1.02, user.budget * 1.01, user.budget * 1.00, (currentMarketValue + user.budget)]
                }
                width={120}
                height={36}
                isUp={isProfit}
                strokeWidth={2}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold border font-mono shadow-sm ${
                isProfit 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}
            >
              {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isProfit ? '+' : ''}Rs {totalNetProfitAfterFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span>({isProfit ? '+' : ''}{overallReturnPercent.toFixed(2)}%)</span>
            </motion.div>

            <span className="text-[#9AA3AF] text-[11px] flex items-center gap-1">
              <Info className="w-3 h-3 text-[#028C8C]" />
              Net of Commission, FED, CDC & CGT ({user.tax_status === 'FILER' ? '15%' : '30%'})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-[#1F383D] lg:pl-6 pt-4 lg:pt-0">
          <motion.div 
            whileHover={{ y: -3, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-[#0F1D21] border border-[#1F383D] rounded-2xl p-3.5 shadow-sm"
          >
            <div className="text-[11px] text-[#9AA3AF] font-medium">Free Cash (Buying Power)</div>
            <div className="text-lg font-bold text-[#028C8C] font-mono mt-0.5">
              Rs {user.budget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-[#0F1D21] border border-[#1F383D] rounded-2xl p-3.5 shadow-sm"
          >
            <div className="text-[11px] text-[#9AA3AF] font-medium">Active Stocks</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {holdings.length} Companies
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-[#0F1D21] border border-[#1F383D] rounded-2xl p-3.5 col-span-2 sm:col-span-1 shadow-sm"
          >
            <div className="text-[11px] text-[#9AA3AF] font-medium">Cloud Target Rules</div>
            <div className="text-lg font-bold text-[#F5B301] font-mono mt-0.5 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#F5B301]" />
              <span>{activeRulesCount} Active</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-[#1F383D] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenCreateRule}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#028C8C] hover:bg-[#027A7A] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#028C8C]/20 cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>Set "Buy at X, Sell at Y" Rule</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenScreenshotModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0F1D21] hover:bg-[#152B30] border border-[#1F383D] text-[#E5EBEF] text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#028C8C]" />
            <span>Scan Broker App (AI)</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenAddHolding}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0F1D21] hover:bg-[#152B30] border border-[#1F383D] text-[#9AA3AF] hover:text-white text-xs sm:text-sm font-medium transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#9AA3AF]" />
            <span>Add Stock Manually</span>
          </motion.button>
        </div>

        <div className="text-xs text-[#9AA3AF] font-medium">
          Target watcher runs every 15 min during PSX hours.
        </div>
      </div>
    </motion.div>
  );
};
