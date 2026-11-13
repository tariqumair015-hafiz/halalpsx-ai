import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { StockQuote, BrokerType } from '../types';
import { X, PlusCircle } from 'lucide-react';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: StockQuote[];
  onAddHolding: (holding: {
    symbol: string;
    quantity: number;
    avg_buy_price: number;
    broker: BrokerType;
  }) => void;
}

export const AddHoldingModal: React.FC<AddHoldingModalProps> = ({
  isOpen,
  onClose,
  stocks,
  onAddHolding,
}) => {
  const { user } = useAuth();
  const [symbol, setSymbol] = useState('MLCF');
  const [quantity, setQuantity] = useState(100);
  const [buyPrice, setBuyPrice] = useState(104.50);
  const [broker, setBroker] = useState<BrokerType>(user.broker);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || buyPrice <= 0) return;

    onAddHolding({
      symbol,
      quantity,
      avg_buy_price: buyPrice,
      broker,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Record Stock Purchase</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Symbol</label>
            <select
              value={symbol}
              onChange={e => {
                setSymbol(e.target.value);
                const s = stocks.find(item => item.symbol === e.target.value);
                if (s) setBuyPrice(s.currentPrice);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
            >
              {stocks.map(s => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} ({s.name.slice(0, 18)}) {s.shariahCompliant ? '🌙' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Shares Bought</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Buy Price (Rs)</label>
              <input
                type="number"
                step="0.05"
                value={buyPrice}
                onChange={e => setBuyPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Broker Account</label>
            <select
              value={broker}
              onChange={e => setBroker(e.target.value as BrokerType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
            >
              <option value="KTrade">KTrade</option>
              <option value="Finqalab">Finqalab</option>
              <option value="Zindagi">Zindagi</option>
              <option value="AKD Trade">AKD Trade</option>
              <option value="Arif Habib">Arif Habib</option>
              <option value="MStock">MStock</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
            >
              Save to Active Holdings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
