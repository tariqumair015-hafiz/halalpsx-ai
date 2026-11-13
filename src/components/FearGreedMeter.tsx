import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Compass } from 'lucide-react';

interface FearGreedMeterProps {
  score: number;
  status: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED';
  description?: string;
}

export const FearGreedMeter: React.FC<FearGreedMeterProps> = ({ score, status }) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'EXTREME_FEAR':
        return { label: 'EXTREME FEAR (DIP ZONE)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', advice: 'Major discount opportunity for high-quality KMI-30 stocks.' };
      case 'FEAR':
        return { label: 'FEAR (ACCUMULATE)', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40', advice: 'Good entry levels for value investors averaging down.' };
      case 'NEUTRAL':
        return { label: 'NEUTRAL (CONSOLIDATION)', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', advice: 'Market moving in a tight range. Stick to target rules.' };
      case 'GREED':
        return { label: 'GREED (BULLISH MOMENTUM)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', advice: 'Strong momentum. Ride winners, but protect profits with sell targets.' };
      case 'EXTREME_GREED':
        return { label: 'EXTREME GREED (OVERBOUGHT)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', advice: 'Do not chase parabolic moves (FOMO protection). Book partial profits.' };
      default:
        return { label: 'NEUTRAL', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', advice: 'Evaluate individual stock fundamentals.' };
    }
  };

  const badge = getStatusBadge();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#0f172a]/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden backdrop-blur-sm"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">PSX Fear & Greed Mood Meter</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Calculated from PSX trading volume, index momentum & market breadth</p>
        </div>

        <motion.span 
          key={status}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color} tracking-wide shadow-sm`}
        >
          {badge.label}
        </motion.span>
      </div>

      {/* Meter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-rose-400">0 (Extreme Fear)</span>
          <motion.span 
            key={score}
            initial={{ scale: 1.2, color: '#10B981' }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="text-emerald-400 font-extrabold text-base"
          >
            {score} / 100
          </motion.span>
          <span className="text-amber-400">100 (Extreme Greed)</span>
        </div>

        {/* Gradient Track */}
        <div className="relative w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
          <div className="w-full h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" />
        </div>

        {/* Needle Marker Indicator */}
        <div className="relative w-full h-4">
          <motion.div 
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
            initial={{ left: '50%' }}
            animate={{ left: `${Math.min(98, Math.max(2, score))}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-white" />
            <div className="w-2 h-2 rounded-full bg-white shadow-lg shadow-white/80" />
          </motion.div>
        </div>
      </div>

      {/* AI Smart Advice Footnote */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-emerald-400">Halal Strategy Guide: </span>
          <span>{badge.advice}</span>
        </div>
      </div>
    </motion.div>
  );
};
