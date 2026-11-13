import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { BrokerType, TaxStatus } from '../types';
import { 
  X, 
  Settings, 
  Building2, 
  Wallet, 
  FileText, 
  Bell, 
  Key, 
  CheckCircle,
  ExternalLink,
  Zap,
  Sparkles
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    updateBroker, 
    updateBudget, 
    updateTaxStatus, 
    updateApiKey,
    updateGroqApiKey,
    updateAiProvider,
  } = useAuth();

  const [broker, setBroker] = useState<BrokerType>(user.broker);
  const [budget, setBudget] = useState(user.budget.toString());
  const [taxStatus, setTaxStatus] = useState<TaxStatus>(user.tax_status);
  const [aiProvider, setAiProvider] = useState<'groq' | 'gemini'>(user.ai_provider || 'groq');
  const [groqKey, setGroqKey] = useState(user.groq_api_key || '');
  const [geminiKey, setGeminiKey] = useState(user.gemini_api_key || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBroker(broker);
    updateBudget(parseFloat(budget) || 0);
    updateTaxStatus(taxStatus);
    updateAiProvider(aiProvider);
    updateGroqApiKey(groqKey);
    updateApiKey(geminiKey);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Settings className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Investor Profile & AI Engine</h3>
              <p className="text-xs text-slate-400">Configure broker, capital & free AI providers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          {/* Broker Selector */}
          <div>
            <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Pakistani Broker</span>
            </label>
            <select
              value={broker}
              onChange={e => setBroker(e.target.value as BrokerType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="KTrade">KTrade (KASB Securities)</option>
              <option value="Finqalab">Finqalab (Next Capital)</option>
              <option value="Zindagi">Zindagi (JS Global)</option>
              <option value="AKD Trade">AKD Trade</option>
              <option value="Arif Habib">Arif Habib Limited</option>
              <option value="MStock">MStock (Meezan Financial)</option>
              <option value="Al-Meezan">Al-Meezan Investments</option>
            </select>
            <div className="text-[11px] text-slate-500 mt-1">
              Broker commission is auto-calculated as max(Rs 0.05/share, 0.15% value) + 16% FED.
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total Available Free Cash (PKR)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">Rs</span>
              <input
                type="number"
                min="0"
                step="500"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              {[25000, 50000, 100000, 500000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudget(val.toString())}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-400 hover:text-white"
                >
                  Rs {val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Tax Status */}
          <div>
            <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>FBR Tax Status (Capital Gains Tax Rate)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTaxStatus('FILER')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  taxStatus === 'FILER'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>Filer</div>
                <div className="text-[11px] font-mono mt-0.5">15% CGT Tax</div>
              </button>

              <button
                type="button"
                onClick={() => setTaxStatus('NON_FILER')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  taxStatus === 'NON_FILER'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>Non-Filer</div>
                <div className="text-[11px] font-mono mt-0.5">30% CGT Tax</div>
              </button>
            </div>
          </div>

          {/* Mobile Push Alerts */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <div className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Mobile Push Alerts Topic (`ntfy.sh`)</span>
              </div>
              <a
                href={`https://ntfy.sh/${user.ntfy_topic}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-emerald-400 flex items-center gap-0.5 hover:underline"
              >
                Open in App <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="font-mono text-emerald-300 text-xs bg-slate-950 p-2 rounded-lg border border-slate-800 select-all">
              https://ntfy.sh/{user.ntfy_topic}
            </div>
            <p className="text-[10px] text-slate-500">
              Install the free `ntfy` app on Android/iOS and subscribe to this channel for instant PSX target alerts!
            </p>
          </div>

          {/* AI Brain Engine Provider Selector */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Co-Pilot Provider (Free Tier Supported)</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                100% Free Tier
              </span>
            </div>

            {/* Provider Tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAiProvider('groq')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                  aiProvider === 'groq'
                    ? 'bg-amber-500/15 border-amber-500/60 text-white font-bold ring-1 ring-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>Groq Cloud</span>
                    <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400 font-mono">RECOMMENDED</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Llama 3.3 70B • 500 T/s</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAiProvider('gemini')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                  aiProvider === 'gemini'
                    ? 'bg-cyan-500/15 border-cyan-500/60 text-white font-bold ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Google Gemini</div>
                  <div className="text-[10px] text-slate-400">Gemini 2.5 & 2.0 Flash</div>
                </div>
              </button>
            </div>

            {/* Groq Configuration Input */}
            {aiProvider === 'groq' && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <span>Groq API Key</span>
                    <span className="text-[10px] text-amber-400 font-normal">(Instant & 100% Free)</span>
                  </label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    Free Key Banayein (30 sec) <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="gsk_... (Paste your Groq API key here)"
                  value={groqKey}
                  onChange={e => setGroqKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  💡 <strong>Kyun Groq behtar hai?</strong> Groq ka free tier 14,400 requests/day deta hai bina kisi credit card k, aur yeh Roman Urdu aur financial targets ko instantaneous (~0.3s) process karta hai!
                </p>
              </div>
            )}

            {/* Gemini Configuration Input */}
            {aiProvider === 'gemini' && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <span>Google Gemini API Key</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                  >
                    Google AI Studio Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy... (Paste Gemini key here)"
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Agar aapki Gemini key pe quota limit aa jaye, toh aap upar <strong>Groq Cloud</strong> select kar sakte hain jo bilkul free aur fast chalega!
                </p>
              </div>
            )}

            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">
              🛡️ <strong>Safety Guarantee:</strong> Agar aapke paas koi bhi key na ho, tab bhi hamara built-in <em>Deterministic Financial Math Engine</em> offline chalega aur app kabhi crash nahi hogi!
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
