import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import type { ChatMessage, PortfolioHolding, PsxRule, StockQuote } from '../types';
import { askAiCoPilot } from '../services/aiService';
import { 
  Sparkles, 
  X, 
  Send, 
  CheckCircle, 
  Bot, 
  User
} from 'lucide-react';

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: PortfolioHolding[];
  rules: PsxRule[];
  stocks?: StockQuote[];
  onSetRuleFromAi: (rule: {
    symbol: string;
    triggerType?: any;
    buy_target: number;
    sell_target: number;
    stop_loss_target?: number;
    quantity: number;
    sellPercentage?: any;
  }) => void;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  holdings,
  rules,
  onSetRuleFromAi,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Assalam-o-Alaikum ${user.full_name}! Main HalalPSX AI Co-Pilot hoon.\n\nAap Roman Urdu ya English mein mujh se kisi bhi stock ki research pooch sakte hain (*"MLCF kyun ooper gaya"*), ya smart trading trigger set karwa sakte hain:\n• *"MLCF upper lock pe poora maal sell kar do"*\n• *"Day low pe jaye to stop loss laga do"*\n• *"6 pe touch ho to aadha maal (50%) bech dena"*.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiRes = await askAiCoPilot({
      message: textToSend,
      userProfile: user,
      holdings,
      rules,
    });

    setIsLoading(false);

    const botMsg: ChatMessage = {
      id: `msg-b-${Date.now()}`,
      sender: 'assistant',
      text: aiRes.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ruleAction: aiRes.ruleAction,
    };

    setMessages(prev => [...prev, botMsg]);

    if (aiRes.ruleAction && aiRes.ruleAction.action === 'SET_RULE') {
      onSetRuleFromAi({
        symbol: aiRes.ruleAction.symbol,
        triggerType: aiRes.ruleAction.triggerType,
        buy_target: aiRes.ruleAction.buy_target,
        sell_target: aiRes.ruleAction.sell_target,
        stop_loss_target: aiRes.ruleAction.stop_loss_target,
        quantity: aiRes.ruleAction.quantity,
        sellPercentage: aiRes.ruleAction.sellPercentage,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 280 }}
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#090d16] border-l border-slate-800 shadow-2xl flex flex-col justify-between"
    >
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm">HalalPSX AI Co-Pilot</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                Roman Urdu
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Free Cash: Rs {user.budget.toLocaleString()} • {user.broker}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              msg.sender === 'user' ? 'bg-slate-700 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
              msg.sender === 'user' 
                ? 'bg-emerald-600 text-white font-medium rounded-tr-none' 
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-line leading-relaxed">
                {msg.text}
              </div>

              {msg.ruleAction && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] space-y-1">
                  <div className="flex items-center gap-1 font-bold text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>✓ Rule Automatically Added to Watcher!</span>
                  </div>
                  <div>• {msg.ruleAction.quantity} shares of {msg.ruleAction.symbol}</div>
                  <div>• Buy: Rs {msg.ruleAction.buy_target} | Sell: Rs {msg.ruleAction.sell_target}</div>
                </div>
              )}

              <div className={`text-[9px] text-right ${msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-500'}`}>
                {msg.timestamp}
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs animate-pulse">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>HalalPSX AI soch raha hai...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        <button
          onClick={() => handleSend("MLCF upper lock maray to poora maal sell kar do")}
          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] whitespace-nowrap transition-colors border border-amber-500/30"
        >
          🚀 Upper Lock Exit (100%)
        </button>
        <button
          onClick={() => handleSend("Day low pe aye to stop loss laga do poora maal")}
          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] whitespace-nowrap transition-colors border border-rose-500/30"
        >
          🛑 Day Low Stop Loss
        </button>
        <button
          onClick={() => handleSend("MEBL kyun ooper ja raha hai? Fundamental research batao")}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
        >
          🔍 MEBL Research
        </button>
        <button
          onClick={() => handleSend("MLCF 103 pe 9 share buy aur 112 pe sell set kar do")}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
        >
          🎯 Target Rule
        </button>
        <button
          onClick={() => handleSend("Mere budget mein abhi kaunsa Halal stock sab se best hai?")}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
        >
          💡 Best Halal Pick
        </button>
      </div>

      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Roman Urdu ya English mein likhein..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};
