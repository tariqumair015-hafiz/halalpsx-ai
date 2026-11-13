import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import type { StockQuote, BrokerType, RuleTriggerType } from '../types';
import { calculatePsxTrade } from '../services/calculatorService';
import { X, Target, AlertCircle, TrendingUp, ShieldAlert, Zap, ArrowDownCircle } from 'lucide-react';

interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: StockQuote | null;
  stocks: StockQuote[];
  initialPreset?: { triggerType: RuleTriggerType; sellPercentage: 25 | 50 | 75 | 100 };
  onSaveRule: (rule: {
    symbol: string;
    triggerType: RuleTriggerType;
    buy_target: number;
    sell_target: number;
    stop_loss_target?: number;
    quantity: number;
    sellPercentage: 25 | 50 | 75 | 100;
    broker: BrokerType;
  }) => void;
}

export const CreateRuleModal: React.FC<CreateRuleModalProps> = ({
  isOpen,
  onClose,
  stock,
  stocks,
  initialPreset,
  onSaveRule,
}) => {
  const { user } = useAuth();
  const [symbol, setSymbol] = useState(stock ? stock.symbol : 'MLCF');
  const [triggerType, setTriggerType] = useState<RuleTriggerType>(initialPreset?.triggerType || 'TARGET_PRICE');
  const [buyTarget, setBuyTarget] = useState(stock ? (stock.currentPrice * 0.98).toFixed(1) : '102.5');
  const [sellTarget, setSellTarget] = useState(stock ? (stock.currentPrice * 1.08).toFixed(1) : '112.0');
  const [stopLossTarget, setStopLossTarget] = useState(stock ? (stock.low * 0.98).toFixed(1) : '98.0');
  const [sellPercentage, setSellPercentage] = useState<25 | 50 | 75 | 100>(initialPreset?.sellPercentage || 100);
  const [quantity, setQuantity] = useState(10);
  const [broker, setBroker] = useState<BrokerType>(user.broker);
  const [error, setError] = useState<string | null>(null);

  const currentSelectedStock = stocks.find(s => s.symbol === symbol);

  useEffect(() => {
    if (stock) {
      setSymbol(stock.symbol);
      setBuyTarget((stock.currentPrice * 0.98).toFixed(1));
      setSellTarget(stock.upperLockPrice ? stock.upperLockPrice.toFixed(1) : (stock.currentPrice * 1.08).toFixed(1));
      setStopLossTarget(stock.low.toFixed(1));
      
      const affordable = Math.max(1, Math.floor(user.budget / (stock.currentPrice * 1.015)));
      setQuantity(Math.min(10, affordable));
    }
    if (initialPreset) {
      setTriggerType(initialPreset.triggerType);
      setSellPercentage(initialPreset.sellPercentage);
      if (stock) {
        if (initialPreset.triggerType === 'UPPER_LOCK') {
          const upperLock = stock.upperLockPrice || (stock.currentPrice * 1.075);
          setSellTarget(upperLock.toFixed(2));
        } else if (initialPreset.triggerType === 'STOP_LOSS_LOW') {
          setStopLossTarget(stock.low.toFixed(2));
        }
      }
    }
  }, [stock, initialPreset, user.budget]);

  // Adjust targets when trigger preset is clicked
  const handleTriggerTypeSelect = (type: RuleTriggerType) => {
    setTriggerType(type);
    if (!currentSelectedStock) return;

    if (type === 'UPPER_LOCK') {
      // Upper Circuit / Peak Day High Exit
      const upperLock = currentSelectedStock.upperLockPrice || (currentSelectedStock.currentPrice * 1.075);
      setSellTarget(upperLock.toFixed(2));
      setSellPercentage(100); // Poora maal sell
    } else if (type === 'STOP_LOSS_LOW') {
      // Day Low protection
      setStopLossTarget(currentSelectedStock.low.toFixed(2));
      setSellPercentage(100); // Poora maal becho taake mazeed loss na ho
    }
  };

  if (!isOpen) return null;

  const numBuy = parseFloat(buyTarget) || 0;
  const numSell = parseFloat(sellTarget) || 0;
  const numQty = quantity || 0;

  const tradeEst = calculatePsxTrade({
    shares: numQty,
    buyPrice: numBuy,
    sellPrice: numSell,
    taxStatus: user.tax_status,
    broker,
  });

  const isAffordable = user.budget >= tradeEst.totalBuyCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numBuy <= 0 || numSell <= 0 || numQty <= 0) {
      setError('Please enter valid positive numbers for buy, sell, and shares.');
      return;
    }

    if (numSell <= numBuy && triggerType !== 'STOP_LOSS_LOW') {
      setError('Sell target must be higher than buy target for a profitable rule.');
      return;
    }

    onSaveRule({
      symbol,
      triggerType,
      buy_target: numBuy,
      sell_target: numSell,
      stop_loss_target: parseFloat(stopLossTarget) || undefined,
      quantity: numQty,
      sellPercentage,
      broker,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Smart Trading & Auto Watcher Order</h3>
              <p className="text-xs text-slate-400">Upper Lock Exit • Stop Loss at Day Low • Target Price</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Quick Strategy Trigger Presets */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-semibold text-xs">Strategy Mode (کونسا آرڈر لگانا ہے؟):</label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleTriggerTypeSelect('TARGET_PRICE')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                triggerType === 'TARGET_PRICE'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <div>Target Price</div>
              <div className="text-[10px] text-slate-500">Sell at Rs X</div>
            </button>

            <button
              type="button"
              onClick={() => handleTriggerTypeSelect('UPPER_LOCK')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                triggerType === 'UPPER_LOCK'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <div>Upper Lock Exit</div>
              <div className="text-[10px] text-slate-500">+7.5% Circuit</div>
            </button>

            <button
              type="button"
              onClick={() => handleTriggerTypeSelect('STOP_LOSS_LOW')}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                triggerType === 'STOP_LOSS_LOW'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 mx-auto mb-1 text-rose-400" />
              <div>Day Low Stop Loss</div>
              <div className="text-[10px] text-slate-500">Capital Protect</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Symbol Select & Broker Select */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">PSX Stock Symbol</label>
              <select
                value={symbol}
                onChange={e => {
                  setSymbol(e.target.value);
                  const s = stocks.find(item => item.symbol === e.target.value);
                  if (s) {
                    setBuyTarget((s.currentPrice * 0.98).toFixed(1));
                    setSellTarget(s.upperLockPrice ? s.upperLockPrice.toFixed(1) : (s.currentPrice * 1.08).toFixed(1));
                    setStopLossTarget(s.low.toFixed(1));
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              >
                {stocks.map(s => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} (Rs {s.currentPrice.toFixed(2)}) {s.shariahCompliant ? '🌙' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Target Broker</label>
              <select
                value={broker}
                onChange={e => setBroker(e.target.value as BrokerType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="KTrade">KTrade</option>
                <option value="Finqalab">Finqalab</option>
                <option value="Zindagi">Zindagi</option>
                <option value="AKD Trade">AKD Trade</option>
                <option value="Arif Habib">Arif Habib</option>
                <option value="MStock">MStock</option>
              </select>
            </div>
          </div>

          {/* Pricing Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-1">
              <label className="block text-emerald-400 font-bold">Entry / Buy Target (Rs)</label>
              <input
                type="number"
                step="0.05"
                value={buyTarget}
                onChange={e => setBuyTarget(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold text-sm"
                placeholder="102.5"
                required
              />
              <div className="text-[10px] text-slate-500 font-mono">
                Live: Rs {currentSelectedStock?.currentPrice.toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-1">
              <label className="block text-amber-400 font-bold">
                {triggerType === 'UPPER_LOCK' ? '🚀 Upper Lock Exit (Rs)' : 'Target Sell Exit (Rs)'}
              </label>
              <input
                type="number"
                step="0.05"
                value={sellTarget}
                onChange={e => setSellTarget(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold text-sm"
                placeholder="112.0"
                required
              />
              <div className="text-[10px] text-teal-400 font-mono">
                Gain: +{numBuy > 0 ? (((numSell - numBuy) / numBuy) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          {/* Stop Loss Input if Stop Loss Mode is active */}
          {triggerType === 'STOP_LOSS_LOW' && (
            <div className="bg-rose-950/30 p-3 rounded-2xl border border-rose-500/30 space-y-1">
              <div className="flex justify-between items-center text-rose-300 font-bold">
                <span>🛑 Day Low Stop-Loss Cut Target (Rs):</span>
                <span>Day Low: Rs {currentSelectedStock?.low.toFixed(2)}</span>
              </div>
              <input
                type="number"
                step="0.05"
                value={stopLossTarget}
                onChange={e => setStopLossTarget(e.target.value)}
                className="w-full bg-slate-900 border border-rose-500/40 rounded-lg px-3 py-1.5 text-white font-mono font-bold"
                placeholder="98.0"
              />
              <p className="text-[10px] text-rose-400/80">
                اگر قیمت اس ریٹ سے نیچے گری تو کلاؤڈ الرٹ ٹرگر ہو جائے گا تاکہ مزید بڑا نقصان نہ ہو۔
              </p>
            </div>
          )}

          {/* Sell Quantity (Aadha Maal vs Poora Maal) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Sell Quantity (کتنا مال بیچنا ہے؟):</span>
              <span className="text-emerald-400 font-mono font-bold">
                {sellPercentage === 100 ? '100% (پورا مال)' : `${sellPercentage}% (آدھا مال)`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([25, 50, 75, 100] as const).map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setSellPercentage(pct)}
                  className={`py-1.5 rounded-lg border font-mono font-bold transition-all ${
                    sellPercentage === pct
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pct}% {pct === 100 ? '🔥' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Total Shares */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-semibold">Total Shares</label>
              <span className="text-[11px] text-emerald-400 font-mono">
                Max Affordable: {Math.floor(user.budget / (numBuy * 1.015 || 1))} shares
              </span>
            </div>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
              required
            />
          </div>

          {/* Estimated Financial Breakdown */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-400 font-sans">
              <span>Required Cash:</span>
              <span className="text-white font-bold">Rs {tradeEst.totalBuyCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400 font-sans">
              <span>Estimated Net Profit on Exit:</span>
              <span className="text-emerald-400 font-bold">+Rs {tradeEst.netProfit.toFixed(2)} ({tradeEst.netReturnPercent.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              ✓ Set Smart Order Rule
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
