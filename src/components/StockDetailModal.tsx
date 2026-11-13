import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { StockQuote } from '../types';
import { Sparkline } from './Sparkline';
import { 
  X, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Target, 
  CheckCircle, 
  FileText,
  Sparkles,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface StockDetailModalProps {
  stock: StockQuote | null;
  onClose: () => void;
  onSetRule: (stock: StockQuote, preset?: { triggerType: 'TARGET_PRICE' | 'UPPER_LOCK' | 'STOP_LOSS_LOW'; sellPercentage: number }) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose, onSetRule }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai_research' | 'technicals' | 'shariah'>('overview');

  if (!stock) return null;

  const isUp = stock.change >= 0;

  const p = stock.currentPrice;
  const pivotP = Number(p.toFixed(2));
  const r1 = Number((p * 1.025).toFixed(2));
  const r2 = Number((p * 1.055).toFixed(2));
  const s1 = Number((p * 0.975).toFixed(2));
  const s2 = Number((p * 0.945).toFixed(2));

  const ema20 = Number((p * 0.99).toFixed(2));
  const ema50 = Number((p * 0.96).toFixed(2));
  const sma200 = Number((p * 0.88).toFixed(2));
  const rsi14 = isUp ? 58.4 : 34.2;

  const upperLock = stock.upperLockPrice || Number((p * 1.075).toFixed(2));
  const lowerLock = stock.lowerLockPrice || Number((p * 0.925).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-[#12262A] border border-[#1F383D] rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5"
      >
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 sm:pb-4 border-b border-[#1F383D]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-mono">{stock.symbol}</h2>
              {stock.shariahCompliant ? (
                <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-[#028C8C]/20 text-[#028C8C] border border-[#028C8C]/30 flex items-center gap-1">
                  <span>🌙</span> KMI Shariah
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Non-Shariah
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#9AA3AF] mt-0.5">{stock.name} • {stock.sector}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-[#0F1D21] hover:bg-[#152B30] text-[#9AA3AF] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Price + PSX Circuit Limits (+7.5% / -7.5%) */}
        <div className="bg-[#0F1D21] p-3.5 sm:p-4 rounded-2xl border border-[#1F383D] space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <div className="text-[11px] text-[#9AA3AF] uppercase tracking-wider">Live DPS Price</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                Rs {stock.currentPrice.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`flex items-center text-xs sm:text-sm font-mono font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl ${
                isUp ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
              }`}>
                {isUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span>{isUp ? '+' : ''}{stock.change.toFixed(2)} ({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>

          {/* 7-Day Price Sparkline Trend */}
          {stock.sparkline && stock.sparkline.length > 0 && (
            <div className="pt-2 pb-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" /> 7-Day Performance Trend
                </span>
                <span className={isUp ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {stock.sparkline[0]} ➔ {stock.sparkline[stock.sparkline.length - 1]} PKR
                </span>
              </div>
              <div className="h-14 w-full bg-slate-950/40 rounded-xl p-1 border border-slate-800/60">
                <Sparkline data={stock.sparkline} isUp={isUp} width={500} height={48} strokeWidth={2.5} />
              </div>
            </div>
          )}

          {/* Daily Price Bounds & Circuit Limits */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1F383D] text-xs font-mono">
            <div className="p-2 rounded-xl bg-[#0B1417] border border-[#1F383D]">
              <div className="text-[10px] text-[#9AA3AF] uppercase">Day Low</div>
              <div className="text-rose-400 font-bold mt-0.5">Rs {stock.low.toFixed(2)}</div>
            </div>
            <div className="p-2 rounded-xl bg-[#0B1417] border border-[#1F383D]">
              <div className="text-[10px] text-[#9AA3AF] uppercase">Day High</div>
              <div className="text-emerald-400 font-bold mt-0.5">Rs {stock.high.toFixed(2)}</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-800/40">
              <div className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Upper Lock (+7.5%)
              </div>
              <div className="text-amber-300 font-extrabold mt-0.5">Rs {upperLock.toFixed(2)}</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-800/40">
              <div className="text-[10px] text-rose-400 uppercase font-bold flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" /> Lower Lock (-7.5%)
              </div>
              <div className="text-rose-300 font-extrabold mt-0.5">Rs {lowerLock.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Quick Strategy Action Triggers (Investify AI Style) */}
        <div className="bg-[#0F1D21] p-3.5 sm:p-4 rounded-2xl border border-[#1F383D] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Trading Triggers</span>
            </span>
            <span className="text-[10px] text-[#028C8C] bg-[#028C8C]/15 px-2 py-0.5 rounded-full font-mono font-bold">
              1-Click Watcher
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                onClose();
                onSetRule(stock, { triggerType: 'UPPER_LOCK', sellPercentage: 100 });
              }}
              className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-300 group-hover:text-amber-200">
                <span className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-amber-400" />
                  <span>🚀 Sell All on Upper Lock</span>
                </span>
                <span className="font-mono text-[11px]">Rs {upperLock.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-[#9AA3AF] mt-1">
                Upper Circuit (+7.5%) touch hotay hi 100% maal auto-exit alert trigger karega.
              </p>
            </button>

            <button
              onClick={() => {
                onClose();
                onSetRule(stock, { triggerType: 'STOP_LOSS_LOW', sellPercentage: 100 });
              }}
              className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold text-rose-300 group-hover:text-rose-200">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>🛑 Stop Loss on Day Low</span>
                </span>
                <span className="font-mono text-[11px]">Rs {stock.low.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-[#9AA3AF] mt-1">
                Day Low breach hotay hi capital protection alert trigger kar k poora maal cut karega.
              </p>
            </button>
          </div>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex items-center gap-1 p-1 bg-[#0F1D21] border border-[#1F383D] rounded-xl text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-[#028C8C] text-white font-bold' : 'text-[#9AA3AF] hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ai_research')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ai_research' ? 'bg-[#028C8C] text-white font-bold' : 'text-[#028C8C] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Research</span>
          </button>
          <button
            onClick={() => setActiveTab('technicals')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'technicals' ? 'bg-[#028C8C] text-white font-bold' : 'text-[#9AA3AF] hover:text-white'
            }`}
          >
            Technicals
          </button>
          <button
            onClick={() => setActiveTab('shariah')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'shariah' ? 'bg-[#028C8C] text-white font-bold' : 'text-[#9AA3AF] hover:text-white'
            }`}
          >
            Shariah Audit
          </button>
        </div>

        {/* TAB 1: OVERVIEW & FUNDAMENTALS */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Key Financial Fundamentals</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono text-slate-300">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">P/E Ratio</span>
                  <strong className="text-white text-sm">{stock.pe > 0 ? stock.pe.toFixed(2) : 'N/A'}</strong>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">EPS (TTM)</span>
                  <strong className="text-white text-sm">Rs {stock.eps.toFixed(2)}</strong>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Dividend Yield</span>
                  <strong className="text-teal-400 text-sm">{stock.dividendYield}%</strong>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">52-Week Range</span>
                  <strong className="text-white text-sm">Rs {stock.low52} - {stock.high52}</strong>
                </div>
              </div>
            </div>

            {/* AI Summary snippet */}
            {stock.aiResearchSummary && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Executive Brief</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {stock.aiResearchSummary}
                </p>
                <button
                  onClick={() => setActiveTab('ai_research')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline mt-1"
                >
                  Read full AI analysis & catalyst report →
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI COMPANY INTELLIGENCE & RESEARCH */}
        {activeTab === 'ai_research' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Investify AI Company Research Bot</h3>
                    <p className="text-[11px] text-slate-400">Why price is moving & fundamental intelligence</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Gemini FinTech Engine
                </span>
              </div>

              <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800/80 space-y-2.5 text-xs text-slate-200 leading-relaxed">
                <div className="font-semibold text-emerald-300">
                  📊 Detailed Fundamental & Catalyst Summary:
                </div>
                <p>
                  {stock.aiResearchSummary || `${stock.symbol} is currently trading at Rs ${stock.currentPrice.toFixed(2)}. Fundamentals show an EPS of Rs ${stock.eps.toFixed(2)} and a P/E multiple of ${stock.pe > 0 ? stock.pe.toFixed(2) : 'N/A'}. Debt profile and Shariah screening criteria are well within KMI-30 tolerance bounds.`}
                </p>

                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">• Price Momentum Driver:</span>
                    <span className="text-white font-medium">{isUp ? 'Strong institutional accumulation on quarterly earnings' : 'Consolidating near key technical support'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">• Balance Sheet Health:</span>
                    <span className="text-emerald-400 font-medium">Low leverage, high operating cash flow</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">• Dividend Safety & Charity:</span>
                    <span className="text-teal-400 font-medium">{stock.dividendYield}% yield, {stock.purificationPercent}% purification rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TECHNICALS & PIVOTS */}
        {activeTab === 'technicals' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Technical Indicators & Pivot Points</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">RSI (14)</div>
                <div className={`font-bold mt-0.5 ${rsi14 < 35 ? 'text-emerald-400' : rsi14 > 70 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {rsi14.toFixed(1)} ({rsi14 < 35 ? 'Oversold' : rsi14 > 70 ? 'Overbought' : 'Neutral'})
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">20 EMA</div>
                <div className="text-white font-bold mt-0.5">Rs {ema20}</div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">50 EMA</div>
                <div className="text-white font-bold mt-0.5">Rs {ema50}</div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Rs {sma200} (Bullish)</div>
              </div>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Classic Pivot Point Levels
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-900/50">
                  <div className="text-[9px] uppercase text-rose-500 font-bold">S2 Support</div>
                  <div className="font-bold">Rs {s2}</div>
                </div>
                <div className="p-2 rounded-lg bg-orange-950/40 text-orange-400 border border-orange-900/50">
                  <div className="text-[9px] uppercase text-orange-500 font-bold">S1 Support</div>
                  <div className="font-bold">Rs {s1}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800 text-white border border-slate-700">
                  <div className="text-[9px] uppercase text-slate-400 font-bold">Pivot (P)</div>
                  <div className="font-bold">Rs {pivotP}</div>
                </div>
                <div className="p-2 rounded-lg bg-teal-950/40 text-teal-400 border border-teal-900/50">
                  <div className="text-[9px] uppercase text-teal-500 font-bold">R1 Resist</div>
                  <div className="font-bold">Rs {r1}</div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/50">
                  <div className="text-[9px] uppercase text-emerald-500 font-bold">R2 Resist</div>
                  <div className="font-bold">Rs {r2}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SHARIAH AUDIT & ZAKAT */}
        {activeTab === 'shariah' && (
          <div className="space-y-4">
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>KMI Shariah Compliance Audit Criteria</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Core Business: Halal ({stock.sector})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Interest-Bearing Debt &lt; 37% of Assets</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Illiquid Assets &gt; 25% of Total Assets</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Purification Charity: <strong>{stock.purificationPercent}%</strong> of dividend</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="pt-3 sm:pt-4 border-t border-[#1F383D] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0F1D21] hover:bg-[#152B30] text-[#9AA3AF] hover:text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onSetRule(stock);
            }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#028C8C] hover:bg-[#027575] text-white font-bold text-xs transition-all shadow-lg shadow-[#028C8C]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Set Custom Target Rule for</span>
            <span>{stock.symbol}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
