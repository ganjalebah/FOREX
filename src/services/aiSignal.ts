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
  resolvedStatus?: 'WIN' | 'LOSS';
  modelsUsed?: string[];
  modelDetails?: {
    name: string;
    action: string;
    confidence: number;
    keyTechniques: string[];
    reasoning?: string;
  }[];
}

export async function generateTradingSignal(
  pair: string,
  currentPrice: number,
  recentTrend: 'UP' | 'DOWN' | 'SIDEWAYS',
  language: string = 'Bahasa Indonesia',
  twelveDataKeyString?: string,
  puterOpinion?: any,
  customGeminiKey?: string,
  customAnthropicKey?: string
): Promise<TradingSignal> {
  const response = await fetch('/api/generate-signal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pair,
      currentPrice,
      recentTrend,
      language,
      twelveDataKey: twelveDataKeyString,
      puterOpinion,
      customGeminiKey,
      customAnthropicKey
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  const signal = await response.json();
  return {
    ...signal,
    timestamp: new Date(signal.timestamp)
  };
}
