import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import type { PortfolioHolding, PsxRule, StockQuote, TradeHistoryItem } from '../types';
import { calculatePsxTrade } from '../services/calculatorService';
import { parseBrokerScreenshot } from '../services/aiService';
import confetti from 'canvas-confetti';
import { 
  Briefcase, 
  Target, 
  History, 
  Camera, 
  CheckCircle, 
  Trash2, 
  PlusCircle, 
  Upload, 
  Sparkles,
  DollarSign
} from 'lucide-react';

interface PortfolioTabsProps {
  holdings: PortfolioHolding[];
  rules: PsxRule[];
  tradeHistory: TradeHistoryItem[];
  stocks: StockQuote[];
  onConfirmBought: (rule: PsxRule) => void;
  onRecordSold: (rule: PsxRule) => void;
  onDeleteRule: (id: string) => void;
  onDeleteHolding: (id: string) => void;
  onImportScreenshotHoldings: (holdings: PortfolioHolding[], cash: number) => void;
  onOpenCreateRule: () => void;
  onOpenAddHolding: () => void;
}

export const PortfolioTabs: React.FC<PortfolioTabsProps> = ({
  holdings,
  rules,
  tradeHistory,
  stocks,
  onConfirmBought,
  onRecordSold,
  onDeleteRule,
  onDeleteHolding,
  onImportScreenshotHoldings,
  onOpenCreateRule,
  onOpenAddHolding,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'holdings' | 'rules' | 'history' | 'importer'>('rules');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#F59E0B'],
    });
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    const result = await parseBrokerScreenshot(file);
    setIsScanning(false);
    setScanResult(result);
  };

  const applyScanResult = () => {
    if (!scanResult) return;

    const newHoldings: PortfolioHolding[] = scanResult.holdings.map((h: any, i: number) => ({
      id: `holding-scan-${Date.now()}-${i}`,
      symbol: h.symbol,
      quantity: h.quantity,
      avg_buy_price: h.avg_buy_price,
      broker: (scanResult.broker || user.broker) as any,
      shariah_compliant: h.shariah_compliant ?? true,
    }));

    onImportScreenshotHoldings(newHoldings, scanResult.extractedCash || 0);
    triggerCelebration();
    setScanResult(null);
    setActiveTab('holdings');
  };

  return (
    <div className="bg-[#12262A] border border-[#1F383D] rounded-[24px] p-5 shadow-xl space-y-5">
      <div className="flex items-center gap-1.5 p-1 bg-[#0F1D21] border border-[#1F383D] rounded-full overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-[#028C8C] text-white shadow-md'
              : 'text-[#9AA3AF] hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Auto Target Watcher ({rules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('holdings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'holdings'
              ? 'bg-[#028C8C] text-white shadow-md'
              : 'text-[#9AA3AF] hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Active Holdings ({holdings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#028C8C] text-white shadow-md'
              : 'text-[#9AA3AF] hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Sold History ({tradeHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('importer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'importer'
              ? 'bg-[#028C8C] text-white shadow-md'
              : 'text-[#9AA3AF] hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4 text-[#028C8C]" />
          <span>Scan Broker App (AI)</span>
        </button>
      </div>

      {/* TAB 1: AUTO TARGET WATCHER */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#028C8C]" />
                <span>Cloud Target Rules ("Buy at X, Sell at Y")</span>
              </h3>
              <p className="text-xs text-[#9AA3AF] mt-0.5">
                Worker cron runs every 15 mins during PSX market hours (9:15 AM - 3:30 PM PKT)
              </p>
            </div>
            <button
              onClick={onOpenCreateRule}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#028C8C] hover:bg-[#027A7A] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Rule</span>
            </button>
          </div>

          {rules.length === 0 ? (
            <div className="text-center py-12 bg-[#0F1D21] rounded-2xl border border-dashed border-[#1F383D] space-y-3">
              <Target className="w-10 h-10 text-[#9AA3AF]/40 mx-auto" />
              <div className="text-sm font-medium text-white">No active target watcher rules yet</div>
              <p className="text-xs text-[#9AA3AF] max-w-sm mx-auto">
                Set a "Buy at X, Sell at Y" rule or ask the Roman Urdu AI Co-Pilot: <em>"MLCF 103 pe 10 share buy aur 112 pe sell set kar do"</em>!
              </p>
              <button
                onClick={onOpenCreateRule}
                className="px-4 py-2 rounded-full bg-[#028C8C] hover:bg-[#027A7A] text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                Set Your First Rule
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map(rule => {
                const quote = stocks.find(s => s.symbol.toUpperCase() === rule.symbol.toUpperCase());
                const livePrice = quote ? quote.currentPrice : rule.buy_target;

                const span = rule.sell_target - rule.buy_target;
                const progress = span > 0 ? ((livePrice - rule.buy_target) / span) * 100 : 50;

                const isBuyTriggered = livePrice <= rule.buy_target && rule.status === 'WAITING_BUY';
                const isSellTriggered = (
                  rule.triggerType === 'UPPER_LOCK'
                    ? ((quote?.upperLockPrice && livePrice >= quote.upperLockPrice) || livePrice >= rule.sell_target)
                    : rule.triggerType === 'STOP_LOSS_LOW'
                    ? (livePrice <= (rule.stop_loss_target || quote?.low || rule.buy_target * 0.95))
                    : livePrice >= rule.sell_target
                ) && rule.status === 'BOUGHT_WAITING_SELL';

                return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    whileHover={{ y: -2 }}
                    className={`bg-[#0F1D21] border rounded-2xl p-4.5 space-y-3 transition-all relative overflow-hidden ${
                      isBuyTriggered || isSellTriggered
                        ? 'border-[#028C8C] shadow-xl shadow-[#028C8C]/10'
                        : 'border-[#1F383D] hover:border-[#028C8C]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-lg text-white font-mono">{rule.symbol}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#12262A] text-[#9AA3AF] border border-[#1F383D]">
                          {rule.broker}
                        </span>
                        {rule.triggerType === 'UPPER_LOCK' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5B301]/20 text-[#F5B301] border border-[#F5B301]/30">
                            🚀 Upper Lock ({rule.sellPercentage || 100}%)
                          </span>
                        )}
                        {rule.triggerType === 'STOP_LOSS_LOW' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            🛑 Stop Loss ({rule.sellPercentage || 100}%)
                          </span>
                        )}
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        rule.status === 'WAITING_BUY'
                          ? 'bg-[#F5B301]/20 text-[#F5B301] border-[#F5B301]/30'
                          : rule.status === 'BOUGHT_WAITING_SELL'
                          ? 'bg-[#028C8C]/20 text-[#028C8C] border-[#028C8C]/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {rule.status === 'WAITING_BUY' && '1. WAITING FOR DIP BUY'}
                        {rule.status === 'BOUGHT_WAITING_SELL' && '2. BOUGHT • WAITING FOR EXIT'}
                        {rule.status === 'COMPLETED' && '✓ COMPLETED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-[#0B1012] p-3 rounded-xl border border-[#1F383D] text-center font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-[#9AA3AF] uppercase">Buy Target</div>
                        <div className="text-emerald-400 font-bold mt-0.5">Rs {rule.buy_target.toFixed(2)}</div>
                      </div>
                      <div className="border-x border-[#1F383D] px-1">
                        <div className="text-[10px] text-[#9AA3AF] uppercase">Live PSX</div>
                        <div className="text-white font-extrabold mt-0.5">Rs {livePrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#9AA3AF] uppercase">Sell Target</div>
                        <div className="text-[#028C8C] font-bold mt-0.5">Rs {rule.sell_target.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#9AA3AF]">
                        <span>Quantity: <strong className="text-white">{rule.quantity} Shares</strong></span>
                        <span>Gain Potential: +{(((rule.sell_target - rule.buy_target) / rule.buy_target) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="relative w-full h-2 bg-[#0B1012] rounded-full overflow-hidden border border-[#1F383D]">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#028C8C] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1F383D] flex items-center justify-between gap-2">
                      {rule.status === 'WAITING_BUY' && (
                        <button
                          onClick={() => {
                            onConfirmBought(rule);
                            triggerCelebration();
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full font-bold text-xs transition-colors cursor-pointer ${
                            isBuyTriggered
                              ? 'bg-[#028C8C] hover:bg-[#027A7A] text-white animate-bounce'
                              : 'bg-[#12262A] hover:bg-[#152B30] text-[#E5EBEF] border border-[#1F383D]'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-[#028C8C]" />
                          <span>✅ Confirm Bought on {rule.broker}</span>
                        </button>
                      )}

                      {rule.status === 'BOUGHT_WAITING_SELL' && (
                        <button
                          onClick={() => {
                            onRecordSold(rule);
                            triggerCelebration();
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full font-bold text-xs transition-colors cursor-pointer ${
                            isSellTriggered
                              ? 'bg-[#028C8C] hover:bg-[#027A7A] text-white animate-bounce'
                              : 'bg-[#028C8C]/20 hover:bg-[#028C8C]/30 text-[#028C8C] border border-[#028C8C]/40'
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5 text-[#028C8C]" />
                          <span>💰 Record Sold (Book Profit)</span>
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        className="p-2 rounded-full bg-[#0B1012] hover:bg-rose-950/60 text-[#9AA3AF] hover:text-rose-400 border border-[#1F383D] transition-colors cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE HOLDINGS */}
      {activeTab === 'holdings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#028C8C]" />
                <span>Active Stock Positions (Investify Core)</span>
              </h3>
              <p className="text-xs text-[#9AA3AF] mt-0.5">
                Realized and unrealized net profits include broker commission, FED (16%), CDC, and CGT
              </p>
            </div>
            <button
              onClick={onOpenAddHolding}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#028C8C] hover:bg-[#027A7A] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Stock Position</span>
            </button>
          </div>

          {holdings.length === 0 ? (
            <div className="text-center py-12 bg-[#0F1D21] rounded-2xl border border-dashed border-[#1F383D] space-y-3">
              <Briefcase className="w-10 h-10 text-[#9AA3AF]/40 mx-auto" />
              <div className="text-sm font-medium text-white">No active stock holdings yet</div>
              <p className="text-xs text-[#9AA3AF] max-w-sm mx-auto">
                Scan your broker app screenshot or record bought shares to track true net P&L after taxes!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1F383D] text-[#9AA3AF] uppercase font-mono text-[10px] bg-[#0F1D21]">
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Shares</th>
                    <th className="py-2.5 px-3">Avg Buy</th>
                    <th className="py-2.5 px-3">Live Price</th>
                    <th className="py-2.5 px-3">Invested Cost</th>
                    <th className="py-2.5 px-3">Current Value</th>
                    <th className="py-2.5 px-3">Net Profit/Loss (Post-Tax)</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F383D]/60 font-mono">
                  {holdings.map(h => {
                    const quote = stocks.find(s => s.symbol.toUpperCase() === h.symbol.toUpperCase());
                    const livePrice = quote ? quote.currentPrice : h.avg_buy_price;

                    const trade = calculatePsxTrade({
                      shares: h.quantity,
                      buyPrice: h.avg_buy_price,
                      sellPrice: livePrice,
                      taxStatus: user.tax_status,
                      broker: h.broker,
                    });

                    const isProfit = trade.netProfit >= 0;

                    return (
                      <tr key={h.id} className="hover:bg-[#152B30]/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-white text-sm">{h.symbol}</div>
                          <span className="text-[10px] text-[#9AA3AF] font-sans">{h.broker}</span>
                        </td>
                        <td className="py-3 px-3 text-white font-bold">{h.quantity}</td>
                        <td className="py-3 px-3 text-[#9AA3AF]">Rs {h.avg_buy_price.toFixed(2)}</td>
                        <td className="py-3 px-3 text-white font-bold">Rs {livePrice.toFixed(2)}</td>
                        <td className="py-3 px-3 text-[#9AA3AF]">Rs {trade.totalBuyCost.toFixed(0)}</td>
                        <td className="py-3 px-3 text-white font-bold">Rs {trade.grossSellValue.toFixed(0)}</td>
                        <td className="py-3 px-3">
                          <div className={`font-bold flex items-center gap-1 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? '+' : ''}Rs {trade.netProfit.toFixed(2)}
                            <span className="text-[10px]">({isProfit ? '+' : ''}{trade.netReturnPercent.toFixed(1)}%)</span>
                          </div>
                          <div className="text-[9px] text-[#9AA3AF] font-sans">
                            Break-even: Rs {trade.breakevenSellPrice}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onDeleteHolding(h.id)}
                            className="p-1.5 rounded-full bg-[#0F1D21] hover:bg-rose-950 text-[#9AA3AF] hover:text-rose-400 border border-[#1F383D] transition-colors cursor-pointer"
                            title="Remove position"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SOLD HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#028C8C]" />
                <span>Sold History (Realized Net Profits)</span>
              </h3>
              <p className="text-xs text-[#9AA3AF] mt-0.5">
                Completed trades automatically return principal + profit into your Free Cash
              </p>
            </div>
          </div>

          {tradeHistory.length === 0 ? (
            <div className="text-center py-12 bg-[#0F1D21] rounded-2xl border border-dashed border-[#1F383D] space-y-2">
              <History className="w-10 h-10 text-[#9AA3AF]/40 mx-auto" />
              <div className="text-sm font-medium text-white">No closed trades recorded yet</div>
              <p className="text-xs text-[#9AA3AF]">
                When you click "Record Sold" on target rules, realized profits will be archived here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1F383D] text-[#9AA3AF] uppercase font-mono text-[10px] bg-[#0F1D21]">
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Shares</th>
                    <th className="py-2.5 px-3">Buy Price</th>
                    <th className="py-2.5 px-3">Sell Price</th>
                    <th className="py-2.5 px-3">Round-Trip Fees</th>
                    <th className="py-2.5 px-3">CGT Tax</th>
                    <th className="py-2.5 px-3">Net Realized P&L</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F383D]/60 font-mono">
                  {tradeHistory.map(item => (
                    <tr key={item.id} className="hover:bg-[#152B30]/60 transition-colors">
                      <td className="py-2.5 px-3 font-extrabold text-white">{item.symbol}</td>
                      <td className="py-2.5 px-3 text-[#9AA3AF]">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-[#9AA3AF]">Rs {item.buy_price.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-[#E5EBEF]">Rs {item.sell_price.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-[#9AA3AF]">
                        Rs {(item.broker_commission + item.fed_tax + item.cdc_charges).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-[#9AA3AF]">Rs {item.cgt_tax.toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold ${item.net_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.net_pnl >= 0 ? '+' : ''}Rs {item.net_pnl.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#9AA3AF] text-[10px]">{item.closed_at.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SCREENSHOT PORTFOLIO IMPORTER */}
      {activeTab === 'importer' && (
        <div className="space-y-4">
          <div className="bg-[#0F1D21] border border-[#1F383D] rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#028C8C]/20 text-[#028C8C] border border-[#028C8C]/30 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">AI Screenshot Portfolio Importer</h3>
              <p className="text-xs text-[#9AA3AF] max-w-md mx-auto mt-1">
                Take a screenshot of your <strong>KTrade, Finqalab, or Zindagi</strong> portfolio screen. 
                Google Gemini Vision will parse your cash balance & holdings automatically!
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#028C8C] hover:bg-[#027A7A] text-white font-bold text-xs cursor-pointer shadow-lg shadow-[#028C8C]/20 transition-all active:scale-95">
              <Upload className="w-4 h-4" />
              <span>{isScanning ? 'Analyzing with Gemini Vision...' : 'Upload Broker Screenshot'}</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleScreenshotUpload} 
                className="hidden" 
                disabled={isScanning}
              />
            </label>

            {isScanning && (
              <div className="text-xs text-[#028C8C] font-mono animate-pulse">
                Extracting stock tickers, cash balance & prices via Gemini Vision...
              </div>
            )}
          </div>

          {scanResult && (
            <div className="bg-[#0F1D21] border border-[#028C8C]/40 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#028C8C]" />
                  <span className="font-bold text-white text-sm">Extracted Portfolio from {scanResult.broker}</span>
                </div>
                <span className="text-xs font-mono text-[#028C8C] font-bold">
                  Cash Detected: Rs {scanResult.extractedCash?.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-[#9AA3AF]">Detected Stock Positions:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {scanResult.holdings?.map((h: any, i: number) => (
                    <div key={i} className="bg-[#0B1012] p-2.5 rounded-xl border border-[#1F383D] text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{h.symbol}</span>
                        <span className="text-[10px] text-[#028C8C]">🌙 Halal</span>
                      </div>
                      <div className="text-[#9AA3AF] text-[11px] mt-1">
                        {h.quantity} Shares @ Rs {h.avg_buy_price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F383D]">
                <button
                  onClick={() => setScanResult(null)}
                  className="px-3.5 py-1.5 rounded-full bg-[#12262A] text-[#9AA3AF] hover:text-white text-xs font-medium border border-[#1F383D] cursor-pointer"
                >
                  Discard
                </button>
                <button
                  onClick={applyScanResult}
                  className="px-4 py-1.5 rounded-full bg-[#028C8C] hover:bg-[#027A7A] text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  ✓ Confirm & Import into Portfolio
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
