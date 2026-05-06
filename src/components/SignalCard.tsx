import React, { useState } from 'react';
import { ShieldAlert, Crosshair, TrendingUp, TrendingDown, Activity, Clock, Zap, Target, Info, Share2, Calculator, Check, ChevronDown } from 'lucide-react';
import { TradingSignal } from '../services/aiSignal';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { getTranslation } from '../lib/i18n';
import { motion, AnimatePresence } from 'motion/react';

interface SignalCardProps {
  signal: TradingSignal;
  lang: string;
  theme?: 'light' | 'dark';
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, lang, theme = 'dark' }) => {
  const [copied, setCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const isBuy = signal.action === 'BUY';
  const isSell = signal.action === 'SELL';
  
  const statusColor = signal.resolvedStatus === 'WIN' 
    ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
    : signal.resolvedStatus === 'LOSS' 
    ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' 
    : 'text-amber-500 bg-amber-500/10 border-amber-500/20';

  const actionColor = isBuy 
    ? 'text-emerald-500 bg-emerald-500/10' 
    : isSell 
    ? 'text-rose-500 bg-rose-500/10' 
    : 'text-slate-500 bg-slate-500/10';

  const containerBg = theme === 'dark' ? "bg-[#161921]" : "bg-white";
  const borderCol = theme === 'dark' ? "border-white/5" : "border-slate-200";

  const handleCopy = () => {
    const text = `🤖 SIGNAL FOREX\n\n📌 PAIR: ${signal.pair}\n🎯 ACTION: ${signal.action}\n🚀 ENTRY: ${signal.entry}\n✅ TP: ${signal.takeProfit}\n🛑 SL: ${signal.stopLoss}\n\n🧠 AI Confidence: ${signal.confidence}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border p-4 shadow-xl flex flex-col gap-4 transition-all duration-300",
        containerBg,
        borderCol
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
            theme === 'dark' ? "bg-white/5 text-white" : "bg-slate-100 text-slate-900"
          )}>
            {signal.pair.substring(0, 3)}
          </div>
          <div className="flex flex-col">
            <h4 className={cn("text-base font-black tracking-tighter leading-none", theme === 'dark' ? "text-white" : "text-slate-900")}>
              {signal.pair}
            </h4>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>
              Timeframe: H1 · {format(signal.timestamp, 'dd MMM, HH:mm')}
            </span>
            
            {/* Models Participation Badge */}
            {signal.modelsUsed && signal.modelsUsed.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {signal.modelsUsed.map(model => (
                  <span key={model} className="px-1.5 py-0.5 rounded-sm bg-indigo-500/10 border border-indigo-500/20 text-[7px] font-black text-indigo-400 uppercase tracking-tighter">
                    {model}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={cn("px-3 py-1 rounded-lg text-[9px] font-black tracking-widest border uppercase", statusColor)}>
          {signal.resolvedStatus || (signal.action === 'HOLD' ? 'STAY' : 'PENDING')}
        </div>
      </div>

      {/* Action and Confidence */}
      <div className="flex items-center gap-3">
        <div className={cn("px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase flex items-center gap-2", actionColor)}>
          {isBuy ? <TrendingUp size={14} /> : isSell ? <TrendingDown size={14} /> : <Activity size={14} />}
          {signal.action}
        </div>
        <div className={cn(
          "flex-1 flex items-center justify-between px-4 py-2 rounded-xl border",
          theme === 'dark' ? "border-white/5 bg-black/20" : "border-slate-100 bg-slate-50"
        )}>
          <span className={cn("text-[9px] font-black uppercase tracking-widest", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Confidence</span>
          <span className={cn("text-xs font-black font-mono", signal.confidence > 80 ? "text-emerald-500" : "text-amber-500")}>
            {signal.confidence}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={cn(
        "grid grid-cols-2 gap-2 p-3 rounded-xl",
        theme === 'dark' ? "bg-black/20" : "bg-slate-50/50"
      )}>
        {[
          { label: 'ENTRY', val: signal.entry, color: theme === 'dark' ? 'text-white' : 'text-slate-900' },
          { label: 'STOP LOSS', val: signal.stopLoss, color: 'text-rose-500' },
          { label: 'TAKE PROFIT', val: signal.takeProfit, color: 'text-emerald-500' },
          { label: 'R:R RATIO', val: '1:2.5', color: 'text-indigo-400' }
        ].map(item => (
          <div key={item.label} className="flex flex-col gap-1 px-2">
            <span className={cn("text-[8px] font-black uppercase tracking-widest opacity-60", theme === 'dark' ? "text-white" : "text-slate-500")}>{item.label}</span>
            <span className={cn("text-[13px] font-black font-mono tracking-tighter", item.color)}>{item.val}</span>
          </div>
        ))}
      </div>

      {/* Reasoning Collapse */}
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => setShowDetail(!showDetail)}
          className={cn(
            "w-full py-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
            theme === 'dark' ? "text-slate-300 hover:text-indigo-400" : "text-slate-500 hover:text-indigo-400"
          )}
        >
          {showDetail ? 'Hide Details' : 'View Intelligence Report'}
          <ChevronDown size={12} className={cn("transition-transform", showDetail && "rotate-180")} />
        </button>
        
        <AnimatePresence>
          {showDetail && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "p-4 rounded-xl border text-[11px] leading-relaxed flex flex-col gap-4 transition-colors",
                theme === 'dark' ? "border-white/5 bg-white/5 text-slate-300" : "border-slate-100 bg-slate-50 text-slate-600"
              )}>
                <div>
                  <p className="font-bold text-indigo-400 italic mb-2">"{signal.reasoning}"</p>
                  <p>{signal.detailedAnalysis}</p>
                </div>

                {signal.modelDetails && signal.modelDetails.length > 0 && (
                  <div className="mt-2 pt-3 border-t border-white/10 flex flex-col gap-3">
                    <h5 className="text-[10px] uppercase font-bold tracking-widest opacity-70">AI Consensus Breakdown</h5>
                    <div className="flex flex-col gap-3">
                      {signal.modelDetails.map((md, idx) => (
                        <div key={idx} className={cn(
                          "p-3 rounded-lg border",
                          theme === 'dark' ? "bg-black/20 border-white/5" : "bg-white border-slate-100 shadow-sm"
                        )}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-black text-xs text-indigo-400">{md.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[9px] font-bold tracking-wider",
                                md.action === 'BUY' ? "bg-emerald-500/20 text-emerald-500" :
                                md.action === 'SELL' ? "bg-rose-500/20 text-rose-500" :
                                "bg-amber-500/20 text-amber-500"
                              )}>{md.action}</span>
                              <span className="text-[10px] font-mono text-slate-400">{md.confidence}% CONF</span>
                            </div>
                          </div>
                          {md.reasoning && <p className="text-[10px] mb-2 opacity-80 italic">"{md.reasoning}"</p>}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {md.keyTechniques.map((tech, i) => (
                              <span key={i} className={cn(
                                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                                theme === 'dark' ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"
                              )}>
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <div className="flex gap-2">
        <button 
          onClick={handleCopy}
          className={cn(
            "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98]",
            copied ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20" : 
            (theme === 'dark' ? "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")
          )}
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          {copied ? 'Copied' : 'Share Signal'}
        </button>
      </div>
    </motion.div>
  );
};
