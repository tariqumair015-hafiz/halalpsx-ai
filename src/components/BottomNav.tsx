import React from 'react';
import { 
  Home, 
  TrendingUp, 
  Briefcase, 
  Calculator, 
  Sparkles 
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'screener' | 'portfolio' | 'calculators';
  onNavigateTab: (tab: 'home' | 'screener' | 'portfolio' | 'calculators') => void;
  onOpenAiDrawer: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigateTab,
  onOpenAiDrawer,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B1012]/95 backdrop-blur-lg border-t border-[#1F383D] px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Home */}
        <button
          onClick={() => onNavigateTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-[#028C8C]'
              : 'text-[#9AA3AF] hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${activeTab === 'home' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
        </button>

        {/* Markets / Screener */}
        <button
          onClick={() => onNavigateTab('screener')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'screener'
              ? 'text-[#028C8C]'
              : 'text-[#9AA3AF] hover:text-white'
          }`}
        >
          <TrendingUp className={`w-5 h-5 transition-transform ${activeTab === 'screener' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-semibold mt-0.5">Markets</span>
        </button>

        {/* AI Co-Pilot Floating Center Pill */}
        <button
          onClick={onOpenAiDrawer}
          className="flex flex-col items-center justify-center -mt-5 cursor-pointer group"
          aria-label="Open AI Co-Pilot"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#028C8C] to-[#00b4b4] flex items-center justify-center shadow-lg shadow-[#028C8C]/40 border-2 border-[#0B1012] group-active:scale-95 transition-transform">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-[#028C8C] mt-0.5">AI Pilot</span>
        </button>

        {/* Portfolio */}
        <button
          onClick={() => onNavigateTab('portfolio')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'portfolio'
              ? 'text-[#028C8C]'
              : 'text-[#9AA3AF] hover:text-white'
          }`}
        >
          <Briefcase className={`w-5 h-5 transition-transform ${activeTab === 'portfolio' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-semibold mt-0.5">Portfolio</span>
        </button>

        {/* Calculators */}
        <button
          onClick={() => onNavigateTab('calculators')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'calculators'
              ? 'text-[#028C8C]'
              : 'text-[#9AA3AF] hover:text-white'
          }`}
        >
          <Calculator className={`w-5 h-5 transition-transform ${activeTab === 'calculators' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-semibold mt-0.5">Tools</span>
        </button>

      </div>
    </div>
  );
};

