import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { StockQuote, MacroData } from '../types';
import { Sparkline } from './Sparkline';
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Coins, 
  DollarSign, 
  Fuel, 
  Newspaper, 
  FileText, 
  MessageSquare, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  BarChart2,
  Clock,
  Download,
  Star,
  Users,
  CheckCircle2
} from 'lucide-react';

interface InvestifyHomeProps {
  stocks: StockQuote[];
  macro: MacroData;
  onSelectStock: (stock: StockQuote) => void;
  onSetRule: (stock: StockQuote) => void;
  onOpenCreateRule: () => void;
}

export const InvestifyHome: React.FC<InvestifyHomeProps> = ({
  stocks,
  macro,
  onSelectStock,
  onSetRule,
  onOpenCreateRule,
}) => {
  // Hero section pill selector: 'indices' | 'stocks' | 'sectors'
  const [heroCategory, setHeroCategory] = useState<'indices' | 'stocks' | 'sectors'>('indices');

  // Market Movers state
  const [moverIndexFilter, setMoverIndexFilter] = useState<'all' | 'kse100' | 'halal'>('halal');
  const [moverTab, setMoverTab] = useState<'active' | 'gainers' | 'losers'>('gainers');

  // News language tab
  const [newsLang, setNewsLang] = useState<'english' | 'urdu'>('english');

  // SIP Calculator State
  const [sipAmount, setSipAmount] = useState<number>(25000);
  const [sipDuration, setSipDuration] = useState<number>(5);
  const annualReturn = 0.16; // 16% historical PSX CAGR

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Filter stocks for movers
  const filteredStocks = stocks.filter(s => {
    if (moverIndexFilter === 'halal') return s.shariahCompliant;
    if (moverIndexFilter === 'kse100') return true;
    return true;
  });

  const activeMovers = [...filteredStocks].sort((a, b) => b.volume - a.volume).slice(0, 8);
  const gainerMovers = [...filteredStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 8);
  const loserMovers = [...filteredStocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 8);

  const displayedList = moverTab === 'active' ? activeMovers : moverTab === 'gainers' ? gainerMovers : loserMovers;

  // SIP Math
  const totalMonths = sipDuration * 12;
  const monthlyRate = annualReturn / 12;
  const totalCashInvested = sipAmount * totalMonths;
  const projectedFutureWealth = Math.round(
    sipAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
  );
  const totalProfitGained = projectedFutureWealth - totalCashInvested;

  // News Items
  const englishNews = [
    {
      title: "PSW, Alibaba.com partner to boost trust in global e-commerce, support Pakistani exporters",
      summary: "Under the arrangement, the service will offer an additional layer of assurance to Alibaba.com and its global buyers.",
      source: "Business Recorder",
      time: "2 hours ago",
      tag: "E-Commerce",
      hot: true
    },
    {
      title: "PSX closes higher: KSE-100 up 500.11 points at 177,873.88",
      summary: "254 stocks rose and 163 fell. Turnover was 1.04 billion shares, with Rs 30.95 billion traded in continuous session.",
      source: "Investify News Desk",
      time: "4 hours ago",
      tag: "Closing Bell",
      hot: true
    },
    {
      title: "New copper-gold deposits discovered in Balochistan's Chagai district",
      summary: "Mari Energies announces major discovery near Reko Diq, boosting long-term mineral mining output.",
      source: "Dawn",
      time: "6 hours ago",
      tag: "Minerals",
      hot: false
    },
    {
      title: "Barrick Mining expresses interest in mineral processing facilities in Karachi and Gwadar",
      summary: "High-level delegation holds talks with mineral board to set up export-oriented refining facilities.",
      source: "Express Tribune",
      time: "8 hours ago",
      tag: "Foreign Investment",
      hot: false
    }
  ];

  const urduNews = [
    {
      title: "پاکستان اسٹاک ایکسچینج میں زبردست تیزی: کے ایس ای 100 انڈیکس 177,873 کی تاریخی سطح پر بند",
      summary: "سیمنٹ، اسلامک بینکنگ اور آئی ٹی سیکٹر میں جارحانہ خریداری، ٹریڈنگ والیم 1 ارب حصص سے تجاوز کر گیا۔",
      source: "اردو بزنس ڈیسک",
      time: "3 گھنٹے پہلے",
      tag: "اسٹاک مارکیٹ",
      hot: true
    },
    {
      title: "بلوچستان کے ضلع چاغی میں سونے اور تانبے کے نئے ذخائر دریافت",
      summary: "ماری انرجیز نے ریکوڈک کے قریب نئے ذخائر کی تصدیق کر دی، ملکی معیشت کے لیے مثبت پیش رفت۔",
      source: "روزنامہ جنگ",
      time: "5 گھنٹے پہلے",
      tag: "معدنیات",
      hot: true
    },
    {
      title: "سونے کی قیمت میں 4,900 روپے کی کمی، فی تولہ ریٹ 414,800 روپے پر آ گیا",
      summary: "عالمی مارکیٹ کے زیراثر مقامی مارکیٹ میں بھی سونے کی قیمتوں میں کمی ریکارڈ کی گئی۔",
      source: "صرافہ ایسوسی ایشن",
      time: "6 گھنٹے پہلے",
      tag: "گولڈ ریٹ",
      hot: false
    }
  ];

  // Company Filings
  const filings = [
    {
      symbol: "MEBL",
      name: "Meezan Bank Limited",
      time: "13/11/2026, 4:29 PM",
      category: "Briefing Presentation",
      sentiment: "BULLISH",
      text: "Meezan Bank Limited corporate briefing presentation for FY 2025-26 highlighting low-cost CASA mobilization & zero conventional debt leverage."
    },
    {
      symbol: "MLCF",
      name: "Maple Leaf Cement",
      time: "13/11/2026, 3:15 PM",
      category: "Financial Results",
      sentiment: "BULLISH",
      text: "Quarterly operating margins surge as domestic cement retention prices rise and imported coal costs decline."
    },
    {
      symbol: "MACTER",
      name: "Macter International Ltd",
      time: "13/11/2026, 2:10 PM",
      category: "Corporate Briefing",
      sentiment: "NEUTRAL",
      text: "Corporate briefing presentation for FY 2025-26 with video recording link disseminated for institutional investors."
    },
    {
      symbol: "HUBC",
      name: "The Hub Power Company",
      time: "12/11/2026, 5:45 PM",
      category: "Dividend Distribution",
      sentiment: "BULLISH",
      text: "Interim dividend disbursement schedule released and progress update on Thar coal power projects."
    }
  ];

  // Community Posts
  const communityPosts = [
    {
      user: "Farid Ahmad (Karachi)",
      symbol: "MLCF",
      time: "25 min ago",
      urdu: true,
      text: "کچھ دن پہلے میں نے دوستوں کو کہا تھا کہ سیمنٹ سیکٹر میں کول پرائسز ڈراپ ہو رہی ہیں اس لیے MLCF اور LUCK میں ڈپ بائے کا سنہری موقع ہے۔ آج وہی شیئرز اپنے اپر کیپ کے قریب ٹریڈ کر رہے ہیں۔",
      likes: 19,
      replies: 7
    },
    {
      user: "Zubair Khan (Lahore)",
      symbol: "MEBL",
      time: "1 hr ago",
      urdu: false,
      text: "Meezan Bank's dividend yield and balance sheet quality is unbeatable in PSX. 100% Shariah compliant foundation gives long-term institutional safety.",
      likes: 34,
      replies: 12
    },
    {
      user: "Saad Sheikh (Islamabad)",
      symbol: "MIIETF",
      time: "3 hrs ago",
      urdu: false,
      text: "For new retail investors, Meezan Islamic ETF (MIIETF) is the easiest way to enter PSX. At just Rs 15, you get direct exposure to 15 top KMI Shariah stocks.",
      likes: 22,
      replies: 5
    }
  ];

  // FAQs
  const faqs = [
    {
      q: "Is the PSX market data on Investify live?",
      a: "Yes. Data is continuously fetched from the official Pakistan Stock Exchange (PSX) Data Portal System (DPS). The dashboard shows live PSX share prices, KSE-100, KMI-30 indices, day range, volume and circuit limits during continuous trading sessions."
    },
    {
      q: "What are Pakistan Stock Exchange trading hours?",
      a: "Monday to Thursday: Continuous trading runs from 9:32 AM to 3:30 PM PKT. Friday has two sessions: Morning Session (9:15 AM - 12:00 PM) and Post-Jumma Session (2:30 PM - 4:30 PM PKT)."
    },
    {
      q: "Is KSE the same as PSX?",
      a: "KSE is an old name. In 2016, Karachi, Lahore and Islamabad stock exchanges merged into the single Pakistan Stock Exchange (PSX). KSE-100 kept the historical name and remains the benchmark index."
    },
    {
      q: "How does the AI Co-Pilot set Buy and Sell target watcher rules?",
      a: "Simply type or speak in Roman Urdu (e.g., 'MLCF 103 pe buy aur 112 pe sell laga do'). The AI calculates your broker commission, verifies budget affordability, and Cloudflare Sentinel watches the price 24/7 to send an instant push siren to your mobile when targets hit!"
    }
  ];

  return (
    <div className="w-full max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-12 py-4 sm:py-6 space-y-6 sm:space-y-10">
      
      {/* =========================================================================
          SECTION 1: HERO (INVESTIFY EXACT DOM & TYPOGRAPHY)
      ========================================================================= */}
      <section className="relative">
        <div className="mb-4 sm:mb-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-semibold tracking-tight text-white text-xl sm:text-2xl md:text-[34px] leading-tight sm:leading-10">
              PSX Today: <span className="text-[#028C8C]">KSE-100</span> Index Live, Share Prices and News
            </h1>
          </div>
          
          <p className="mt-1.5 sm:mt-2 max-w-3xl text-xs sm:text-[14px] sm:leading-6 text-[#9AA3AF]">
            <span className="font-semibold text-[#028C8C]">KSE-100 index</span>: {macro.kse100.index.toLocaleString('en-PK', { minimumFractionDigits: 2 })} (+500.11, +0.28%). PSX share prices, market movers, company announcements and business news, all in one place.
          </p>

          {/* Pill Category Switcher (Investify Exact Pill: Indices | Stocks | Sectors) */}
          <div className="mt-4 sm:mt-5 inline-flex items-center gap-1 self-start rounded-full bg-[#12262A] p-0.5 sm:p-1 border border-[#1F383D]">
            <button
              type="button"
              onClick={() => setHeroCategory('indices')}
              className={`flex h-7 sm:h-9 items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full px-3 sm:px-3.5 text-xs sm:text-[14px] font-semibold transition-colors cursor-pointer ${
                heroCategory === 'indices'
                  ? 'bg-[#028C8C] text-white shadow-sm'
                  : 'text-[#9AA3AF] hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Indices</span>
            </button>

            <button
              type="button"
              onClick={() => setHeroCategory('stocks')}
              className={`flex h-7 sm:h-9 items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full px-3 sm:px-3.5 text-xs sm:text-[14px] font-semibold transition-colors cursor-pointer ${
                heroCategory === 'stocks'
                  ? 'bg-[#028C8C] text-white shadow-sm'
                  : 'text-[#9AA3AF] hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Stocks</span>
            </button>

            <button
              type="button"
              onClick={() => setHeroCategory('sectors')}
              className={`flex h-7 sm:h-9 items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full px-3 sm:px-3.5 text-xs sm:text-[14px] font-semibold transition-colors cursor-pointer ${
                heroCategory === 'sectors'
                  ? 'bg-[#028C8C] text-white shadow-sm'
                  : 'text-[#9AA3AF] hover:text-white'
              }`}
            >
              <span>Sectors</span>
            </button>
          </div>
        </div>

        {/* Investify Benchmark Horizontal Index Cards */}
        <div className="flex gap-3 sm:gap-6 overflow-x-auto pb-2 no-scrollbar scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0">
          {/* Card 1: KSE-100 */}
          <div className="min-w-[180px] sm:min-w-[240px] shrink-0 rounded-2xl sm:rounded-[22px] border border-[#028C8C]/50 bg-[#12262A] p-3 sm:p-4 text-left shadow-lg">
            <div className="flex items-center justify-between text-xs text-[#9AA3AF] mb-1">
              <span className="font-bold text-white text-xs sm:text-sm">KSE100</span>
              <span className="text-[#028C8C] font-bold text-[11px] sm:text-xs flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +0.28%
              </span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
              {macro.kse100.index.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#9AA3AF] mt-2 font-mono">
              <span>+500.11 pts</span>
              <Sparkline data={macro.kse100.sparkline || [97000, 97500, 98200, 98420]} isUp={true} width={70} height={18} />
            </div>
          </div>

          {/* Card 2: KMI-30 (Islamic Benchmark) */}
          <div className="min-w-[180px] sm:min-w-[240px] shrink-0 rounded-2xl sm:rounded-[22px] border border-[#028C8C] bg-[#12262A] p-3 sm:p-4 text-left shadow-lg">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-1">
                <span>🌙</span> KMI30
              </span>
              <span className="text-[#028C8C] font-bold text-[11px] sm:text-xs flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +0.60%
              </span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
              {macro.kmi30.index.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#028C8C] mt-2 font-mono">
              <span>+845.20 pts</span>
              <Sparkline data={macro.kmi30.sparkline || [141000, 142000, 142850]} isUp={true} width={70} height={18} />
            </div>
          </div>

          {/* Card 3: KMI-ALL */}
          <div className="min-w-[180px] sm:min-w-[240px] shrink-0 rounded-2xl sm:rounded-[22px] border border-[#1F383D] bg-[#12262A] p-3 sm:p-4 text-left shadow-lg">
            <div className="flex items-center justify-between text-xs text-[#9AA3AF] mb-1">
              <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-1">
                <span>🌙</span> KMIALL
              </span>
              <span className="text-[#028C8C] font-bold text-[11px] sm:text-xs flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +0.55%
              </span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono">35,420.80</div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#9AA3AF] mt-2 font-mono">
              <span>+194.30 pts</span>
              <Sparkline data={[34800, 35100, 35300, 35420]} isUp={true} width={70} height={18} />
            </div>
          </div>

          {/* Card 4: KSE-30 */}
          <div className="min-w-[180px] sm:min-w-[240px] shrink-0 rounded-2xl sm:rounded-[22px] border border-[#1F383D] bg-[#12262A] p-3 sm:p-4 text-left shadow-lg">
            <div className="flex items-center justify-between text-xs text-[#9AA3AF] mb-1">
              <span className="font-bold text-white text-xs sm:text-sm">KSE30</span>
              <span className="text-[#028C8C] font-bold text-[11px] sm:text-xs flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +0.72%
              </span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white font-mono">30,118.40</div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#9AA3AF] mt-2 font-mono">
              <span>+215.10 pts</span>
              <Sparkline data={[29800, 30000, 30050, 30118]} isUp={true} width={70} height={18} />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: MARKET MOVERS (EXACT INVESTIFY DESIGN & TOGGLES)
      ========================================================================= */}
      <section id="market-movers" className="scroll-mt-24 py-2">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-[#028C8C]">
              Today's market
            </p>
            <h2 className="mt-1 text-2xl font-medium leading-8 text-white">
              Market Movers
            </h2>
          </div>

          {/* Radiogroup Filter: KSE 100 | All Stocks | All Islamic */}
          <div className="flex items-center gap-1 rounded-full bg-[#12262A] p-1 border border-[#1F383D]">
            <button
              type="button"
              onClick={() => setMoverIndexFilter('halal')}
              className={`h-8 whitespace-nowrap rounded-full px-3.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                moverIndexFilter === 'halal'
                  ? 'bg-[#028C8C] text-white shadow-sm'
                  : 'text-[#9AA3AF] hover:text-white'
              }`}
            >
              <span>🌙</span> All Islamic
            </button>
            <button
              type="button"
              onClick={() => setMoverIndexFilter('kse100')}
              className={`h-8 whitespace-nowrap rounded-full px-3.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                moverIndexFilter === 'kse100'
                  ? 'bg-[#028C8C] text-white shadow-sm'
                  : 'text-[#9AA3AF] hover:text-white'
              }`}
            >
              KSE 100
            </button>
            <button
              type="button"
              onClick={() => setMoverIndexFilter('all')}
              className={`h-8 whitespace-nowrap rounded-full px-3.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                moverIndexFilter === 'all'
                  ? 'bg-[#028C8C] text-white shadow-sm'
                  : 'text-[#9AA3AF] hover:text-white'
              }`}
            >
              All Stocks
            </button>
          </div>
        </div>

        {/* Sub-Tabs: Most Active | Gainers | Losers */}
        <div className="rounded-[24px] border border-[#1F383D] bg-[#12262A] overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1F383D] px-4 py-3 bg-[#0F1D21]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMoverTab('gainers')}
                className={`h-8 whitespace-nowrap rounded-full px-4 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  moverTab === 'gainers'
                    ? 'bg-[#028C8C] text-white'
                    : 'text-[#9AA3AF] hover:text-white'
                }`}
              >
                Gainers
              </button>

              <button
                type="button"
                onClick={() => setMoverTab('active')}
                className={`h-8 whitespace-nowrap rounded-full px-4 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  moverTab === 'active'
                    ? 'bg-[#028C8C] text-white'
                    : 'text-[#9AA3AF] hover:text-white'
                }`}
              >
                Most Active
              </button>

              <button
                type="button"
                onClick={() => setMoverTab('losers')}
                className={`h-8 whitespace-nowrap rounded-full px-4 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  moverTab === 'losers'
                    ? 'bg-rose-500 text-white'
                    : 'text-[#9AA3AF] hover:text-white'
                }`}
              >
                Losers
              </button>
            </div>

            <button
              onClick={onOpenCreateRule}
              className="text-xs font-semibold text-[#028C8C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>AI Target Watcher</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Movers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1417] text-[#9AA3AF] font-mono text-[11px] border-b border-[#1F383D]">
                <tr>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-4 font-semibold">Stock</th>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-4 font-semibold text-right">Price</th>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-4 font-semibold text-right">Change</th>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-4 font-semibold text-center hidden md:table-cell">7-Day Chart</th>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-4 font-semibold text-right hidden sm:table-cell">Volume</th>
                  <th className="py-2.5 sm:py-3 px-2.5 sm:px-4 font-semibold text-center hidden sm:table-cell">Cloud Watcher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F383D]/60">
                {displayedList.map(stock => {
                  const isUp = stock.change >= 0;
                  return (
                    <tr
                      key={stock.symbol}
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-[#152B30]/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 sm:py-3.5 px-2.5 sm:px-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="font-bold text-white font-mono group-hover:text-[#028C8C] transition-colors text-xs sm:text-sm">
                            {stock.symbol}
                          </span>
                          {stock.shariahCompliant && (
                            <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded bg-[#028C8C]/20 text-[#028C8C] font-semibold border border-[#028C8C]/30 whitespace-nowrap">
                              🌙 KMI
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-[#9AA3AF] truncate max-w-[120px] sm:max-w-[220px]">
                          {stock.name}
                        </div>
                      </td>

                      <td className="py-2.5 sm:py-3.5 px-2.5 sm:px-4 text-right font-mono font-bold text-white text-xs sm:text-sm whitespace-nowrap">
                        Rs {stock.currentPrice.toFixed(2)}
                      </td>

                      <td className="py-2.5 sm:py-3.5 px-2.5 sm:px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs ${
                          isUp 
                            ? 'text-emerald-400 bg-emerald-500/10' 
                            : 'text-rose-400 bg-rose-500/10'
                        }`}>
                          {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-2.5 sm:py-3.5 px-2.5 sm:px-4 text-center hidden md:table-cell">
                        <div className="inline-block">
                          <Sparkline 
                            data={stock.sparkline || [stock.low, stock.currentPrice, stock.high]} 
                            isUp={isUp} 
                            width={90} 
                            height={22} 
                          />
                        </div>
                      </td>

                      <td className="py-2.5 sm:py-3.5 px-2.5 sm:px-4 text-right font-mono text-slate-300 hidden sm:table-cell">
                        {(stock.volume / 1000000).toFixed(2)}M
                      </td>

                      <td className="py-2.5 sm:py-3.5 px-2.5 sm:px-4 text-center hidden sm:table-cell" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onSetRule(stock)}
                          className="px-2.5 py-1 rounded-full bg-[#028C8C]/15 hover:bg-[#028C8C] hover:text-white text-[#028C8C] font-bold text-[11px] border border-[#028C8C]/40 transition-all cursor-pointer"
                        >
                          Watch Target
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PAKISTAN RATES TODAY (Forex, Gold, Petrol & Commodities)
      ========================================================================= */}
      <section className="rounded-[24px] border border-[#1F383D] bg-[#12262A] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#F5B301]" />
            <h3 className="font-bold text-white text-sm">Pakistan Rates Today (Forex & Commodities)</h3>
          </div>
          <span className="text-[11px] text-[#9AA3AF] font-mono">Karachi Sarafa & Interbank</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
          {/* Gold 24K */}
          <div className="p-3 rounded-2xl bg-[#0F1D21] border border-[#1F383D]">
            <div className="text-[10px] text-[#F5B301] font-bold uppercase flex items-center gap-1">
              <Coins className="w-3 h-3" /> Gold 24K (Tola)
            </div>
            <div className="text-sm font-bold text-white mt-1">Rs 414,800</div>
            <div className="text-[10px] text-rose-400">▼ Rs 200 today</div>
          </div>

          {/* Silver */}
          <div className="p-3 rounded-2xl bg-[#0F1D21] border border-[#1F383D]">
            <div className="text-[10px] text-slate-300 font-bold uppercase flex items-center gap-1">
              <Coins className="w-3 h-3" /> Silver (Tola)
            </div>
            <div className="text-sm font-bold text-white mt-1">Rs 5,467</div>
            <div className="text-[10px] text-rose-400">▼ Rs 111 today</div>
          </div>

          {/* USD / PKR */}
          <div className="p-3 rounded-2xl bg-[#0F1D21] border border-[#1F383D]">
            <div className="text-[10px] text-[#028C8C] font-bold uppercase flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> USD / PKR
            </div>
            <div className="text-sm font-bold text-white mt-1">Rs 278.45</div>
            <div className="text-[10px] text-[#028C8C]">▼ 0.15 (Interbank)</div>
          </div>

          {/* Petrol */}
          <div className="p-3 rounded-2xl bg-[#0F1D21] border border-[#1F383D]">
            <div className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1">
              <Fuel className="w-3 h-3" /> Petrol (Litre)
            </div>
            <div className="text-sm font-bold text-white mt-1">Rs 247.03</div>
            <div className="text-[10px] text-slate-500">OGRA official</div>
          </div>

          {/* Crude Oil */}
          <div className="p-3 rounded-2xl bg-[#0F1D21] border border-[#1F383D]">
            <div className="text-[10px] text-[#F5B301] font-bold uppercase flex items-center gap-1">
              <Flame className="w-3 h-3" /> Brent Crude
            </div>
            <div className="text-sm font-bold text-white mt-1">$72.50 / bbl</div>
            <div className="text-[10px] text-[#028C8C]">▲ +0.45%</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: MARKET NEWS & PSX FILINGS (Dual-Column Layout)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Latest Headlines */}
        <div className="rounded-[24px] border border-[#1F383D] bg-[#12262A] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F383D]">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#028C8C]" />
              <h3 className="font-bold text-white text-base">Market News & Headlines</h3>
            </div>
            
            <div className="flex items-center gap-1 p-0.5 rounded-full bg-[#0F1D21] border border-[#1F383D] text-[11px] font-bold">
              <button
                onClick={() => setNewsLang('english')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  newsLang === 'english' ? 'bg-[#028C8C] text-white font-bold' : 'text-[#9AA3AF]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setNewsLang('urdu')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  newsLang === 'urdu' ? 'bg-[#028C8C] text-white font-bold' : 'text-[#9AA3AF]'
                }`}
              >
                اردو خبریں
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(newsLang === 'english' ? englishNews : urduNews).map((item, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-2xl bg-[#0F1D21] hover:bg-[#152B30] border border-[#1F383D] transition-colors space-y-1.5 cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-[#12262A] text-[#028C8C] font-bold">
                    {item.tag}
                  </span>
                  <span className="text-[#9AA3AF] font-mono">{item.time} • {item.source}</span>
                </div>
                <h4 className="text-xs font-bold text-white hover:text-[#028C8C] transition-colors leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#9AA3AF] line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: PSX Corporate Filings */}
        <div className="rounded-[24px] border border-[#1F383D] bg-[#12262A] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F383D]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#028C8C]" />
              <h3 className="font-bold text-white text-base">PSX Corporate Filings</h3>
            </div>
            <span className="text-[11px] text-[#028C8C] font-mono">Smart Highlights</span>
          </div>

          <div className="space-y-3">
            {filings.map((filing, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-[#0F1D21] border border-[#1F383D] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-xs px-2 py-0.5 rounded-full bg-[#12262A] border border-[#1F383D]">
                      {filing.symbol}
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium">{filing.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#028C8C]/15 text-[#028C8C]">
                    {filing.category}
                  </span>
                </div>
                <p className="text-[11px] text-[#9AA3AF] leading-relaxed">
                  {filing.text}
                </p>
                <div className="text-[10px] text-[#9AA3AF] font-mono">
                  {filing.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: FREE CALCULATORS (INVESTIFY SIP SIMULATOR)
      ========================================================================= */}
      <section className="rounded-[24px] border border-[#1F383D] bg-[#12262A] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-[#028C8C]">
              Free Investor Tools
            </p>
            <h2 className="mt-1 text-2xl font-medium leading-8 text-white">
              What could a monthly investment grow to?
            </h2>
            <p className="text-xs text-[#9AA3AF] mt-1">
              Work out your savings with historical 16% annualized PSX KMI-30 returns.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#028C8C]/15 border border-[#028C8C]/30 text-[#028C8C] text-xs font-mono font-bold">
            PSX CAGR: ~16% / yr
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Controls */}
          <div className="space-y-5 text-xs">
            <div>
              <label className="text-white font-bold block mb-2">
                I invest every month in PSX: <span className="text-[#028C8C] font-mono font-bold">Rs {sipAmount.toLocaleString()}</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[5000, 10000, 25000, 50000, 100000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setSipAmount(amt)}
                    className={`px-3.5 py-1.5 rounded-full font-mono font-bold transition-all cursor-pointer ${
                      sipAmount === amt
                        ? 'bg-[#028C8C] text-white shadow-sm'
                        : 'bg-[#0F1D21] border border-[#1F383D] text-[#9AA3AF] hover:text-white'
                    }`}
                  >
                    Rs {amt >= 100000 ? '1 Lakh' : `${amt / 1000}K`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white font-bold block mb-2">
                Investment Duration: <span className="text-[#028C8C] font-mono font-bold">{sipDuration} Years</span>
              </label>
              <div className="flex items-center gap-2">
                {[3, 5, 10, 15].map(yrs => (
                  <button
                    key={yrs}
                    onClick={() => setSipDuration(yrs)}
                    className={`px-4 py-1.5 rounded-full font-mono font-bold transition-all cursor-pointer ${
                      sipDuration === yrs
                        ? 'bg-[#028C8C] text-white shadow-sm'
                        : 'bg-[#0F1D21] border border-[#1F383D] text-[#9AA3AF] hover:text-white'
                    }`}
                  >
                    {yrs} Years
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="p-5 rounded-2xl bg-[#0F1D21] border border-[#1F383D] space-y-4 font-mono">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#1F383D]">
              <div>
                <div className="text-[10px] text-[#9AA3AF] uppercase">Total Cash Invested</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  Rs {totalCashInvested.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#028C8C] uppercase">Estimated Compound Profit</div>
                <div className="text-lg font-bold text-[#028C8C] mt-0.5">
                  +Rs {totalProfitGained.toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-[#9AA3AF] uppercase tracking-wider">Projected Portfolio Value</div>
              <div className="text-3xl font-extrabold text-white mt-1">
                Rs {projectedFutureWealth.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: COMMUNITY DISCUSSION BOARD
      ========================================================================= */}
      <section className="rounded-[24px] border border-[#1F383D] bg-[#12262A] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F383D]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#028C8C]" />
            <h3 className="font-bold text-white text-base">From the Community</h3>
          </div>
          <span className="text-xs text-[#9AA3AF]">Pakistani Investor Discussions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communityPosts.map((post, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-[#0F1D21] border border-[#1F383D] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{post.user}</span>
                  <span className="font-mono text-[#028C8C] font-bold px-2 py-0.5 rounded-full bg-[#028C8C]/15">
                    {post.symbol}
                  </span>
                </div>
                <p className="text-xs text-[#E5EBEF] leading-relaxed">
                  "{post.text}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#9AA3AF] pt-2 border-t border-[#1F383D] font-mono">
                <span>{post.time}</span>
                <span className="text-[#028C8C]">{post.likes} Likes • {post.replies} Replies</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: COMMON QUESTIONS (FAQ ACCORDION)
      ========================================================================= */}
      <section className="rounded-[24px] border border-[#1F383D] bg-[#12262A] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1F383D]">
          <HelpCircle className="w-5 h-5 text-[#028C8C]" />
          <div>
            <h3 className="font-bold text-white text-base">Common questions about Investify & HalalPSX</h3>
            <p className="text-xs text-[#9AA3AF]">Straight answers about PSX live data, portfolio tracking and AI watchers</p>
          </div>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-[#1F383D] bg-[#0F1D21] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-[#028C8C] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#028C8C] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#9AA3AF] shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-[#9AA3AF] leading-relaxed border-t border-[#1F383D] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: INVESTIFY EXACT FOOTER
      ========================================================================= */}
      <footer className="pt-6 pb-28 md:pb-12 border-t border-[#1F383D] text-xs text-[#9AA3AF] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Halal<span className="text-[#028C8C]">PSX</span></span>
            <span>• Pakistan Stock Exchange Portal</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>Email: <strong className="text-white">support@halalpsx.pk</strong></span>
            <span>WhatsApp: <strong className="text-[#028C8C]">+92-346-8378439</strong></span>
          </div>
        </div>

        <p className="text-[11px] text-[#9AA3AF]/80 leading-relaxed text-center sm:text-left">
          Licensed PSX live data integration via Cloudflare High-Speed Master Engine. Educational fintech research co-pilot. Not registered financial advice under SECP regulations.
        </p>
      </footer>

    </div>
  );
};
