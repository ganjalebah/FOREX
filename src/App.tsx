import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CurrencyList, MarketData } from './components/CurrencyList';
import { SignalCard } from './components/SignalCard';
import { ResourcesTab } from './components/ResourcesTab';
import { TradingSignal, generateTradingSignal } from './services/aiSignal';
import { format } from 'date-fns';
import { playSound } from './lib/audio';
import { AlertTriangle, TrendingUp, BarChart3, CandlestickChart, Menu, Bell, Globe, Zap, Sun, Moon, Volume2, VolumeX, Search, Filter, Trash2, RefreshCw, LayoutDashboard, History, ShieldAlert, Cloud, Settings, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LANGUAGES } from './lib/languages';
import { getTranslation } from './lib/i18n';
import { cn } from './lib/utils';
import { getCurrentSession } from './lib/sessions';

import { OnboardingModal } from './components/OnboardingModal';
import { SettingsModal } from './components/SettingsModal';
import { ApiDiagnosticsModal } from './components/ApiDiagnosticsModal';

const MarketStatus = () => {
  const [session, setSession] = useState(getCurrentSession());

  useEffect(() => {
    const timer = setInterval(() => {
      setSession(getCurrentSession());
    }, 30000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:flex items-center gap-2.5 px-4 py-1.5 bg-black/40 border border-white/5 rounded-full backdrop-blur-md shadow-2xl">
      <div className={cn("w-1.5 h-1.5 rounded-full", session.dotColor, "shadow-[0_0_8px_rgba(16,185,129,0.5)]")} />
      <span className={cn("text-[9px] font-bold uppercase tracking-[0.2em]", session.color)}>
        {session.label}
      </span>
    </div>
  );
};

const INITIAL_MARKETS: MarketData[] = [
  { pair: 'XAU/USD', price: 2368.45, change: 12.35, changePercent: 0.52, trend: 'UP', basePrice: 2368.45 },
  { pair: 'EUR/USD', price: 1.16965, change: -0.0008, changePercent: -0.07, trend: 'DOWN', basePrice: 1.16965 },
  { pair: 'GBP/USD', price: 1.26875, change: 0.0010, changePercent: 0.08, trend: 'UP', basePrice: 1.26875 },
  { pair: 'USD/JPY', price: 151.45056, change: 0.0000, changePercent: 0.00, trend: 'SIDEWAYS', basePrice: 151.45056 },
  { pair: 'AUD/USD', price: 0.65393, change: -0.0002, changePercent: -0.03, trend: 'DOWN', basePrice: 0.65393 },
  { pair: 'USD/CAD', price: 1.35240, change: 0.0005, changePercent: 0.04, trend: 'UP', basePrice: 1.35240 },
  { pair: 'USD/CHF', price: 0.90230, change: -0.0001, changePercent: -0.01, trend: 'DOWN', basePrice: 0.90230 },
  { pair: 'NZD/USD', price: 0.59820, change: 0.0002, changePercent: 0.03, trend: 'UP', basePrice: 0.59820 },
  { pair: 'EUR/JPY', price: 164.820, change: 0.015, changePercent: 0.01, trend: 'UP', basePrice: 164.820 },
  { pair: 'GBP/JPY', price: 192.150, change: -0.050, changePercent: -0.02, trend: 'DOWN', basePrice: 192.150 },
];

const MAX_QUOTA = 50;

const LOADING_STEPS: Record<string, string[]> = {
  'English': [
    'Initializing Advanced Neural Analysis...',
    'Analyzing 100+ Quantitative Strategies...',
    'Mapping SMC & Order Block Structures...',
    'Calculating Dynamic ATR & VWAP Volatility...',
    'Synchronizing FVG & Fibonacci Retracements...',
    'Analyzing Institutional Smart Money Liquidity...',
    'Finalizing 80%+ Probability Verification...'
  ],
  'Bahasa Indonesia': [
    'Menginisialisasi Analisis Neural Tingkat Lanjut...',
    'Menganalisis 100+ Strategi Kuantitatif...',
    'Memetakan Struktur SMC & Order Block...',
    'Menghitung Volatilitas ATR & VWAP Dinamis...',
    'Sinkronisasi Tip FVG & Retracement Fibonacci...',
    'Menganalisis Likuiditas Smart Money Institusional...',
    'Finalisasi Verifikasi Probabilitas 80%+...'
  ],
  'Bahasa Melayu': [
    'Menganalisa 100 Strategi Kuantitatif...',
    'Memeriksa struktur SMC (H4/M15)...',
    'Menilai Volatiliti (ATR/VWAP)...',
    'Mengesahkan zon FVG & Fibonacci...',
    'Mendekod Smart Money Institusi...',
    'Menapis Isyarat Kebarangkalian Tinggi...'
  ],
  'Español': [
    'Analizando 100 estrategias cuantitativas...',
    'Comprobando estructuras SMC (H4/M15)...',
    'Evaluando la volatilidad (ATR/VWAP)...',
    'Verificando zonas FVG y Fibonacci...',
    'Decodificando Smart Money Institucional...',
    'Filtrando señales de alta probabilidad...'
  ]
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('app-theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app-sound') !== 'false';
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('app-sound', soundEnabled.toString());
  }, [soundEnabled]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const [brokerOffsets, setBrokerOffsets] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app-broker-offsets');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('app-broker-offsets', JSON.stringify(brokerOffsets));
  }, [brokerOffsets]);

  const [rawMarkets, setRawMarkets] = useState<MarketData[]>(INITIAL_MARKETS.map(m => ({ ...m, history: [] })));
  
  const markets = useMemo(() => {
    return rawMarkets.map(m => {
      const offset = brokerOffsets[m.pair] || 0;
      if (offset === 0) return m;
      
      return {
        ...m,
        price: m.price + offset,
        basePrice: m.basePrice + offset,
        history: m.history?.map(h => ({
          ...h,
          price: h.price + offset,
          open: h.open + offset,
          high: h.high + offset,
          low: h.low + offset,
          close: h.close + offset
        })) || []
      };
    });
  }, [rawMarkets, brokerOffsets]);

  const [selectedPair, setSelectedPair] = useState<string>('XAU/USD');
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [appLanguage, setAppLanguage] = useState<string>('Bahasa Indonesia');
  const [signalHistory, setSignalHistory] = useState<TradingSignal[]>(() => {
    const INITIAL_SIGNALS: TradingSignal[] = [
      {
        id: '1',
        pair: 'XAU/USD',
        action: 'BUY',
        entry: 2350.50,
        takeProfit: 2365.00,
        stopLoss: 2340.00,
        confidence: 88,
        reasoning: 'Strong support bounce confirmed by RSI divergence on H1.',
        detailedAnalysis: 'XAU/USD has tested the 2350 support level for the third time and printed a bullish engulfing pattern. MACD crossover suggests momentum is shifting upwards.',
        votes: { buy: 8, sell: 1, neutral: 1 },
        keyTechniques: ['Support/Resistance', 'RSI Divergence', 'MACD Crossover'],
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        resolvedStatus: 'WIN'
      },
      {
        id: '2',
        pair: 'EUR/USD',
        action: 'SELL',
        entry: 1.0850,
        takeProfit: 1.0810,
        stopLoss: 1.0875,
        confidence: 75,
        reasoning: 'Rejection at major resistance level, stochastic overbought.',
        detailedAnalysis: 'EUR/USD encountered heavy selling pressure at the 1.0850 psychological barrier. Stochastic RSI indicates an overbought condition, favoring a pullback.',
        votes: { buy: 2, sell: 6, neutral: 2 },
        keyTechniques: ['Resistance Test', 'Stochastic Overbought'],
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        resolvedStatus: 'LOSS'
      },
      {
        id: '3',
        pair: 'BTC/USD',
        action: 'BUY',
        entry: 64500.00,
        takeProfit: 67000.00,
        stopLoss: 63000.00,
        confidence: 92,
        reasoning: 'Bull flag breakout accumulation pattern.',
        detailedAnalysis: 'Bitcoin has successfully broken out of a 4-hour bull flag pattern accompanied by above-average volume. On-chain metrics remain neutral-to-bullish.',
        votes: { buy: 9, sell: 0, neutral: 1 },
        keyTechniques: ['Chart Pattern Recognition', 'Volume Analysis'],
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      }
    ];

    const saved = localStorage.getItem('signal_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => ({
            ...s,
            timestamp: new Date(s.timestamp)
          }));
        }
      } catch (e) {
        console.error('Failed to load signal history', e);
      }
    }
    return INITIAL_SIGNALS;
  });
  const [activeTab, setActiveTab] = useState<'analisa' | 'sinyal' | 'statistik' | 'rekomendasi'>('analisa');
  const [isLoadingSignal, setIsLoadingSignal] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [logSearchText, setLogSearchText] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'ACTIVE'>('ALL');
  
  const performanceStats = useMemo(() => {
    const wins = signalHistory.filter(s => s.resolvedStatus === 'WIN').length;
    const losses = signalHistory.filter(s => s.resolvedStatus === 'LOSS').length;
    const total = signalHistory.length;
    const pending = signalHistory.filter(s => !s.resolvedStatus).length;
    
    return {
      total,
      win: wins,
      lose: losses,
      pending,
      winrate: (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0
    };
  }, [signalHistory]);

  const perPairStats = useMemo(() => {
    const stats: Record<string, { win: number, lose: number, pending: number }> = {};
    signalHistory.forEach(sig => {
      if (!stats[sig.pair]) stats[sig.pair] = { win: 0, lose: 0, pending: 0 };
      if (sig.resolvedStatus === 'WIN') stats[sig.pair].win++;
      else if (sig.resolvedStatus === 'LOSS') stats[sig.pair].lose++;
      else stats[sig.pair].pending++;
    });
    return Object.entries(stats).map(([pair, s]) => ({ pair, ...s }));
  }, [signalHistory]);

  const filteredSignalHistory = useMemo(() => {
    return signalHistory.filter(sig => {
      const matchesSearch = sig.pair.toLowerCase().includes(logSearchText.toLowerCase()) || 
        sig.action.toLowerCase().includes(logSearchText.toLowerCase());
      
      const activeStatus = sig.resolvedStatus || (sig.action === 'HOLD' ? 'HOLD' : 'ACTIVE');
      const matchesStatus = logStatusFilter === 'ALL' || activeStatus === logStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [signalHistory, logSearchText, logStatusFilter]);

  useEffect(() => {
    localStorage.setItem('signal_history', JSON.stringify(signalHistory));
  }, [signalHistory]);
  
  const [remainingQuota, setRemainingQuota] = useState<number>(() => {
    const stored = localStorage.getItem('gemini_quota');
    const lastDate = localStorage.getItem('gemini_quota_date');
    const today = new Date().toDateString();
    if (lastDate !== today) {
      localStorage.setItem('gemini_quota_date', today);
      localStorage.setItem('gemini_quota', MAX_QUOTA.toString());
      return MAX_QUOTA;
    }
    return stored ? parseInt(stored, 10) : MAX_QUOTA;
  });

  const [nextResetTimer, setNextResetTimer] = useState<string>('');

  const TWELVEDATA_KEY_RAW = import.meta.env.VITE_TWELVEDATA_API_KEY || '';
  let TWELVEDATA_KEYS = TWELVEDATA_KEY_RAW.split(',').map(k => k.trim()).filter(k => k.length > 5);
  
  // Explicitly reference numbered keys for Vite static replacement
  const extraKeys = [
    import.meta.env.VITE_TWELVEDATA_API_KEY_1,
    import.meta.env.VITE_TWELVEDATA_API_KEY_2,
    import.meta.env.VITE_TWELVEDATA_API_KEY_3,
    import.meta.env.VITE_TWELVEDATA_API_KEY_4,
    import.meta.env.VITE_TWELVEDATA_API_KEY_5,
    import.meta.env.VITE_TWELVEDATA_API_KEY_6,
    import.meta.env.VITE_TWELVEDATA_API_KEY_7,
    import.meta.env.VITE_TWELVEDATA_API_KEY_8,
    import.meta.env.VITE_TWELVEDATA_API_KEY_9,
    import.meta.env.VITE_TWELVEDATA_API_KEY_10,
    import.meta.env.VITE_TWELVEDATA_API_KEY1,
    import.meta.env.VITE_TWELVEDATA_API_KEY2,
    import.meta.env.VITE_TWELVEDATA_API_KEY3,
    import.meta.env.VITE_TWELVEDATA_API_KEY4,
    import.meta.env.VITE_TWELVEDATA_API_KEY5,
    import.meta.env.VITE_TWELVEDATA_API_KEY6,
    import.meta.env.VITE_TWELVEDATA_API_KEY7,
    import.meta.env.VITE_TWELVEDATA_API_KEY8,
    import.meta.env.VITE_TWELVEDATA_API_KEY9
  ];

  extraKeys.forEach(key => {
    if (key && typeof key === 'string' && key.length > 5) {
      if (!TWELVEDATA_KEYS.includes(key)) TWELVEDATA_KEYS.push(...key.split(',').map(k => k.trim()).filter(k => k.length > 5));
    }
  });

  const [apiStatus, setApiStatus] = useState<{
    twelveData: 'OK' | 'LIMITED' | 'ERROR';
    activeKeys: number;
    errorCount: number;
  }>({
    twelveData: 'OK',
    activeKeys: TWELVEDATA_KEYS.length,
    errorCount: 0
  });

  const hasTwelveDataKeys = TWELVEDATA_KEYS.length > 0;
  const isRealDataMode = hasTwelveDataKeys && apiStatus.twelveData === 'OK';
  
  const keyIndexRef = React.useRef(0);

  // Auto-evaluation of active signals
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const today = now.toDateString();
      const lastDate = localStorage.getItem('gemini_quota_date');
      
      if (lastDate !== today) {
        localStorage.setItem('gemini_quota_date', today);
        localStorage.setItem('gemini_quota', MAX_QUOTA.toString());
        setRemainingQuota(MAX_QUOTA);
      }

      if (remainingQuota <= 0) {
        const resetDate = new Date();
        resetDate.setHours(24, 0, 0, 0); // Next midnight
        const diff = resetDate.getTime() - now.getTime();
        
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setNextResetTimer(`${h}:${m}:${s}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingQuota]);

  useEffect(() => {
    setSignalHistory(prev => {
      let updated = false;
      let newWins = 0;
      let newLosses = 0;

      const nextHistory = prev.map(sig => {
        if (sig.resolvedStatus || sig.action === 'HOLD') return sig;

        const currentMarket = markets.find(m => m.pair === sig.pair);
        if (!currentMarket) return sig;

        const p = currentMarket.price;
        let resolved: 'WIN' | 'LOSS' | null = null;

        if (sig.action === 'BUY') {
          if (p >= sig.takeProfit) resolved = 'WIN';
          else if (p <= sig.stopLoss) resolved = 'LOSS';
        } else if (sig.action === 'SELL') {
          if (p <= sig.takeProfit) resolved = 'WIN';
          else if (p >= sig.stopLoss) resolved = 'LOSS';
        }

        if (resolved) {
          updated = true;
          return { ...sig, resolvedStatus: resolved };
        }
        return sig;
      });

      if (updated) {
        return nextHistory;
      }
      
      return prev;
    });
  }, [markets]);

  // Use ref to always get latest pairs without resetting interval
  const pairsRef = useRef(markets.map(m => m.pair).join(','));
  useEffect(() => {
    pairsRef.current = markets.map(m => m.pair).join(',');
  }, [markets]);

  // Market Data Feed Logic (Real or Simulated)
  useEffect(() => {
    if (isRealDataMode) {
      // REAL DATA MODE via TwelveData API
      const fetchRealData = async () => {
        const MAX_RETRIES = 3;
        const INITIAL_BACKOFF = 1000;

        const fetchWithRetry = async (retryCount = 0): Promise<any> => {
          try {
            const currentKey = TWELVEDATA_KEYS[keyIndexRef.current % TWELVEDATA_KEYS.length];
            keyIndexRef.current++;

            const symbols = pairsRef.current;
            const res = await fetch(`https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${currentKey}`);
            
            // Check for transient server errors (5xx)
            if (!res.ok && res.status >= 500 && retryCount < MAX_RETRIES) {
              const delay = INITIAL_BACKOFF * Math.pow(2, retryCount);
              console.warn(`TwelveData server error ${res.status}. Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return fetchWithRetry(retryCount + 1);
            }

            return await res.json();
          } catch (err) {
            if (retryCount < MAX_RETRIES) {
              const delay = INITIAL_BACKOFF * Math.pow(2, retryCount);
              console.warn(`TwelveData fetch failed. Retrying in ${delay}ms...`, err);
              await new Promise(resolve => setTimeout(resolve, delay));
              return fetchWithRetry(retryCount + 1);
            }
            throw err;
          }
        };

        try {
          const symbols = pairsRef.current;
          const data = await fetchWithRetry();
          
          if (data.code === 429 || data.status === 'error') {
            setApiStatus(prev => ({
              ...prev,
              twelveData: 'LIMITED',
              errorCount: prev.errorCount + 1
            }));
            return;
          }

          setApiStatus(prev => ({ ...prev, twelveData: 'OK' }));
          
          let fetchedAtLeastOne = false;
          setRawMarkets(prev => prev.map(market => {
            const quote = symbols.includes(',') ? data[market.pair] : data;
            if (!quote || quote.code === 400 || !quote.close) return market; // Skip if no data
            
            fetchedAtLeastOne = true;
            const currentPrice = parseFloat(quote.close);
            const prevClose = parseFloat(quote.previous_close);
            const change = currentPrice - prevClose;
            const changePercent = parseFloat(quote.percent_change);
            
            const newHistoryPoint = {
              time: format(new Date(), 'HH:mm:ss'),
              price: currentPrice,
              open: parseFloat(quote.open || quote.close),
              high: parseFloat(quote.high || quote.close),
              low: parseFloat(quote.low || quote.close),
              close: currentPrice
            };

            const history = [...(market.history || []), newHistoryPoint].slice(-40);

            return {
              ...market,
              price: currentPrice,
              change: change,
              changePercent: changePercent,
              trend: change > 0 ? 'UP' : change < 0 ? 'DOWN' : 'SIDEWAYS',
              basePrice: currentPrice,
              lastUpdated: new Date(),
              history
            };
          }));
          if (fetchedAtLeastOne) setError(null);
        } catch (err) {
          console.error("Failed to fetch real market data:", err);
          setApiStatus(prev => ({ ...prev, twelveData: 'ERROR', errorCount: prev.errorCount + 1 }));
        }
      };

      fetchRealData(); 
      // If we have 1 key, 45s to be safe. If 10 keys, we can go every 10s easily.
      const intervalMs = TWELVEDATA_KEYS.length >= 5 ? 12000 : (TWELVEDATA_KEYS.length > 1 ? 25000 : 45000);
      const interval = setInterval(fetchRealData, intervalMs); 
      return () => clearInterval(interval);
      
    } else {
      // SIMULATION MODE
      const interval = setInterval(() => {
        setRawMarkets(prev => prev.map(market => {
          // Random slight movement locked around the basePrice to prevent drifting from MT5
          const volatility = market.pair.includes('XAU') ? 0.3 : (market.basePrice > 100 ? 0.005 : 0.00003);
          const move = (Math.random() - 0.5) * volatility;
          const newPrice = market.basePrice + move;
          
          const simulatedBase = market.basePrice - market.change;
          const newChange = newPrice - simulatedBase;
          const changePercent = (newChange / simulatedBase) * 100;
          
          const lastPoint = market.history && market.history.length > 0 ? market.history[market.history.length - 1] : null;
          
          // Simulation for OHLC (Candles usually update over a period, here we just simulate per update)
          const newHistoryPoint = {
            time: format(new Date(), 'HH:mm:ss'),
            price: newPrice,
            open: lastPoint ? lastPoint.close : newPrice - (move * 0.5),
            high: Math.max(newPrice, lastPoint ? lastPoint.close : newPrice) + (Math.abs(move) * 0.1),
            low: Math.min(newPrice, lastPoint ? lastPoint.close : newPrice) - (Math.abs(move) * 0.1),
            close: newPrice
          };

          const history = [...(market.history || []), newHistoryPoint].slice(-40);

          return {
            ...market,
            price: Math.max(0, newPrice),
            change: newChange,
            changePercent,
            trend: newChange > market.change ? 'UP' : newChange < market.change ? 'DOWN' : 'SIDEWAYS',
            lastUpdated: new Date(),
            history
          };
        }));
      }, 2000);

      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRealDataMode]);

  const handleGenerateSignal = async (targetPair?: string) => {
    const hasCustomKey = !!import.meta.env.VITE_MY_GEMINI_API_KEY;
    
    if (remainingQuota <= 0 && !hasCustomKey) {
      setError(`Limit Harian PRO (50/50) telah habis. AI akan direstart dalam ${nextResetTimer}.`);
      return;
    }

    const pairToScan = targetPair || selectedPair;
    if (targetPair) setSelectedPair(targetPair); // Ensures UI selects it
    
    const currentMarket = markets.find(m => m.pair === pairToScan);
    if (!currentMarket) return;

    if (soundEnabled) playSound('scan');
    setIsLoadingSignal(true);
    setLoadingStep(0);
    setError(null);
    
    // Rotate loading messages
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % LOADING_STEPS[appLanguage].length);
    }, 800);

    try {
      let puterOpinion = null;
      if (typeof (window as any).puter !== 'undefined') {
        try {
          const puterResp = await (window as any).puter.ai.chat(
            `Analyze ${currentMarket.pair} ${currentMarket.price.toFixed(currentMarket.pair.includes('JPY') ? 2 : 5)} (${currentMarket.trend}). JSON: {"action":"BUY"|"SELL"|"HOLD","takeProfit":number,"stopLoss":number,"confidence":number,"reasoning":"string","detailedAnalysis":"string","votes":{"buy":number,"sell":number,"neutral":number},"keyTechniques":["string"]}`
          );
          puterOpinion = JSON.parse(puterResp.toString().replace(/```json|```/g, '').trim());
        } catch (e) {
          console.warn("Puter AI failed, falling back to backend only.", e);
        }
      }

      const gKey = (import.meta.env.VITE_MY_GEMINI_API_KEY || '').trim();
      const aKey = (import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim();

      const newSignal = await generateTradingSignal(
        currentMarket.pair,
        currentMarket.price,
        currentMarket.trend,
        appLanguage,
        isRealDataMode ? TWELVEDATA_KEY_RAW : undefined,
        puterOpinion,
        gKey || undefined,
        aKey || undefined
      );

      clearInterval(stepInterval);
      setSignalHistory(prev => [newSignal, ...prev]);
      
      setRemainingQuota(prev => {
        const newQ = Math.max(0, prev - 1);
        localStorage.setItem('gemini_quota', newQ.toString());
        return newQ;
      });
      if (soundEnabled) {
        playSound('success');
      }
    } catch (err: any) {
      console.error(err);
      const errStr = String(err?.message || err).toLowerCase();
      if (soundEnabled) playSound('alert');
      if ((errStr.includes('429') || errStr.includes('resource_exhausted')) && errStr.includes('gemini')) {
         if (!hasCustomKey) {
           setRemainingQuota(0);
           localStorage.setItem('gemini_quota', '0');
           setError(`Quota API utama telah habis. Detail: ${errStr}`);
         } else {
           setError(`Rate limit API Custom Anda tercapai (terlalu banyak request). Tunggu sebentar. Detail: ${errStr}`);
         }
      } else {
         setError(`Gagal menghubungkan ke server AI: ${errStr}`);
      }
    } finally {
      setIsLoadingSignal(false);
    }
  };

  const handleAddPair = (pair: string) => {
    const upperPair = pair.toUpperCase().trim();
    if (!upperPair || markets.find(m => m.pair === upperPair)) return;

    let basePrice = 1.0;
    if (upperPair.includes('JPY')) basePrice = 150.0;
    else if (upperPair.includes('XAU')) basePrice = 4700.0;
    else if (upperPair.includes('BTC')) basePrice = 65000.0;
    else if (upperPair.includes('ETH')) basePrice = 3000.0;
    
    // Add a slight randomization
    basePrice = basePrice + (Math.random() * basePrice * 0.005);
    
    const newMarket: MarketData = {
      pair: upperPair,
      price: basePrice,
      change: 0,
      changePercent: 0,
      trend: 'SIDEWAYS',
      basePrice: basePrice
    };
    
    setRawMarkets(prev => [...prev, newMarket]);
    setSelectedPair(upperPair);
  };

  const handleRemovePair = (pairToRemove: string) => {
    setRawMarkets(prev => {
       const updated = prev.filter(m => m.pair !== pairToRemove);
       // Jika pair yang sedang aktif dihapus, pindahkan ke pair lain yang tersedia
       if (selectedPair === pairToRemove && updated.length > 0) {
         setSelectedPair(updated[0].pair);
       }
       return updated;
    });
  };

  const handleMovePair = (pairToMove: string, direction: 'UP' | 'DOWN') => {
    setRawMarkets(prev => {
      const index = prev.findIndex(m => m.pair === pairToMove);
      if (index < 0) return prev;
      
      const newMarkets = [...prev];
      if (direction === 'UP' && index > 0) {
        [newMarkets[index - 1], newMarkets[index]] = [newMarkets[index], newMarkets[index - 1]];
      } else if (direction === 'DOWN' && index < prev.length - 1) {
        [newMarkets[index + 1], newMarkets[index]] = [newMarkets[index], newMarkets[index + 1]];
      }
      return newMarkets;
    });
  };

  return (
    <div className={cn(
      "h-[100dvh] w-full font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col transition-colors duration-300",
      theme === 'dark' ? "bg-[#0B0E11] text-[#D1D5DB]" : "bg-[#F8FAFC] text-slate-800"
    )}>
      <OnboardingModal theme={theme} />
      <SettingsModal theme={theme} isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} lang={appLanguage} />
      <ApiDiagnosticsModal theme={theme} isOpen={isDiagnosticsOpen} onClose={() => setIsDiagnosticsOpen(false)} lang={appLanguage} />
      {/* Header: Platform Info */}
      <header className={cn(
        "h-16 border-b flex items-center justify-between px-4 shrink-0 transition-colors duration-300 relative z-50",
        theme === 'dark' ? "border-white/5 bg-[#0B0E11]" : "border-slate-200 bg-white"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-white/10">
            <BarChart3 className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className={cn(
              "text-sm font-black tracking-tighter leading-none",
              theme === 'dark' ? "text-white" : "text-slate-900"
            )}>AI FOREX <span className="text-indigo-400">SIGNAL ANALYZER PRO</span></h1>
            <span className={cn("text-[8px] font-bold tracking-widest uppercase mt-0.5", theme === 'dark' ? "text-[#94A3B8]" : "text-slate-500")}>100 Teknik · Real-time · Auto Winrate</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector integrated into header */}
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all",
            theme === 'dark' ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
          )}>
            <Globe size={12} className={theme === 'dark' ? "text-indigo-400" : "text-slate-500"} />
            <select
              value={appLanguage}
              onChange={(e) => setAppLanguage(e.target.value)}
              className={cn(
                "bg-transparent border-none text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer",
                theme === 'dark' ? "text-slate-300" : "text-slate-600"
              )}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.name} className={theme === 'dark' ? "bg-[#0B0E11] text-white" : "bg-white text-slate-900"}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => setIsDiagnosticsOpen(true)}
            className={cn(
              "p-2 rounded-lg transition-all border shadow-sm active:scale-95",
              theme === 'dark' 
                ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white" 
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            )}
            title="API Status / Diagnostics"
          >
            <Activity size={18} />
          </button>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={cn(
              "p-2 rounded-lg transition-all border shadow-sm active:scale-95",
              theme === 'dark' 
                ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white" 
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Settings size={14} />
          </button>

          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg transition-all border shadow-sm active:scale-95",
              theme === 'dark' 
                ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700" 
                : "bg-slate-50 border-slate-200 text-emerald-600 hover:bg-slate-100"
            )}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 transition-all duration-300">
        <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-center gap-3 z-20 text-[10px] font-mono tracking-wide shrink-0 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
            >
              <AlertTriangle size={14} className="shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {activeTab === 'analisa' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Pair Monitoring */}
              <div className={cn(
                "rounded-2xl border overflow-hidden shadow-xl",
                theme === 'dark' ? "bg-[#161921] border-white/5" : "bg-white border-slate-200"
              )}>
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History size={16} className={theme === 'dark' ? "text-slate-400" : "text-slate-500"} />
                    <h3 className={cn("text-xs font-black tracking-widest uppercase", theme === 'dark' ? "text-[#94A3B8]" : "text-slate-400")}>PANTAUAN PASAR</h3>
                  </div>
                  <span className={cn("text-[10px] font-mono", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>{format(new Date(), 'HH:mm:ss')}</span>
                </div>

                <CurrencyList 
                  markets={markets} 
                  selectedPair={selectedPair} 
                  onSelectPair={setSelectedPair} 
                  onAddPair={handleAddPair}
                  onRemovePair={handleRemovePair}
                  onMovePair={handleMovePair}
                  onGenerateSignal={handleGenerateSignal}
                  isLoadingSignal={isLoadingSignal}
                  lang={appLanguage}
                  theme={theme}
                  brokerOffsets={brokerOffsets}
                  onUpdateBrokerOffset={(pair, offset) => setBrokerOffsets(prev => ({...prev, [pair]: offset}))}
                />
              </div>

               {/* Get Signal Result/Loader */}
              {isLoadingSignal ? (
                <div className={cn(
                  "border rounded-2xl overflow-hidden p-8 flex flex-col items-center justify-center min-h-[300px] shadow-2xl relative transition-all duration-500",
                  theme === 'dark' ? "bg-[#161921] border-emerald-500/20" : "bg-emerald-50/30 border-emerald-100"
                )}>
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(16,185,129,0.1)_180deg,transparent_181deg)] animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#161921_75%)]" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-black/40 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <Zap className="text-emerald-500 animate-pulse" size={32} />
                    </div>
                    <h3 className="text-lg font-black text-white tracking-[0.2em] uppercase mb-4 text-center">
                      {getTranslation(appLanguage, 'waitingFeed') || 'Analyzing'} {selectedPair}...
                    </h3>
                    <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="h-full w-1/2 bg-emerald-500"
                      />
                    </div>
                    <p className="text-[9px] text-emerald-500/70 font-mono font-bold uppercase tracking-[0.3em] mt-4 text-center">
                      {LOADING_STEPS[appLanguage]?.[loadingStep] || LOADING_STEPS['English'][loadingStep]}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {signalHistory.length > 0 && signalHistory[0].pair === selectedPair ? (
                    <SignalCard 
                      signal={signalHistory[0]} 
                      lang={appLanguage} 
                      theme={theme}
                    />
                  ) : (
                    <div className={cn(
                      "p-12 border rounded-2xl flex flex-col items-center justify-center text-center opacity-60 shadow-inner",
                      theme === 'dark' ? "bg-black/20 border-white/5 text-slate-300" : "bg-black/10 border-white/5 text-slate-400"
                    )}>
                      <p className="text-[10px] uppercase font-black tracking-widest">{getTranslation(appLanguage, 'systemStandby')}</p>
                      <p className="text-[9px] mt-2 max-w-xs">{getTranslation(appLanguage, 'systemStandbyDesc')}</p>
                    </div>
                  )}

                  <button 
                    onClick={() => handleGenerateSignal(selectedPair)}
                    className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-4 group"
                  >
                    <Zap size={20} className="text-amber-400 group-hover:scale-125 transition-transform" />
                    GENERATE ALPHA SIGNAL
                  </button>
                  
                  <div className={cn("flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-widest opacity-50", theme === 'dark' ? "text-indigo-300" : "text-slate-500")}>
                    <ShieldAlert size={10} />
                    AI Core: Gemini 3.1 Pro · 100+ Quantitative Algos
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sinyal' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between px-2">
                <h2 className={cn("text-base font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                  Riwayat Sinyal ({signalHistory.length})
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    Update: {format(new Date(), 'dd MMM, HH.mm')}
                  </span>
                  <button className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {signalHistory.length > 0 ? (
                  signalHistory.map(sig => (
                    <SignalCard 
                      key={sig.id}
                      signal={sig} 
                      lang={appLanguage} 
                      theme={theme}
                    />
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center gap-3 opacity-30">
                    <History size={48} />
                    <p className="text-xs uppercase font-black tracking-widest">Belum ada riwayat</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'statistik' && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Performance Gauge Card */}
              <div className={cn(
                "p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden flex flex-col items-center",
                theme === 'dark' ? "bg-[#161921] border-white/10" : "bg-white border-slate-200"
              )}>
                <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="84"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className={theme === 'dark' ? "text-white/5" : "text-slate-100"}
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="84"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 84}
                      strokeDashoffset={2 * Math.PI * 84 * (1 - performanceStats.winrate / 100)}
                      strokeLinecap="round"
                      className="text-indigo-500 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-5xl font-black tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>
                      {performanceStats.winrate}<span className="text-2xl ml-0.5 opacity-40">%</span>
                    </span>
                    <span className={cn("text-[10px] font-extrabold uppercase tracking-[0.3em] mt-1", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>WINRATE</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                  {[
                    { label: 'TOTAL', val: performanceStats.total, color: 'text-white' },
                    { label: 'WIN', val: performanceStats.win, color: 'text-emerald-500' },
                    { label: 'LOSE', val: performanceStats.lose, color: 'text-rose-500' },
                    { label: 'PENDING', val: performanceStats.pending, color: 'text-amber-500' }
                  ].map(stat => (
                    <div key={stat.label} className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border bg-black/20",
                      theme === 'dark' ? "border-white/5" : "border-slate-100 bg-slate-50"
                    )}>
                      <span className={cn("text-xl font-black font-mono", stat.color)}>{stat.val}</span>
                      <span className={cn("text-[8px] font-black uppercase tracking-widest mt-1", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per Pair Stats */}
              <div className={cn(
                "p-6 rounded-2xl border shadow-xl flex flex-col gap-4",
                theme === 'dark' ? "bg-[#161921] border-white/5" : "bg-white border-slate-200"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={16} className="text-indigo-500" />
                  <h3 className={cn("text-[11px] font-black uppercase tracking-[0.2em]", theme === 'dark' ? "text-slate-300" : "text-slate-400")}>Statistik Per Pair</h3>
                </div>
                
                <div className="flex flex-col gap-3">
                  {perPairStats.length > 0 ? perPairStats.map(stat => (
                    <div key={stat.pair} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div className="flex flex-col">
                        <span className={cn("text-sm font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>{stat.pair}</span>
                        <div className="flex gap-2 mt-1">
                          <span className={cn("text-[9px] font-bold uppercase", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>{stat.win}W · {stat.lose}L · {stat.pending}P</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-1000" 
                          style={{ width: `${(stat.win + stat.lose) > 0 ? (stat.win / (stat.win + stat.lose)) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )) : (
                    <p className={cn("text-[10px] font-bold uppercase py-4 text-center", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Belum ada data statistik</p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => {
                  if (confirm('Hapus semua riwayat sinyal?')) setSignalHistory([]);
                }}
                className="w-full py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-rose-500/20 active:scale-[0.98] transition-all"
              >
                <Trash2 size={16} /> Hapus Semua Riwayat
              </button>

              <div className={cn(
                "p-4 rounded-xl border flex gap-3 text-[10px] opacity-80",
                theme === 'dark' ? "bg-indigo-500/5 border-indigo-500/10 text-[#94A3B8]" : "bg-slate-50 border-slate-200 text-slate-500"
              )}>
                <Zap size={14} className="shrink-0 text-amber-500" />
                <p>Harga dari <span className="text-indigo-400 font-bold uppercase tracking-widest">TwelveData API</span>. Update tiap 60-90 detik. Selisih broker ±0-5 pips wajar.</p>
              </div>
            </div>
          )}
          {activeTab === 'rekomendasi' && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <ResourcesTab theme={theme} />
            </div>
          )}
          
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 h-20 border-t backdrop-blur-2xl z-[100] transition-all duration-300",
        theme === 'dark' ? "bg-[#0B0E11]/90 border-white/5" : "bg-white/90 border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]"
      )}>
        <div className="max-w-2xl mx-auto h-full flex items-center justify-around px-4">
          {[
            { id: 'analisa', icon: LayoutDashboard, label: 'Analisa' },
            { id: 'sinyal', icon: Bell, label: 'Sinyal', badge: signalHistory.filter(s => !s.resolvedStatus).length },
            { id: 'statistik', icon: BarChart3, label: 'Statistik' },
            { id: 'rekomendasi', icon: Cloud, label: 'Stack' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "relative flex flex-col items-center gap-1.5 p-2 transition-all duration-300 min-w-[72px]",
                activeTab === tab.id 
                  ? "text-indigo-400 scale-110" 
                  : (theme === 'dark' ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-300")
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-colors",
                activeTab === tab.id && "bg-indigo-500/10"
              )}>
                <tab.icon size={22} className={cn(activeTab === tab.id ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "")} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
              
              {tab.badge && tab.badge > 0 && (
                <span className="absolute top-2 right-4 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#0B0E11]">
                  {tab.badge}
                </span>
              )}
              
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute -top-1 w-10 h-0.5 bg-indigo-500 rounded-full shadow-[0_2px_10px_rgba(99,102,241,0.8)]"
                />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
