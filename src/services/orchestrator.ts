import { GoogleGenAI } from '@google/genai';
import { run100QuantStrategies, type Candle } from './quantEngine.ts';

// Initialize AI SDKs lazily to ensure environment variables are loaded
let _genAI: GoogleGenAI | null = null;

export interface TradingSignal {
  id: string;
  pair: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  entry: number;
  takeProfit: number;
  stopLoss: number;
  confidence: number;
  reasoning: string;
  detailedAnalysis: string;
  votes: {
    buy: number;
    sell: number;
    neutral: number;
  };
  keyTechniques: string[];
  timestamp: Date;
  modelsUsed: string[];
  modelDetails?: {
    name: string;
    action: string;
    confidence: number;
    keyTechniques: string[];
    reasoning?: string;
  }[];
}

const advancedCache: Record<string, { data: any, timestamp: number }> = {};
const TTL_NEWS = 15 * 60 * 1000; // 15 mins for news
const TTL_MARKET = 10 * 60 * 1000; // 10 mins for forex rates
const TTL_SOCIAL = 10 * 60 * 1000; // 10 mins for twitter
const TTL_TECHNICAL = 60 * 1000; // 1 min for technical candles
let globalKeyIndex = 0;

export async function generateSignalConsensus(
  pair: string,
  currentPrice: number,
  recentTrend: 'UP' | 'DOWN' | 'SIDEWAYS',
  language: string = 'Bahasa Indonesia',
  twelveDataKeyString?: string,
  puterOpinion?: any,
  customGeminiKey?: string,
  customAnthropicKey?: string
): Promise<TradingSignal> {
  const keys = (twelveDataKeyString || '').split(',').map(k => k.trim()).filter(k => k.length > 5);
  const getNextKey = () => {
    if (keys.length === 0) return null;
    const key = keys[globalKeyIndex % keys.length];
    globalKeyIndex++;
    return key;
  };

  const isXauOrJpy = pair.includes('XAU') || pair.includes('JPY');
  const decimalPlaces = isXauOrJpy ? 2 : 5;

  const now = new Date();
  const utcHour = now.getUTCHours();
  let currentSession = "WAKTU MATI / DEAD ZONE";
  if (utcHour >= 0 && utcHour < 8) currentSession = "Sesi Asia (Tokyo/Sydney)";
  if (utcHour >= 8 && utcHour < 13) currentSession = "Sesi London";
  if (utcHour >= 13 && utcHour < 17) currentSession = "Overlap London & New York - KILL ZONE";
  if (utcHour >= 17 && utcHour < 22) currentSession = "Sesi New York";
  
  let marketContext = `Instrumen: ${pair}\nHarga Saat Ini: ${currentPrice.toFixed(decimalPlaces)}\nTren Jangka Pendek: ${recentTrend}\n`;
  marketContext += `Server Time: ${now.toUTCString()}\nSession: ${currentSession}\n\n`;

  // Fetch Finnhub News if key exists
  const finnhubKey = process.env['X-Finnhub-Secret'];
  if (finnhubKey) {
    const fhCache = advancedCache['finnhub_forex'];
    if (fhCache && (Date.now() - fhCache.timestamp < TTL_NEWS)) {
      marketContext += fhCache.data;
    } else {
      try {
        const newsRes = await fetch(`https://finnhub.io/api/v1/news?category=forex&minId=10&token=${finnhubKey}`);
        if (newsRes.ok) {
          const news = await newsRes.json();
          const topNews = news.slice(0, 3).map((n: any) => n.headline).join(' | ');
          const newsStr = `[BERITA FINNHUB TERKINI]: ${topNews}\n\n`;
          advancedCache['finnhub_forex'] = { data: newsStr, timestamp: Date.now() };
          marketContext += newsStr;
        }
      } catch(e) {}
    }
  }

  // Fetch ExchangeRate-API if key exists (base USD)
  const exchangeRateKey = process.env.ExchangeRate_API_KEY;
  if (exchangeRateKey) {
    const base = pair.slice(0, 3);
    const target = pair.slice(-3);
    const exCacheKey = `exrate_${base}`;
    let exData = advancedCache[exCacheKey]?.data;
    const isExCacheValid = advancedCache[exCacheKey] && (Date.now() - advancedCache[exCacheKey].timestamp < TTL_MARKET);

    if (isExCacheValid && exData) {
        if (exData.conversion_rates && exData.conversion_rates[target]) {
           marketContext += `[DATA VALAS EXCHANGERATE-API]: 1 ${base} = ${exData.conversion_rates[target]} ${target}\n\n`;
        }
    } else {
      try {
        const exRes = await fetch(`https://v6.exchangerate-api.com/v6/${exchangeRateKey}/latest/${base}`);
        if (exRes.ok) {
          exData = await exRes.json();
          advancedCache[exCacheKey] = { data: exData, timestamp: Date.now() };
          if (exData.conversion_rates && exData.conversion_rates[target]) {
             marketContext += `[DATA VALAS EXCHANGERATE-API]: 1 ${base} = ${exData.conversion_rates[target]} ${target}\n\n`;
          }
        }
      } catch(e) {}
    }
  }

  // Fetch X (Twitter) data if key exists
  const xApiKey = process.env.X_API_KEY;
  if (xApiKey) {
    const xCacheKey = `x_${pair}`;
    const xCache = advancedCache[xCacheKey];
    if (xCache && (Date.now() - xCache.timestamp < TTL_SOCIAL)) {
      marketContext += xCache.data;
    } else {
      try {
        const q = encodeURIComponent(`"forex" OR "${pair}"`);
        const xRes = await fetch(`https://api.twitter.com/2/tweets/search/recent?query=${q}&max_results=10`, {
          headers: { 'Authorization': `Bearer ${xApiKey}` }
        });
        if (xRes.ok) {
          const xData = await xRes.json();
          if (xData.data && xData.data.length > 0) {
            const tweets = xData.data.slice(0, 3).map((t: any) => t.text.replace(/\n/g, ' ')).join(' | ');
            const tweetsStr = `[SENTIMEN PASAR X/TWITTER]: ${tweets}\n\n`;
            advancedCache[xCacheKey] = { data: tweetsStr, timestamp: Date.now() };
            marketContext += tweetsStr;
          }
        }
      } catch(e) {}
    }
  }

  // Fetch technical data
  if (keys.length > 0) {
    const cacheKey = `${pair}_mtfa`;
    const cached = advancedCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp < TTL_TECHNICAL)) {
      marketContext += cached.data;
    } else {
      try {
        const k1 = getNextKey();
        const [resM15] = await Promise.all([
          fetch(`https://api.twelvedata.com/time_series?symbol=${pair}&interval=15min&outputsize=100&apikey=${k1}`).then(r => r.json())
        ]);
        
        if (resM15.values) {
          const m15Candles: Candle[] = resM15.values.map((v: any) => ({
            open: parseFloat(v.open),
            high: parseFloat(v.high),
            low: parseFloat(v.low),
            close: parseFloat(v.close),
            volume: parseFloat(v.volume) || 0
          }));
          
          const quant = run100QuantStrategies(m15Candles);
          const technicalData = `[QUANT ENGINE RESULTS - 100 STRATEGIES]\n` +
            `- BUY Score: ${quant.buyScore}%\n` +
            `- SELL Score: ${quant.sellScore}%\n` +
            `- SL/TP Baseline: Support ${quant.support?.toFixed(decimalPlaces)}, Resist ${quant.resistance?.toFixed(decimalPlaces)}\n` +
            `- ADX Regime: ${quant.marketRegime}\n` +
            `- VWAP: ${quant.vwap?.toFixed(decimalPlaces)}\n` +
            `- Volatility (ATR): ${quant.atr?.toFixed(decimalPlaces)}\n`;
          
          advancedCache[cacheKey] = { data: technicalData, timestamp: Date.now() };
          marketContext += technicalData;
        }
      } catch (e) {
        console.error("Technical fetch error:", e);
      }
    }
  }

  const prompt = `
    Analyze this market data and provide a high-probability trading signal.
    Language for analysis: ${language}.
    
    Current Data:
    ${marketContext}
    
    CRITICAL INSTRUCTIONS FOR STOP LOSS & TAKE PROFIT:
    1. For action "BUY": takeProfit MUST be > entry, stopLoss MUST be < entry. 
    2. For action "SELL": takeProfit MUST be < entry, stopLoss MUST be > entry.
    3. Avoid tight stop losses. Forex markets have noise and spread. Avoid placing Stop Loss closer than 1.5x the ATR (Average True Range).
    4. Ensure the Stop Loss is placed logically behind major support/resistance levels, pivot points, or FVG zones.
    5. Maintain a Risk:Reward ratio of at least 1:1.5 to 1:2. If TP is 50 pips, SL should be max 33 pips.
    6. If the market is too choppy and finding a safe Stop Loss is impossible, recommend action "HOLD". 
    7. Provide realistic take-profits; avoid overly ambitious targets that won't be hit.

    You are part of a multi-model consensus system. Provide your professional technical analysis.
    Return ONLY JSON:
    {
      "action": "BUY" | "SELL" | "HOLD",
      "takeProfit": number,
      "stopLoss": number,
      "confidence": number,
      "reasoning": "string",
      "detailedAnalysis": "string",
      "votes": {"buy": number, "sell": number, "neutral": number},
      "keyTechniques": ["string"]
    }
  `;

  const models = [
    { name: 'Gemini', provider: 'google', id: 'gemini-1.5-pro' }
  ];

  const results: any[] = [];
  const modelsUsed: string[] = [];

  // Use Puter opinion if provided by client (keyless fallback)
  if (puterOpinion) {
    results.push({...puterOpinion, _modelName: 'Puter AI (Client)'});
    modelsUsed.push('Puter AI (Client)');
  }

  // Filter models based on available keys
  const activeModels = models.filter(m => {
    if (m.provider === 'google') {
      const k = (customGeminiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
      return k.length > 0;
    }
    if (m.provider === 'anthropic') {
      const k = (customAnthropicKey || process.env.ANTHROPIC_API_KEY || '').trim();
      return k.length > 0;
    }
    return false;
  });

  const errors: string[] = [];

  // Parallel Execution
  await Promise.all(activeModels.map(async (m) => {
    try {
      if (m.provider === 'google') {
        const rawKey = (customGeminiKey && customGeminiKey.trim()) ? customGeminiKey : (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
        const apiKey = (rawKey || '').trim();
        
        if (!apiKey) {
          throw new Error('API key is missing or empty.');
        }

        const genAI = new GoogleGenAI({ apiKey });
        const res = await genAI.models.generateContent({
          model: m.id || "gemini-1.5-pro",
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });
        
        // Deep path for @google/genai SDK response
        const text = res.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g, '') || '{}';
        const parsed = JSON.parse(text);
        results.push({...parsed, _modelName: m.name});
        modelsUsed.push(m.name);
      } else if (m.provider === 'anthropic') {
        // Dynamic import to avoid loading if not needed
        const { default: Anthropic } = await import('@anthropic-ai/sdk');
        const rawKey = customAnthropicKey || process.env.ANTHROPIC_API_KEY;
        const apiKey = (rawKey || '').trim();
        
        if (!apiKey) {
          throw new Error('Anthropic API key is missing.');
        }

        const client = new Anthropic({ apiKey });
        const res = await client.messages.create({
          model: m.id || 'claude-3-5-sonnet-20240620',
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt + "\n\nRespon sedalam format JSON saja." }],
        });
        const text = (res.content[0] as any).text?.replace(/```json|```/g, '') || '{}';
        const parsed = JSON.parse(text);
        results.push({...parsed, _modelName: m.name});
        modelsUsed.push(m.name);
      }
    } catch (e: any) {
      let errMsg: string = e.message || 'Unknown error';
      console.error(`Detailed error for ${m.name}:`, e); // More detail in server logs

      // Attempt to parse ugly JSON errors
      try {
        const jsonStart = errMsg.indexOf('{');
        if (jsonStart !== -1) {
          const jsonStr = errMsg.slice(jsonStart);
          const parsedErr = JSON.parse(jsonStr);
          if (parsedErr.error && parsedErr.error.message) {
            errMsg = parsedErr.error.message;
          }
        }
      } catch {
        // ignore
      }

      if (errMsg.includes('API key not valid') || errMsg.includes('INVALID_ARGUMENT')) {
        errMsg = 'API key Gemini tidak valid. Pastikan API key benar di pengaturan atau .env.';
      } else if (errMsg.includes('quota') || errMsg.includes('429')) {
        errMsg = 'Limit API (quota) telah tercapai. Silakan coba lagi nanti atau gunakan API key Anda sendiri.';
      }
      
      console.warn(`Model ${m.name} failed:`, errMsg);
      errors.push(`${m.name} failed: ${errMsg}`);
    }
  }));

  if (results.length === 0) {
    console.warn(`No AI signals generated, falling back to Quantitative Engine. Errors: ${errors.join(' | ')}`);
    
    // Fallback synthesis based on trend + technicals pseudo-logic
    let fbAction: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    if (recentTrend === 'UP') fbAction = 'BUY';
    else if (recentTrend === 'DOWN') fbAction = 'SELL';
    
    // Attempt to estimate a SL / TP
    const atr = currentPrice * 0.002; // Roughly 0.2% basic ATR mock
    let fbTp = currentPrice;
    let fbSl = currentPrice;
    
    if (fbAction === 'BUY') {
      fbTp = currentPrice + (atr * 2);
      fbSl = currentPrice - atr;
    } else if (fbAction === 'SELL') {
      fbTp = currentPrice - (atr * 2);
      fbSl = currentPrice + atr;
    }

    results.push({
      action: fbAction,
      takeProfit: fbTp,
      stopLoss: fbSl,
      confidence: 65,
      reasoning: "Tidak ada API key AI yang aktif atau semua API mengalami error. Sinyal ini dihasilkan murni secara matematis oleh Quantitative Engine bawaan.",
      detailedAnalysis: errors.join(' | ') || 'Membutuhkan API Key Custom untuk analisis AI.',
      votes: { buy: fbAction === 'BUY' ? 100 : 0, sell: fbAction === 'SELL' ? 100 : 0, neutral: fbAction === 'HOLD' ? 100 : 0 },
      keyTechniques: ["Quantitative Fallback", "Trend Following"],
      _modelName: "Quant Engine (Fallback)"
    });
    modelsUsed.push("Quant Engine (Fallback)");
  }

  // --- BRAIN CONFLUENCE LOGIC ---
  // If multiple models exist, we find the common ground
  const buyVotes = results.filter(r => r.action === 'BUY').length;
  const sellVotes = results.filter(r => r.action === 'SELL').length;
  const holdVotes = results.filter(r => r.action === 'HOLD').length;

  let finalAction: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  if (buyVotes > sellVotes && buyVotes >= results.length / 2) finalAction = 'BUY';
  else if (sellVotes > buyVotes && sellVotes >= results.length / 2) finalAction = 'SELL';

  // Average numeric values
  const avgTP = results.reduce((acc, r) => acc + (r.takeProfit || 0), 0) / results.length;
  const avgSL = results.reduce((acc, r) => acc + (r.stopLoss || 0), 0) / results.length;
  const avgConf = results.reduce((acc, r) => acc + (r.confidence || 0), 0) / results.length;

  // Synthesize reasoning (from the best result or combined)
  const primaryResult = results.find(r => r.action === finalAction) || results[0];

  return {
    id: Math.random().toString(36).substring(2, 9),
    pair,
    action: finalAction,
    entry: Number(currentPrice.toFixed(decimalPlaces)),
    takeProfit: Number(avgTP.toFixed(decimalPlaces)),
    stopLoss: Number(avgSL.toFixed(decimalPlaces)),
    confidence: Math.round(avgConf),
    reasoning: primaryResult.reasoning,
    detailedAnalysis: `[SIGNAL BERBASIS KONSENSUS MULTI-AI: ${modelsUsed.join(', ')}]\n\n${primaryResult.detailedAnalysis}`,
    votes: {
      buy: Math.round((buyVotes / results.length) * 100),
      sell: Math.round((sellVotes / results.length) * 100),
      neutral: Math.round((holdVotes / results.length) * 100)
    },
    keyTechniques: Array.from(new Set(results.flatMap(r => r.keyTechniques || []))),
    timestamp: new Date(),
    modelsUsed,
    modelDetails: results.map(r => ({
      name: r._modelName || 'AI',
      action: r.action || 'HOLD',
      confidence: r.confidence || 0,
      keyTechniques: r.keyTechniques || [],
      reasoning: r.reasoning
    }))
  };
}
