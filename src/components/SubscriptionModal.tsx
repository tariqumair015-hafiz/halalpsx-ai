import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { SubscriptionPlan } from '../types';
import confetti from 'canvas-confetti';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { updatePlan } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('PRO');
  const [paymentMethod, setPaymentMethod] = useState<'RAAST' | 'SADAPAY' | 'EASYPAISA' | 'JAZZCASH'>('RAAST');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      updatePlan(selectedPlan);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Crown className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Upgrade HalalPSX AI</h3>
              <p className="text-xs text-slate-400">Zero-latency cloud target alerts & unlimited AI rules</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {verificationSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Mubarak! Plan Activated</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Aap ka <strong>{selectedPlan} Tier</strong> subscription activate ho chuka hai. Cloud watcher ab aapke target alerts ko instant push notifications par deliver karega!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg"
            >
              Start Using Pro Features
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedPlan('PRO')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === 'PRO'
                    ? 'bg-amber-950/20 border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-extrabold text-white text-base">Pro Investor</h4>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                      Rs 499 <span className="text-xs text-slate-400 font-sans font-normal">/ month</span>
                    </div>
                  </div>
                  {selectedPlan === 'PRO' && (
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold">
                      Selected
                    </span>
                  )}
                </div>

                <ul className="space-y-2 text-xs text-slate-300 mt-4 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Unlimited "Buy at X, Sell at Y" Cloud Rules</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Instant Mobile Push Notifications (`ntfy.sh`)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>AI Screenshot Portfolio Importer (Gemini Vision)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Unlimited Roman Urdu AI Co-Pilot Queries</span>
                  </li>
                </ul>
              </div>

              <div
                onClick={() => setSelectedPlan('PREMIUM')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlan === 'PREMIUM'
                    ? 'bg-emerald-950/20 border-emerald-500 shadow-xl shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-extrabold text-white text-base">Elite Shariah</h4>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                      Rs 1,499 <span className="text-xs text-slate-400 font-sans font-normal">/ month</span>
                    </div>
                  </div>
                  {selectedPlan === 'PREMIUM' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-bold">
                      Selected
                    </span>
                  )}
                </div>

                <ul className="space-y-2 text-xs text-slate-300 mt-4 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Everything in Pro Tier</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Direct WhatsApp & Telegram Webhook Alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>PDF Financial Results & Annual Report Summarizer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Quarterly Dividend Purification Audit Report</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-200">
                Local Pakistani Payment Options (Raast / SadaPay / EasyPaisa / JazzCash)
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                {(['RAAST', 'SADAPAY', 'EASYPAISA', 'JAZZCASH'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all ${
                      paymentMethod === method
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5">
                {paymentMethod === 'RAAST' && (
                  <>
                    <div className="text-emerald-400 font-bold">Raast Instant Payment ID:</div>
                    <div className="text-white text-sm font-extrabold select-all">03001234567</div>
                    <div className="text-slate-400 text-[11px] font-sans">Account Title: HalalPSX Fintech Solutions</div>
                  </>
                )}
                {paymentMethod === 'SADAPAY' && (
                  <>
                    <div className="text-teal-400 font-bold">SadaPay IBAN:</div>
                    <div className="text-white text-sm font-extrabold select-all">PK12SADA0000001234567890</div>
                    <div className="text-slate-400 text-[11px] font-sans">Account Title: HalalPSX AI</div>
                  </>
                )}
                {paymentMethod === 'EASYPAISA' && (
                  <>
                    <div className="text-emerald-400 font-bold">EasyPaisa Mobile Account:</div>
                    <div className="text-white text-sm font-extrabold select-all">03451234567</div>
                    <div className="text-slate-400 text-[11px] font-sans">Title: Muhammad Ali (HalalPSX)</div>
                  </>
                )}
                {paymentMethod === 'JAZZCASH' && (
                  <>
                    <div className="text-amber-400 font-bold">JazzCash Mobile Account:</div>
                    <div className="text-white text-sm font-extrabold select-all">03011234567</div>
                    <div className="text-slate-400 text-[11px] font-sans">Title: HalalPSX Operations</div>
                  </>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-sans">
                  Send Rs {selectedPlan === 'PRO' ? '499' : '1,499'} and click below:
                </span>
                <button
                  onClick={handleSimulatePayment}
                  disabled={isVerifying}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isVerifying ? 'Verifying Receipt with AI...' : 'Verify & Unlock Pro'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
