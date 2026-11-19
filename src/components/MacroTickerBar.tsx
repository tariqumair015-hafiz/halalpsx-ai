import React from 'react';
import type { MacroData } from '../types';
import { DollarSign, Award, Layers } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface MacroTickerBarProps {
  macro: MacroData;
}

export const MacroTickerBar: React.FC<MacroTickerBarProps> = ({ macro }) => {
  const breadthTotal = macro.marketBreadth.advancing + macro.marketBreadth.declining + macro.marketBreadth.unchanged;
  const advancePercent = breadthTotal > 0 ? (macro.marketBreadth.advancing / breadthTotal) * 100 : 50;

  const kmiSparkline = macro.kmi30.sparkline || [251200, 252100, 253000, 252800, 253600, 253900, 254174];
  const kseSparkline = macro.kse100.sparkline || [176500, 177100, 177800, 177600, 178000, 178050, 178182];

  return (
    <div className="w-full bg-[#0F1D21] border-b border-[#1F383D] text-xs overflow-x-auto no-scrollbar shadow-inner">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 py-2 flex items-center gap-6 min-w-max">
        {/* KMI-30 Halal Index */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 font-semibold text-[#028C8C]">
            <span>🌙 KMI-30</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#028C8C]/20 text-[#028C8C] font-bold border border-[#028C8C]/30">HALAL</span>
          </div>
          <span className="text-white font-mono font-bold">{macro.kmi30.index.toLocaleString()}</span>
          <span className="flex items-center text-[11px] font-mono text-[#028C8C] font-semibold">
            {macro.kmi30.change >= 0 ? '+' : ''}{macro.kmi30.change} ({macro.kmi30.changePercent >= 0 ? '+' : ''}{macro.kmi30.changePercent}%)
          </span>
          <Sparkline data={kmiSparkline} width={64} height={18} isUp={true} strokeWidth={1.5} />
        </div>

        <div className="w-px h-4 bg-[#1F383D]" />

        {/* KSE-100 Benchmark Index */}
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-slate-300">KSE-100</span>
          <span className="text-white font-mono font-bold">{macro.kse100.index.toLocaleString()}</span>
          <span className="flex items-center text-[11px] font-mono text-[#028C8C] font-semibold">
            {macro.kse100.change >= 0 ? '+' : ''}{macro.kse100.change} ({macro.kse100.changePercent >= 0 ? '+' : ''}{macro.kse100.changePercent}%)
          </span>
          <Sparkline data={kseSparkline} width={64} height={18} isUp={true} strokeWidth={1.5} />
        </div>

        <div className="w-px h-4 bg-[#1F383D]" />

        {/* USD / PKR */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <DollarSign className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium text-[#9AA3AF]">USD/PKR:</span>
          <span className="text-white font-mono font-medium">Rs {macro.usdPkr.rate}</span>
          <span className="text-[11px] text-[#028C8C] font-mono">({macro.usdPkr.change})</span>
        </div>

        <div className="w-px h-4 bg-[#1F383D]" />

        {/* Gold Tola Rate */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <Award className="w-3.5 h-3.5 text-[#F5B301]" />
          <span className="font-medium text-[#9AA3AF]">Gold/Tola:</span>
          <span className="text-white font-mono font-medium">Rs {macro.goldTolaPkr.rate.toLocaleString()}</span>
          <span className="text-[11px] text-[#F5B301] font-mono">(+{macro.goldTolaPkr.change})</span>
        </div>

        <div className="w-px h-4 bg-[#1F383D]" />

        {/* Market Breadth Advancing vs Declining */}
        <div className="flex items-center gap-2">
          <span className="text-[#9AA3AF] font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#028C8C]" />
            Breadth:
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-[#028C8C] font-semibold">{macro.marketBreadth.advancing} ▲</span>
            <div className="w-16 h-1.5 bg-rose-950/80 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-[#028C8C] rounded-full" 
                style={{ width: `${advancePercent}%` }}
              />
            </div>
            <span className="text-rose-400 font-semibold">{macro.marketBreadth.declining} ▼</span>
          </div>
        </div>
      </div>
    </div>
  );
};
