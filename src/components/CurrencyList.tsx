import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, X, Plus, ChevronUp, ChevronDown, Crosshair, Info, Settings2, Check, RotateCcw, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { getTranslation } from '../lib/i18n';

export interface HistoryPoint {
  time: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MarketData {
  pair: string;
  price: number;
  change: number;
  changePercent: number;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  basePrice: number;
  lastUpdated?: Date;
  history?: HistoryPoint[];
}

interface CurrencyListProps {
  markets: MarketData[];
  selectedPair: string;
  onSelectPair: (pair: string) => void;
  onAddPair: (pair: string) => void;
  onRemovePair: (pair: string) => void;
  onMovePair: (pair: string, direction: 'UP' | 'DOWN') => void;
  onGenerateSignal: (pair: string) => void;
  isLoadingSignal: boolean;
  lang: string;
  theme?: 'light' | 'dark';
  brokerOffsets: Record<string, number>;
  onUpdateBrokerOffset: (pair: string, offset: number) => void;
}

const FOREX_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD',
  'EUR/JPY', 'GBP/JPY', 'EUR/GBP', 'EUR/AUD', 'GBP/AUD', 'AUD/JPY', 'CAD/JPY',
  'XAU/USD', 'XAG/USD', 'BTC/USD', 'ETH/USD'
];

