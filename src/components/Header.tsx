import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import type { StockQuote } from '../types';
import { 
  Search,
  ChevronDown,
  Building2, 
  Settings, 
  Sparkles,
  TrendingUp,
  BarChart2,
  Coins,
  Newspaper,
  Calculator,
  Briefcase,
  ExternalLink,
  Flame,
  Globe,
  X
} from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenUpgrade: () => void;
  onOpenAiDrawer?: () => void;
  onNavigateTab?: (tab: 'home' | 'screener' | 'portfolio' | 'calculators') => void;
  activeTab?: string;
  onSearchSymbol?: (query: string) => void;
  stocks?: StockQuote[];
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSettings, 
  onOpenUpgrade,
  onOpenAiDrawer,
  onNavigateTab,
  activeTab = 'home',
  onSearchSymbol,
  stocks = []
}) => {
  const { user } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<'markets' | 'news' | 'tools' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter stocks matching query
  const searchResults = searchQuery.trim()
    ? stocks.filter(s => 
        s.symbol.toUpperCase().includes(searchQuery.trim().toUpperCase()) ||
        s.name.toUpperCase().includes(searchQuery.trim().toUpperCase())
      ).slice(0, 6)
    : [];

  const handleSelectStock = (symbol: string) => {
    if (onSearchSymbol) {
      onSearchSymbol(symbol);
    }
    setSearchQuery('');
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectStock(searchResults[0].symbol);
    } else if (searchQuery.trim() && onSearchSymbol) {
      onSearchSymbol(searchQuery.trim().toUpperCase());
      setSearchQuery('');
      setIsSearchFocused(false);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1F383D]/80 bg-[#0B1012]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex min-h-[64px] lg:min-h-[70px] w-full max-w-[1536px] items-center px-4 sm:px-6 lg:px-12 justify-between gap-4">
        
        {/* Left: Brand Logo & Interactive Search Bar */}
        <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
          {/* Investify-Style Brand Logo */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('home')}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#028C8C] to-[#015C5C] flex items-center justify-center shadow-lg shadow-[#028C8C]/20">
              <span className="text-white text-base font-bold">🌙</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-none">
                Halal<span className="text-[#028C8C]">PSX</span>
              </span>
              <span className="text-[9px] font-mono text-[#028C8C] font-semibold tracking-wider uppercase mt-0.5">
                Investify + AI
              </span>
            </div>
          </div>

          {/* Investify Exact Rounded Pill Search Bar with Live Suggestions Dropdown */}
          <div ref={searchContainerRef} className="relative hidden md:flex items-center w-full max-w-[340px] lg:max-w-[420px]">
            <form 
              onSubmit={handleSearchSubmit}
              className="relative w-full flex items-center"
            >
              <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                <Search className="w-4 h-4 text-[#9AA3AF]" />
              </div>
              <input
                type="text"
                placeholder="Search stocks, sectors, indices... (e.g. MLCF, MEBL)"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                className="w-full h-9 pl-9 pr-12 rounded-full border border-[#1F383D] bg-[#12262A] text-xs text-white placeholder-[#9AA3AF] transition-colors hover:border-[#028C8C]/60 focus:border-[#028C8C] focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 text-[#9AA3AF] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="absolute right-3 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#0F1D21] text-[#9AA3AF] border border-[#1F383D]">
                  ⌘K
                </span>
              )}
            </form>

            {/* Live Search Suggestions Dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-11 bg-[#12262A] border border-[#1F383D] rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-[#1F383D]"
                >
                  <div className="p-2 text-[10px] uppercase font-mono text-[#9AA3AF] px-3 bg-[#0F1D21]">
                    PSX Live Search Results ({searchResults.length})
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {searchResults.map(stock => {
                      const isUp = stock.change >= 0;
                      return (
                        <div
                          key={stock.symbol}
                          onClick={() => handleSelectStock(stock.symbol)}
                          className="flex items-center justify-between p-3 hover:bg-[#152B30] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-xs">
                              {stock.symbol}
                            </span>
                            {stock.shariahCompliant && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#028C8C]/20 text-[#028C8C] font-semibold border border-[#028C8C]/30">
                                🌙 KMI
                              </span>
                            )}
                            <span className="text-[11px] text-[#9AA3AF] truncate max-w-[140px]">
                              {stock.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-right font-mono text-xs">
                            <span className="font-bold text-white">
                              Rs {stock.currentPrice.toFixed(2)}
                            </span>
                            <span className={`text-[11px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Investify Navigation Menus (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1 lg:gap-2 text-xs font-semibold text-slate-300">
          {/* Home */}
          <button
            onClick={() => onNavigateTab && onNavigateTab('home')}
            className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#028C8C] bg-[#028C8C]/10 font-bold'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Home
          </button>

          {/* Markets Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('markets')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => onNavigateTab && onNavigateTab('screener')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeTab === 'screener'
                  ? 'text-[#028C8C] bg-[#028C8C]/10 font-bold'
                  : 'hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <span>Markets</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Markets Dropdown Menu */}
            <AnimatePresence>
              {activeDropdown === 'markets' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 top-full pt-1.5 w-64 z-50"
                >
                  <div className="rounded-2xl border border-[#1F383D] bg-[#0F1D21] p-3 shadow-2xl space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      PSX Markets
                    </div>
                    <button
                      onClick={() => { onNavigateTab && onNavigateTab('screener'); setActiveDropdown(null); }}
                      className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs hover:bg-[#152B30] text-white transition-colors"
                    >
                      <BarChart2 className="w-4 h-4 text-[#028C8C]" />
                      <div>
                        <div className="font-bold">PSX Screener Universe</div>
                        <div className="text-[10px] text-slate-400">All PSX shares with live ticks</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { onNavigateTab && onNavigateTab('home'); setActiveDropdown(null); }}
                      className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs hover:bg-[#152B30] text-white transition-colors"
                    >
                      <Coins className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-bold">Gold & Commodities</div>
                        <div className="text-[10px] text-slate-400">Sarafa rates, USD & petrol</div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tools / Calculators Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveDropdown('tools')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => onNavigateTab && onNavigateTab('calculators')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeTab === 'calculators'
                  ? 'text-[#028C8C] bg-[#028C8C]/10 font-bold'
                  : 'hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <span>Tools</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <AnimatePresence>
              {activeDropdown === 'tools' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 top-full pt-1.5 w-64 z-50"
                >
                  <div className="rounded-2xl border border-[#1F383D] bg-[#0F1D21] p-3 shadow-2xl space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Investor Calculators
                    </div>
                    <button
                      onClick={() => { onNavigateTab && onNavigateTab('calculators'); setActiveDropdown(null); }}
                      className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs hover:bg-[#152B30] text-white transition-colors"
                    >
                      <Calculator className="w-4 h-4 text-[#028C8C]" />
                      <div>
                        <div className="font-bold">Brokerage & Profit</div>
                        <div className="text-[10px] text-slate-400">FED, CDC & CGT net profit</div>
                      </div>
                    </button>
                    <button
                      onClick={() => { onNavigateTab && onNavigateTab('calculators'); setActiveDropdown(null); }}
                      className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs hover:bg-[#152B30] text-white transition-colors"
                    >
                      <Coins className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-bold">Zakat & Purification</div>
                        <div className="text-[10px] text-slate-400">Shariah dividend charity rules</div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Portfolio & Watcher Tab */}
          <button
            onClick={() => onNavigateTab && onNavigateTab('portfolio')}
            className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'portfolio'
                ? 'text-[#028C8C] bg-[#028C8C]/10 font-bold'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Portfolio
          </button>
        </nav>

        {/* Right: User Financial Hub & AI Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 rounded-full bg-[#12262A] border border-[#1F383D] text-[#9AA3AF] hover:text-white cursor-pointer"
            aria-label="Toggle Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Active Broker & Capital Badge */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12262A] border border-[#1F383D] hover:border-[#028C8C] text-xs font-mono text-white transition-colors cursor-pointer shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 text-[#028C8C]" />
            <span className="font-bold">{user.broker}</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-emerald-400 font-extrabold">Rs {user.budget.toLocaleString()}</span>
          </button>

          {/* Halal AI Co-Pilot Button */}
          {onOpenAiDrawer && (
            <button
              onClick={onOpenAiDrawer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#028C8C] to-[#015C5C] hover:from-[#027A7A] hover:to-[#014D4D] text-white text-xs font-bold shadow-md shadow-[#028C8C]/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Co-Pilot</span>
            </button>
          )}

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-[#12262A] border border-[#1F383D] text-[#9AA3AF] hover:text-white hover:border-[#028C8C] transition-colors cursor-pointer"
            title="Profile & Broker Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Mobile Expandable Search Bar */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-[#1F383D] bg-[#0F1D21] px-4 py-3"
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-[#9AA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search PSX stocks (e.g. MLCF, MEBL)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-9 rounded-full border border-[#1F383D] bg-[#12262A] text-xs text-white placeholder-[#9AA3AF] focus:outline-none focus:border-[#028C8C]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA3AF]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {searchResults.length > 0 && (
              <div className="mt-2 divide-y divide-[#1F383D] bg-[#12262A] rounded-2xl border border-[#1F383D] overflow-hidden max-h-60 overflow-y-auto">
                {searchResults.map(stock => (
                  <div
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock.symbol)}
                    className="p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{stock.symbol}</span>
                      {stock.shariahCompliant && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#028C8C]/20 text-[#028C8C]">
                          🌙 KMI
                        </span>
                      )}
                      <span className="text-[11px] text-[#9AA3AF] truncate max-w-[120px]">{stock.name}</span>
                    </div>
                    <div className="font-mono text-right">
                      <div className="text-white font-bold">Rs {stock.currentPrice.toFixed(2)}</div>
                      <div className={`text-[10px] ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
