import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-[#090D16] border-t border-slate-800/80 text-xs text-slate-400 py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
              SECP & Shariah Compliance Legal Disclaimer:
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              HalalPSX AI is an independent educational research, technical screener, and natural language portfolio watcher. 
              <strong> It is NOT an SECP-licensed stock brokerage or financial advisory entity.</strong> PSX equity investments involve market risks and volatility. 
              Target triggers and AI prompts are for tracking convenience only. Always consult a licensed TREC-holder broker before executing real trades.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <span>🌙</span> HalalPSX AI
            </span>
            <span>•</span>
            <span>Investify.pk Inspired + Islamic Cloud Co-Pilot</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px]">
              DPS Live Data Feed • Shariah Standards: KMI-30 / Meezan
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              Made with <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400" /> for Pakistani Investors
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