export const CurrencyList: React.FC<CurrencyListProps> = ({ 
  markets, selectedPair, onSelectPair, onAddPair, onRemovePair, onMovePair, onGenerateSignal, isLoadingSignal, lang, theme = 'dark', brokerOffsets, onUpdateBrokerOffset
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calibratingPair, setCalibratingPair] = useState<string | null>(null);
  const [calibratingPrice, setCalibratingPrice] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={cn(
      "flex flex-col h-full min-h-0 transition-colors duration-300",
      theme === 'dark' ? "bg-[#0B0E11]" : "bg-white"
    )}>
      <div className={cn(
        "p-4 border-b flex justify-between items-center transition-colors duration-300",
        theme === 'dark' ? "border-white/5 bg-[#0B0E11]" : "border-slate-100 bg-slate-50"
      )}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 group relative">
            <h2 className={cn("text-[11px] font-bold uppercase tracking-wider", theme === 'dark' ? "text-slate-300" : "text-slate-500")}>{getTranslation(lang, 'marketWatch')}</h2>
            <Info size={12} className={theme === 'dark' ? "text-slate-400" : "text-slate-400"} />
            <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 p-3 rounded shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <p className="text-[9.5px] text-slate-300 leading-relaxed font-sans normal-case">
                <strong className="text-emerald-400 block mb-1">INFO HARGA MARKET:</strong>
                Harga yang ditampilkan ditarik dari Public API Server (TwelveData) yang merupakan agregat dari berbagai market global. Wajar jika terdapat selisih spread/pips (sekitar 0.0001 - 0.001) dibandingkan dengan broker MT4/MT5 pribadi Anda yang memiliki Liquidity Provider sendiri. Jika belum memasukkan API Key, sistem akan menggunakan Data Mode Simulasi.
              </p>
            </div>
          </div>
          <span className={cn("text-[11px] font-mono tracking-wider font-black", theme === 'dark' ? "text-slate-300" : "text-slate-400")}>
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
        
        {/* Main Scan Button */}
        <button
          onClick={() => onGenerateSignal(selectedPair)}
          disabled={isLoadingSignal}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
            isLoadingSignal 
              ? "bg-emerald-500/10 text-emerald-500/30 cursor-not-allowed border border-emerald-500/10" 
              : "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          )}
          title={getTranslation(lang, 'executeScan')}
        >
          <Zap size={13} className={cn(isLoadingSignal && "animate-pulse")} />
          <span className="text-[10px] font-black tracking-[0.1em] uppercase">{getTranslation(lang, 'executeScan')}</span>
        </button>
      </div>
      <div className={cn(
        "overflow-y-auto min-h-0 h-[150px] md:h-auto md:flex-1 border-b md:border-none scrollbar-thin transition-colors duration-300",
        theme === 'dark' ? "border-white/5" : "border-slate-200"
      )}>
        <div className="space-y-px">
        {markets.map((market, index) => {
          const isSelected = selectedPair === market.pair;
          const isUp = market.change >= 0;
          const isFirst = index === 0;
          const isLast = index === markets.length - 1;
          
          return (
            <div key={market.pair} className={cn(
              "relative group flex flex-col border-b transition-colors duration-300",
              theme === 'dark' ? "border-slate-800/50" : "border-slate-100"
            )}>
              <div
                onClick={() => onSelectPair(market.pair)}
                className={cn(
                  "w-full px-3 py-2 flex justify-between items-center cursor-pointer transition-colors duration-100",
                  isSelected 
                    ? (theme === 'dark' ? "bg-slate-800/80 border-l-2 border-emerald-500" : "bg-slate-100 border-l-2 border-emerald-500")
                    : (theme === 'dark' ? "hover:bg-slate-800/30 border-l-2 border-transparent" : "hover:bg-slate-50 border-l-2 border-transparent")
                )}
              >
                <div className="flex flex-col flex-1 pl-1">
                  <span className={cn(
                    "text-[10px] md:text-[11px] font-bold uppercase text-left tracking-tight",
                    isSelected ? (theme === 'dark' ? "text-white" : "text-slate-900") : (theme === 'dark' ? "text-slate-300" : "text-slate-400")
                  )}>
                    {market.pair}
                  </span>
                  
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className={cn(
                      "text-[9px] md:text-[10.5px] font-mono",
                      isSelected ? (theme === 'dark' ? "text-slate-200" : "text-slate-700") : (theme === 'dark' ? "text-slate-400" : "text-slate-500")
                    )}>
                      {market.price.toFixed(market.pair.includes('JPY') || market.pair.includes('XAU') ? 3 : 5)}
                    </p>
                    <div className={cn(
                      "text-[8px] md:text-[8.5px] font-mono font-bold flex items-center px-1 rounded-sm",
                      isUp ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                    )}>
                      {isUp ? "+" : ""}{market.changePercent.toFixed(2)}%
                    </div>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setCalibratingPair(market.pair); 
                        setCalibratingPrice(''); 
                      }}
                      className={cn(
                        "flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-sm transition-colors",
                        brokerOffsets[market.pair] 
                          ? "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20" 
                          : (theme === 'dark' ? "bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700" : "bg-slate-200 text-slate-600 hover:text-cyan-600 hover:bg-slate-300")
                      )}
                      title="Sesuaikan selisih Harga dari MT5"
                    >
                      <Settings2 size={8} />
                      {brokerOffsets[market.pair] ? (
                        <span className="font-mono">{brokerOffsets[market.pair] > 0 ? '+' : ''}{brokerOffsets[market.pair]}</span>
                      ) : "Edit Harga"}
                    </button>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onMovePair(market.pair, 'UP'); }} 
                      disabled={isFirst}
                      className={cn(
                        "p-1 rounded transition-colors",
                        theme === 'dark' ? "bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700" : "bg-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-slate-300",
                        "disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-slate-800"
                      )}
                      title="Pindah ke Atas"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onMovePair(market.pair, 'DOWN'); }} 
                      disabled={isLast}
                      className={cn(
                        "p-1 rounded transition-colors",
                        theme === 'dark' ? "bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700" : "bg-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-slate-300",
                        "disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-slate-800"
                      )}
                      title="Pindah ke Bawah"
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemovePair(market.pair); }} 
                      className={cn(
                        "p-1 rounded transition-colors ml-1",
                        theme === 'dark' ? "bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-900/50" : "bg-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-100"
                      )}
                      title="Hapus Pair"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {calibratingPair === market.pair ? (
                <div className={cn(
                  "px-3 py-2 border-b text-[10px] flex items-center gap-2",
                  theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
                )}>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className={cn("font-bold uppercase", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Harga MT5 ({market.pair})</span>
                    <input 
                      type="number"
                      step={market.pair.includes('JPY') || market.pair.includes('XAU') ? "0.001" : "0.00001"}
                      value={calibratingPrice}
                      onChange={(e) => setCalibratingPrice(e.target.value)}
                      placeholder={`Contoh: ${market.price.toFixed(market.pair.includes('JPY') || market.pair.includes('XAU') ? 3 : 5)}`}
                      className={cn(
                        "w-full px-2 py-1 rounded font-mono border focus:outline-none focus:border-cyan-500",
                        theme === 'dark' ? "bg-slate-800 text-white border-slate-700" : "bg-white text-slate-900 border-slate-300"
                      )}
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-1 shrink-0 mt-3">
                    <button 
                      onClick={() => {
                        const mt5Price = parseFloat(calibratingPrice);
                        if (!isNaN(mt5Price)) {
                          const currentOffset = brokerOffsets[market.pair] || 0;
                          const rawPrice = market.price - currentOffset;
                          const newOffset = Number((mt5Price - rawPrice).toFixed(market.pair.includes('JPY') || market.pair.includes('XAU') ? 3 : 5));
                          onUpdateBrokerOffset(market.pair, newOffset);
                        }
                        setCalibratingPair(null);
                      }}
                      className="bg-cyan-500 hover:bg-cyan-400 text-white px-2 py-1 rounded flex items-center gap-1 font-bold"
                    >
                      <Check size={12} /> Set
                    </button>
                    <button 
                      onClick={() => {
                        if (brokerOffsets[market.pair]) {
                          onUpdateBrokerOffset(market.pair, 0);
                        }
                        setCalibratingPair(null);
                      }}
                      className={cn(
                        "px-2 py-1 rounded flex items-center justify-center font-bold",
                        theme === 'dark' ? "bg-slate-800 hover:bg-slate-700 text-slate-400" : "bg-slate-200 hover:bg-slate-300 text-slate-600"
                      )}
                    >
                      Batal/Reset
                    </button>
                  </div>
                </div>
              ) : null}
              
            </div>
          );
        })}
        </div>
      </div>
      <div className={cn(
        "p-4 border-t transition-colors duration-300 max-h-[300px] flex flex-col",
        theme === 'dark' ? "border-slate-800" : "border-slate-100"
      )}>
         {isAdding ? (
           <div className="flex flex-col gap-3 min-h-0">
             <div className="flex items-center gap-2">
               <input 
                 autoFocus 
                 value={searchFilter} 
                 onChange={e => setSearchFilter(e.target.value)} 
                 placeholder={getTranslation(lang, 'searchPlaceholder')}
                 className={cn(
                   "flex-1 px-3 py-1.5 rounded text-[11px] font-mono border outline-none focus:border-emerald-500 uppercase transition-colors",
                   theme === 'dark' ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-200"
                 )}
               />
               <button 
                 onClick={() => setIsAdding(false)} 
                 className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 p-1.5 rounded transition-colors"
                >
                 <X size={14} />
               </button>
             </div>
             
             <div className="grid grid-cols-2 gap-1.5 overflow-y-auto scrollbar-thin pr-1">
               {FOREX_PAIRS
                 .filter(p => p.toLowerCase().includes(searchFilter.toLowerCase()) && !markets.find(m => m.pair === p))
                 .map(pair => (
                   <button
                     key={pair}
                     onClick={() => {
                        onAddPair(pair);
                        setSearchFilter('');
                        setIsAdding(false);
                     }}
                     className={cn(
                       "px-2 py-2 text-[10px] font-mono font-bold rounded border transition-all text-left truncate",
                       theme === 'dark' 
                         ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-emerald-500" 
                         : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-emerald-500"
                     )}
                   >
                     {pair}
                   </button>
                 ))
               }
               {FOREX_PAIRS.filter(p => p.toLowerCase().includes(searchFilter.toLowerCase()) && !markets.find(m => m.pair === p)).length === 0 && (
                 <p className="col-span-2 text-center py-4 text-[10px] text-slate-500">Semua pair sudah ditambahkan atau tidak ditemukan.</p>
               )}
             </div>
           </div>
         ) : (
           <button 
             onClick={() => setIsAdding(true)} 
             className={cn(
               "w-full flex items-center justify-center gap-2 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-colors",
               theme === 'dark' ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
             )}
            >
             <Plus size={14} /> {getTranslation(lang, 'addPairs')}
           </button>
         )}
      </div>
    </div>
  );
};
