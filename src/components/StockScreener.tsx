import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import type { StockQuote } from '../types';
import { Sparkline } from './Sparkline';
import { 
  Search, 
  Moon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Activity, 
  AlertCircle,
  TrendingUp,
  LayoutGrid,
  List
} from 'lucide-react';

interface StockScreenerProps {
  stocks: StockQuote[];
  onSelectStock: (stock: StockQuote) => void;
  onSetRule: (stock: StockQuote) => void;
}

export const StockScreener: React.FC<StockScreenerProps> = ({
  stocks,
  onSelectStock,
  onSetRule,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [halalOnly, setHalalOnly] = useState(true);
  const [sortBy, setSortBy] = useState<'volume' | 'gainers' | 'losers' | 'dividend' | 'dip'>('volume');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const sectors = useMemo(() => {
    const list = Array.from(new Set(stocks.map(s => s.sector)));
    return ['All', ...list];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks
      .filter(stock => {
        const matchesSearch = 
          stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
        const matchesHalal = !halalOnly || stock.shariahCompliant;

        return matchesSearch && matchesSector && matchesHalal;
      })
      .sort((a, b) => {
        if (sortBy === 'gainers') return b.changePercent - a.changePercent;
        if (sortBy === 'losers') return a.changePercent - b.changePercent;
        if (sortBy === 'volume') return b.volume - a.volume;
        if (sortBy === 'dividend') return b.dividendYield - a.dividendYield;
        if (sortBy === 'dip') {
          if (a.technicalSignal === 'DIP_BUY_ZONE' && b.technicalSignal !== 'DIP_BUY_ZONE') return -1;
          if (b.technicalSignal === 'DIP_BUY_ZONE' && a.technicalSignal !== 'DIP_BUY_ZONE') return 1;
          return a.changePercent - b.changePercent;
        }
        return 0;
      });
  }, [stocks, searchTerm, selectedSector, halalOnly, sortBy]);

  const getSignalBadge = (signal: StockQuote['technicalSignal']) => {
    switch (signal) {
      case 'DIP_BUY_ZONE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            DIP BUY
          </span>
        );
      case 'BULLISH':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1 whitespace-nowrap">
            <TrendingUp className="w-2.5 h-2.5 text-teal-400" />
            BULLISH
          </span>
        );
      case 'OVERBOUGHT_WAIT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 whitespace-nowrap">
            <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
            WAIT
          </span>
        );
      case 'NEUTRAL':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">
            NEUTRAL
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-[#12262A] border border-[#1F383D] rounded-3xl p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 500+ PSX stocks (MLCF, MEBL, HUBC, SYS, MIIETF)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F1D21] border border-[#1F383D] rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#028C8C] transition-colors shadow-inner"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle (Investify Table vs Cards) */}
            <div className="flex items-center bg-[#0F1D21] border border-[#1F383D] rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode('table')}
                title="Investify Compact Table View"
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#028C8C] text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table View</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Rich Cards View"
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer ${
                  viewMode === 'cards' ? 'bg-[#028C8C] text-white font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards View</span>
              </button>
            </div>

            {/* Shariah Only Switch */}
            <button
              onClick={() => setHalalOnly(!halalOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                halalOnly
                  ? 'bg-[#028C8C]/20 border-[#028C8C] text-[#028C8C] shadow-sm'
                  : 'bg-[#0F1D21] border-[#1F383D] text-[#9AA3AF]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>🌙 KMI Shariah</span>
            </button>

            {/* Sorters (Investify Pill Group) */}
            <div className="flex items-center gap-1 bg-[#0F1D21] border border-[#1F383D] rounded-full p-1 text-xs">
              <button
                onClick={() => setSortBy('volume')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                  sortBy === 'volume' ? 'bg-[#028C8C] text-white shadow-sm' : 'text-[#9AA3AF] hover:text-white'
                }`}
              >
                Volume
              </button>
              <button
                onClick={() => setSortBy('dip')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                  sortBy === 'dip' ? 'bg-[#028C8C] text-white shadow-sm' : 'text-[#9AA3AF] hover:text-white'
                }`}
              >
                Dip Zone
              </button>
              <button
                onClick={() => setSortBy('gainers')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                  sortBy === 'gainers' ? 'bg-[#028C8C] text-white shadow-sm' : 'text-[#9AA3AF] hover:text-white'
                }`}
              >
                Gainers
              </button>
              <button
                onClick={() => setSortBy('dividend')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                  sortBy === 'dividend' ? 'bg-[#028C8C] text-white shadow-sm' : 'text-[#9AA3AF] hover:text-white'
                }`}
              >
                Dividend
              </button>
            </div>
          </div>
        </div>

        {/* Sectors Horizontal Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-3.5 py-1 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
                selectedSector === sector
                  ? 'bg-[#028C8C] text-white font-semibold shadow-sm'
                  : 'bg-[#0F1D21] text-[#9AA3AF] hover:text-white border border-[#1F383D]'
              }`}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: INVESTIFY-STYLE COMPACT TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-[#12262A] border border-[#1F383D] rounded-[24px] shadow-xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F383D] text-[#9AA3AF] uppercase font-mono text-[10px] bg-[#0F1D21]">
                  <th className="py-3 px-4">Symbol / Company</th>
                  <th className="py-3 px-3">Live Price</th>
                  <th className="py-3 px-3">24h Change</th>
                  <th className="py-3 px-3">7-Day Trend</th>
                  <th className="py-3 px-3">Day Range</th>
                  <th className="py-3 px-3">Signal</th>
                  <th className="py-3 px-3">P/E & Div</th>
                  <th className="py-3 px-3">Free Cash Power</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F383D]/60 font-mono">
                {filteredStocks.map((stock) => {
                  const isUp = stock.change >= 0;
                  const rangeSpan = stock.high - stock.low;
                  const positionPercent = rangeSpan > 0 ? ((stock.currentPrice - stock.low) / rangeSpan) * 100 : 50;
                  const affordableShares = Math.floor(user.budget / (stock.currentPrice * 1.015));

                  return (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-[#152B30]/60 transition-colors group cursor-pointer"
                      onClick={() => onSelectStock(stock)}
                    >
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm font-mono group-hover:text-[#028C8C] transition-colors">
                            {stock.symbol}
                          </span>
                          {stock.shariahCompliant ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#028C8C]/20 text-[#028C8C] border border-[#028C8C]/30">
                              🌙 Halal
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Non-Shariah
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#9AA3AF] truncate max-w-[170px]" title={stock.name}>
                          {stock.name} • <span className="text-[#9AA3AF]/70">{stock.sector}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white text-sm">
                          Rs {stock.currentPrice.toFixed(2)}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className={`font-bold flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          <span>{isUp ? '+' : ''}{stock.change.toFixed(2)}</span>
                          <span className="text-[10px] ml-0.5">({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <Sparkline
                          data={stock.sparkline || [stock.currentPrice * 0.98, stock.currentPrice]}
                          width={85}
                          height={26}
                          isUp={isUp}
                        />
                      </td>

                      <td className="py-3.5 px-3 min-w-[130px]">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{stock.low.toFixed(1)}</span>
                          <span>{stock.high.toFixed(1)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, Math.max(5, positionPercent))}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {getSignalBadge(stock.technicalSignal)}
                      </td>

                      <td className="py-3.5 px-3 text-[11px]">
                        <div className="text-slate-300">P/E: <strong className="text-white">{stock.pe > 0 ? stock.pe.toFixed(1) : 'N/A'}</strong></div>
                        <div className="text-teal-400 font-semibold">{stock.dividendYield}% Div</div>
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        <span className="text-[11px] font-mono text-emerald-300 font-bold">
                          {affordableShares > 0 ? (
                            `${affordableShares} shares`
                          ) : (
                            <span className="text-slate-500 text-[10px]">Need more cash</span>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSetRule(stock)}
                            className="px-3 py-1 rounded-full bg-[#028C8C] hover:bg-[#027A7A] text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Target className="w-3 h-3" />
                            <span>Rule</span>
                          </button>
                          <button
                            onClick={() => onSelectStock(stock)}
                            className="p-1.5 rounded-full bg-[#0F1D21] hover:bg-[#152B30] text-[#9AA3AF] hover:text-white transition-colors border border-[#1F383D] cursor-pointer"
                            title="Open Technical & Fundamental Details"
                          >
                            <Activity className="w-3.5 h-3.5 text-[#028C8C]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: RICH CARDS VIEW WITH EMBEDDED SPARKLINE */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock, idx) => {
            const isUp = stock.change >= 0;
            const rangeSpan = stock.high - stock.low;
            const positionPercent = rangeSpan > 0 ? ((stock.currentPrice - stock.low) / rangeSpan) * 100 : 50;
            const affordableShares = Math.floor(user.budget / (stock.currentPrice * 1.015));

            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-[#12262A] hover:bg-[#152B30] border border-[#1F383D] rounded-[24px] p-5 transition-colors flex flex-col justify-between shadow-lg group cursor-pointer"
                onClick={() => onSelectStock(stock)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-lg text-white font-mono group-hover:text-[#028C8C] transition-colors">
                          {stock.symbol}
                        </span>
                        {stock.shariahCompliant ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#028C8C]/20 text-[#028C8C] border border-[#028C8C]/30 flex items-center gap-0.5">
                            <span>🌙</span> KMI Halal
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Non-Shariah
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#9AA3AF] truncate max-w-[200px]" title={stock.name}>
                        {stock.name}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {getSignalBadge(stock.technicalSignal)}
                      <span className="text-[10px] text-[#9AA3AF]/70">{stock.sector}</span>
                    </div>
                  </div>

                  <div className="my-3 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-white font-mono">
                        Rs {stock.currentPrice.toFixed(2)}
                      </div>
                      <div className={`flex items-center text-xs font-mono font-bold mt-0.5 ${
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                        <span>{isUp ? '+' : ''}{stock.change.toFixed(2)} ({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
                      </div>
                    </div>

                    <Sparkline
                      data={stock.sparkline || [stock.currentPrice * 0.98, stock.currentPrice]}
                      width={100}
                      height={32}
                      isUp={isUp}
                    />
                  </div>

                  <div className="space-y-1 mb-3 bg-[#0F1D21] p-2.5 rounded-2xl border border-[#1F383D]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#9AA3AF]">
                      <span>Day L: <strong className="text-white">Rs {stock.low.toFixed(2)}</strong></span>
                      <span className="text-[9px] uppercase tracking-wider text-[#9AA3AF]/60">Day Range</span>
                      <span>Day H: <strong className="text-white">Rs {stock.high.toFixed(2)}</strong></span>
                    </div>
                    <div className="relative w-full h-1.5 bg-[#0B1012] rounded-full overflow-hidden border border-[#1F383D]">
                      <div 
                        className={`h-full rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, Math.max(5, positionPercent))}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-[#028C8C]/10 border border-[#028C8C]/20 rounded-2xl p-2.5 mb-3 flex items-center justify-between text-xs">
                    <span className="text-[#9AA3AF] text-[11px]">Free Cash Power:</span>
                    <span className="font-mono text-[#028C8C] font-bold">
                      {affordableShares > 0 ? (
                        `Aap ${affordableShares.toLocaleString()} shares buy kar sakte hain`
                      ) : (
                        `Need Rs ${(stock.currentPrice * 1.015 - user.budget).toFixed(0)} more`
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-[#9AA3AF] mb-4 text-center">
                    <div className="bg-[#0F1D21] p-2 rounded-xl border border-[#1F383D]">
                      <div className="text-[9px] text-[#9AA3AF]/70 uppercase">P/E</div>
                      <div className="text-white font-bold">{stock.pe > 0 ? stock.pe.toFixed(1) : 'N/A'}</div>
                    </div>
                    <div className="bg-[#0F1D21] p-2 rounded-xl border border-[#1F383D]">
                      <div className="text-[9px] text-[#9AA3AF]/70 uppercase">Div Yield</div>
                      <div className="text-[#028C8C] font-bold">{stock.dividendYield}%</div>
                    </div>
                    <div className="bg-[#0F1D21] p-2 rounded-xl border border-[#1F383D]">
                      <div className="text-[9px] text-[#9AA3AF]/70 uppercase">Vol (Shares)</div>
                      <div className="text-white font-bold">{(stock.volume / 1000000).toFixed(1)}M</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#1F383D]" onClick={e => e.stopPropagation()}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSetRule(stock)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#028C8C] hover:bg-[#027A7A] text-white font-bold text-xs transition-colors shadow-md shadow-[#028C8C]/20 cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Set Target Rule</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectStock(stock)}
                    className="py-2 px-3 rounded-full bg-[#0F1D21] hover:bg-[#152B30] text-[#9AA3AF] hover:text-white text-xs font-semibold border border-[#1F383D] transition-colors cursor-pointer"
                    title="32 Technical Indicators & Fundamentals"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#028C8C]" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
