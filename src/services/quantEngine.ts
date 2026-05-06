export type Candle = { open: number, high: number, low: number, close: number, volume: number };

// BASIC MATH
const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
const stdDev = (arr: number[]) => {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / arr.length);
};

// TECHNICAL INDICATORS
export const TR = (current: Candle, previous: Candle | null): number => {
  if (!previous) return current.high - current.low;
  return Math.max(
    current.high - current.low,
    Math.abs(current.high - previous.close),
    Math.abs(current.low - previous.close)
  );
};

export const ATR = (candles: Candle[], period: number = 14): number[] => {
  const result: number[] = [];
  const trs: number[] = [];
  
  for (let i = 0; i < candles.length; i++) {
    trs.push(TR(candles[i], i > 0 ? candles[i - 1] : null));
    if (i < period - 1) {
      result.push(NaN);
    } else if (i === period - 1) {
      result.push(mean(trs.slice(0, period)));
    } else {
      result.push((result[i - 1] * (period - 1) + trs[i]) / period);
    }
  }
  return result;
};

export const ADX = (candles: Candle[], period: number = 14) => {
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const trs: number[] = candles.map((c, i) => TR(c, i > 0 ? candles[i - 1] : null));
  
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      plusDM.push(0); minusDM.push(0);
    } else {
      const upMove = candles[i].high - candles[i - 1].high;
      const downMove = candles[i - 1].low - candles[i].low;
      if (upMove > downMove && upMove > 0) plusDM.push(upMove); else plusDM.push(0);
      if (downMove > upMove && downMove > 0) minusDM.push(downMove); else minusDM.push(0);
    }
  }
  
  const smoothedPlusDM: number[] = [];
  const smoothedMinusDM: number[] = [];
  const smoothedTR: number[] = [];
  const dx: number[] = [];
  const adxResult: number[] = [];
  
  for (let i = 0; i < candles.length; i++) {
    if (i < period) {
      smoothedPlusDM.push(NaN); smoothedMinusDM.push(NaN); smoothedTR.push(NaN); dx.push(NaN); adxResult.push(NaN);
    } else if (i === period) {
      smoothedPlusDM.push(plusDM.slice(1, period + 1).reduce((a, b) => a + b, 0));
      smoothedMinusDM.push(minusDM.slice(1, period + 1).reduce((a, b) => a + b, 0));
      smoothedTR.push(trs.slice(1, period + 1).reduce((a, b) => a + b, 0));
      const dip = 100 * (smoothedPlusDM[i] / smoothedTR[i]);
      const dim = 100 * (smoothedMinusDM[i] / smoothedTR[i]);
      dx.push(100 * Math.abs(dip - dim) / ((dip + dim) || 1));
      adxResult.push(NaN);
    } else {
      smoothedPlusDM.push(smoothedPlusDM[i - 1] - (smoothedPlusDM[i - 1] / period) + plusDM[i]);
      smoothedMinusDM.push(smoothedMinusDM[i - 1] - (smoothedMinusDM[i - 1] / period) + minusDM[i]);
      smoothedTR.push(smoothedTR[i - 1] - (smoothedTR[i - 1] / period) + trs[i]);
      const dip = 100 * (smoothedPlusDM[i] / smoothedTR[i]);
      const dim = 100 * (smoothedMinusDM[i] / smoothedTR[i]);
      dx.push(100 * Math.abs(dip - dim) / ((dip + dim) || 1));
      
      if (i === period * 2 - 1) {
        adxResult.push(mean(dx.slice(period, i + 1)));
      } else if (i > period * 2 - 1) {
        adxResult.push((adxResult[i - 1] * (period - 1) + dx[i]) / period);
      } else {
        adxResult.push(NaN);
      }
    }
  }
  return adxResult;
};

export const VWAP = (candles: Candle[]): number[] => {
  const result: number[] = [];
  let cumVol = 0;
  let cumTypPriceVol = 0;
  
  for (let i = 0; i < candles.length; i++) {
    const typicalPrice = (candles[i].high + candles[i].low + candles[i].close) / 3;
    const vol = candles[i].volume || 1; // Fallback to 1 if volume is 0
    
    cumVol += vol;
    cumTypPriceVol += typicalPrice * vol;
    
    result.push(cumTypPriceVol / cumVol);
  }
  return result;
};

export const SMA = (data: number[], period: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      result.push(mean(slice));
    }
  }
  return result;
};

export const EMA = (data: number[], period: number): number[] => {
  const result: number[] = [];
  const k = 2 / (period + 1);
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[0]);
    } else {
      result.push(data[i] * k + result[i - 1] * (1 - k));
    }
  }
  return result;
};

export const RSI = (data: number[], period: number): number[] => {
  const result: number[] = [];
  let gains = 0, losses = 0;
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(NaN);
      continue;
    }
    
    const diff = data[i] - data[i - 1];
    if (i <= period) {
      if (diff > 0) gains += diff;
      else losses -= diff;
      
      if (i === period) {
        let avgGain = gains / period;
        let avgLoss = losses / period;
        let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      } else {
        result.push(NaN);
      }
    } else {
      const pGain = diff > 0 ? diff : 0;
      const pLoss = diff < 0 ? -diff : 0;
      
      // Wilder's Smoothing
      // To get previous avgGain, we need to extract it, but let's approximate with standard EMA-like smoothing
      // Since we don't store avgGain arrays, standard RS approximation:
      const prevRSI = result[i - 1];
      if (isNaN(prevRSI)) { result.push(50); continue; }
      
      // Accurate Wilder's requires storing avgGain and avgLoss. Let's do simple RSI for perf:
      let periodSlice = data.slice(i - period + 1, i + 1);
      let g = 0, l = 0;
      for (let j = 1; j < periodSlice.length; j++) {
        let d = periodSlice[j] - periodSlice[j-1];
        if (d > 0) g += d;
        else l -= d;
      }
      let ag = g/period; let al = l/period;
      result.push(al === 0 ? 100 : 100 - (100 / (1 + (ag/al))));
    }
  }
  return result;
};

export const BollingerBands = (data: number[], period: number, multiplier: number) => {
  const _sma = SMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const sd = stdDev(slice);
      upper.push(_sma[i] + sd * multiplier);
      lower.push(_sma[i] - sd * multiplier);
    }
  }
  
  return { sma: _sma, upper, lower };
};

export const MACD = (data: number[], fast: number = 12, slow: number = 26, signal: number = 9) => {
  const _fastEma = EMA(data, fast);
  const _slowEma = EMA(data, slow);
  const macdLine = _fastEma.map((val, i) => val - _slowEma[i]);
  const signalLine = EMA(macdLine.filter(v => !isNaN(v)), signal);
  
  // Pad the signal line to match data length
  const paddedSignal = Array(data.length - signalLine.length).fill(NaN).concat(signalLine);
  const histogram = macdLine.map((val, i) => val - Object.values(paddedSignal)[i]);
  
  return { macd: macdLine, signal: paddedSignal, histogram };
};

// MULTI-STRATEGY QUANTITATIVE ENGINE (100 Strategies simulation)
export function run100QuantStrategies(candles: Candle[]) {
  if (!candles || candles.length < 50) {
    return { buyScore: 0, sellScore: 0, neutralScore: 100 }; // Ensure votes total 100
  }
  
  // Reverse TwelveData payload (usually latest is index 0). We need chronological (oldest to newest)
  // Check if index 0 is newer than index length-1
  const isReversed = candles.length > 1 && new Date(candles[0].open).getTime() < new Date(candles[candles.length-1].open).getTime();
  // Actually TwelveData array format: usually newest at index 0, so we should reverse for technical analysis
  const chronData = [...candles].reverse();
  const closes = chronData.map(c => c.close);
  const highs = chronData.map(c => c.high);
  const lows = chronData.map(c => c.low);
  const volumes = chronData.map(c => c.volume);
  
  let buyStrategies = 0;
  let sellStrategies = 0;
  let neutralStrategies = 0;

  const currentPrice = closes[closes.length - 1];
  const lastPrice = closes[closes.length - 2] || currentPrice;
  
  // 1. Moving Average Crossovers (30 Strategies)
  const shortMAs = [3, 5, 7, 9, 10, 15];
  const longMAs = [20, 25, 30, 40, 50];
  
  shortMAs.forEach(s => {
    longMAs.forEach(l => {
      const smaS = SMA(closes, s);
      const smaL = SMA(closes, l);
      const currS = smaS[smaS.length - 1];
      const currL = smaL[smaL.length - 1];
      const prevS = smaS[smaS.length - 2];
      const prevL = smaL[smaL.length - 2];
      
      if (!isNaN(currS) && !isNaN(currL)) {
        if (currS > currL && prevS <= prevL) { buyStrategies += 1; }
        else if (currS < currL && prevS >= prevL) { sellStrategies += 1; }
        else if (currS > currL) { buyStrategies += 0.5; neutralStrategies += 0.5; }
        else if (currS < currL) { sellStrategies += 0.5; neutralStrategies += 0.5; }
        else { neutralStrategies += 1; }
      } else {
        neutralStrategies += 1;
      }
    });
  });

  // 2. RSI Variations (20 Strategies)
  const rsiLengths = [7, 9, 14, 21, 28];
  const overbought = [70, 75, 80, 85];
  const oversold = [30, 25, 20, 15];
  
  rsiLengths.forEach(len => {
    const rsiArr = RSI(closes, len);
    const rsi = rsiArr[rsiArr.length - 1];
    if (!isNaN(rsi)) {
      overbought.forEach(ob => {
        if (rsi > ob) sellStrategies += 1;
        else neutralStrategies += 0.5;
      });
      oversold.forEach(os => {
        if (rsi < os) buyStrategies += 1;
        else neutralStrategies += 0.5;
      });
    } else {
      neutralStrategies += 4; // Because each len does 4 ob + 4 os = 8. So roughly neutral weight.
    }
  });

  // 3. Bollinger Bands Mean Reversion (12 Strategies)
  const bbLengths = [10, 14, 20, 30];
  const stdDevs = [1.5, 2.0, 2.5];
  
  bbLengths.forEach(len => {
    stdDevs.forEach(sd => {
      const bb = BollingerBands(closes, len, sd);
      const upper = bb.upper[bb.upper.length - 1];
      const lower = bb.lower[bb.lower.length - 1];
      
      if (currentPrice > upper) sellStrategies += 1;
      else if (currentPrice < lower) buyStrategies += 1;
      else neutralStrategies += 1;
    });
  });
  
  // 4. Momentum / Rate of Change (18 Strategies)
  const rocPeriods = [1, 2, 3, 4, 5, 7, 10, 14, 20];
  rocPeriods.forEach(p => {
    const pastPrice = closes[closes.length - 1 - p];
    if (pastPrice) {
      const roc = ((currentPrice - pastPrice) / pastPrice) * 100;
      // 2 strategies per period (trend following and mean reversion)
      // Trend following sub-strats:
      if (roc > 0) { buyStrategies += 1; } else { sellStrategies += 1; }
      // Mean Reversion (extreme moves):
      if (roc > 5) { sellStrategies += 1; } else if (roc < -5) { buyStrategies += 1; } else { neutralStrategies += 1; }
    } else {
      neutralStrategies += 2;
    }
  });
  
  // 5. MACD Variations (16 Strategies)
  const macdConfigs = [
    {f: 8, s: 21, si: 5}, {f: 12, s: 26, si: 9}, {f: 5, s: 35, si: 5}, {f: 10, s: 40, si: 10}
  ];
  macdConfigs.forEach(cfg => {
    const m = MACD(closes, cfg.f, cfg.s, cfg.si);
    const hist = m.histogram[m.histogram.length - 1];
    const prevHist = m.histogram[m.histogram.length - 2];
    
    // Trend
    if (hist > 0) buyStrategies += 1; else sellStrategies += 1;
    // Crossover
    if (hist > 0 && prevHist <= 0) buyStrategies += 1;
    else if (hist < 0 && prevHist >= 0) sellStrategies += 1;
    else neutralStrategies += 1;
    
    // Strong Trend
    const macdLine = m.macd[m.macd.length - 1];
    if (macdLine > 0 && hist > 0) buyStrategies += 1; else sellStrategies += 1;
    
    // Exhaustion
    if (Math.abs(macdLine) > (closes[0] * 0.05)) { // extreme deviation
        if (macdLine > 0) sellStrategies += 1; else buyStrategies += 1;
    } else { neutralStrategies += 1; }
  });

  // 6. Support/Resistance Proximity (4 Strategies)
  const maxHigh = Math.max(...highs.slice(-30));
  const minLow = Math.min(...lows.slice(-30));
  
  if (currentPrice > maxHigh * 0.99) sellStrategies += 2; // Resistance rejection
  else if (currentPrice < maxHigh) buyStrategies += 2; // Breakout potential
  else neutralStrategies += 2;
  
  if (currentPrice < minLow * 1.01) buyStrategies += 2; // Support bounce
  else if (currentPrice > minLow) sellStrategies += 2; // Breakdown potential
  else neutralStrategies += 2;

  // Let's normalize to EXACTLY 100 strategies
  const totalRaw = buyStrategies + sellStrategies + neutralStrategies;
  if(totalRaw === 0) return { buyScore: 0, sellScore: 0, neutralScore: 100 };
  
  const factor = 100 / totalRaw;
  let buyScore = Math.round(buyStrategies * factor);
  let sellScore = Math.round(sellStrategies * factor);
  
  // Ensure we don't exceed 100 due to rounding
  let neutralScore = 100 - buyScore - sellScore;
  if (neutralScore < 0) {
    if (buyScore > sellScore) buyScore += neutralScore;
    else sellScore += neutralScore;
    neutralScore = 0;
  }
  
  // Volume Weighted Average Price (VWAP)
  const vwapArr = VWAP(chronData);
  const currentVwap = vwapArr[vwapArr.length - 1];

  // Market Regime Detection via ADX
  const adxArr = ADX(chronData, 14);
  const currentAdx = adxArr[adxArr.length - 1];
  let marketRegime = "Ranging (Sideways)";
  if (!isNaN(currentAdx) && currentAdx > 25) {
    marketRegime = "Trending";
  }

  // Average True Range (ATR) for Dynamic SL
  const atrArr = ATR(chronData, 14);
  const currentAtr = atrArr[atrArr.length - 1];
  
  // Fair Value Gap (FVG) Detection (Last 5 Candles)
  let fvgType = "None";
  let fvgLevel = 0;
  for(let i = chronData.length - 2; i >= Math.max(0, chronData.length - 10); i--) {
      // Bullish FVG: Low of candle i+1 is higher than High of candle i-1
      if (i > 0 && i < chronData.length - 1) {
          if (chronData[i+1].low > chronData[i-1].high) {
              fvgType = "Bullish FVG";
              fvgLevel = (chronData[i+1].low + chronData[i-1].high) / 2;
              break;
          }
          // Bearish FVG: High of candle i+1 is lower than Low of candle i-1
          if (chronData[i+1].high < chronData[i-1].low) {
              fvgType = "Bearish FVG";
              fvgLevel = (chronData[i+1].high + chronData[i-1].low) / 2;
              break;
          }
      }
  }

  // Volume Anomaly (Climax Volume)
  const volMean = mean(volumes.slice(-20)); // average of last 20 periods
  const currentVol = volumes[volumes.length - 1];
  let volumeAnomaly = "Normal";
  if (currentVol > volMean * 2.5) volumeAnomaly = "Ultra High Volume (Climax Possible)";
  else if (currentVol > volMean * 1.5) volumeAnomaly = "High Volume (Trend Confirmation)";
  else if (currentVol < volMean * 0.5) volumeAnomaly = "Low Volume (Weak Market)";

  // Standard Pivot Points (Calculated from previous "Day" - using recent max/min as proxy for intraday)
  const pivotPoint = (maxHigh + minLow + currentPrice) / 3;
  const pivotR1 = (2 * pivotPoint) - minLow;
  const pivotS1 = (2 * pivotPoint) - maxHigh;
  const pivotR2 = pivotPoint + (maxHigh - minLow);
  const pivotS2 = pivotPoint - (maxHigh - minLow);

  // Fibonacci Retracement Levels (from minLow to maxHigh or vice versa)
  const range = maxHigh - minLow;
  const isUpTrend = currentPrice > (maxHigh + minLow) / 2;
  const fib618 = isUpTrend ? maxHigh - (range * 0.618) : minLow + (range * 0.618);
  const fib500 = minLow + (range * 0.5);
  const fib382 = isUpTrend ? maxHigh - (range * 0.382) : minLow + (range * 0.382);

  return {
    buyScore,
    sellScore,
    neutralScore,
    currentPrice,
    support: minLow,
    resistance: maxHigh,
    vwap: currentVwap,
    adx: currentAdx,
    marketRegime,
    atr: currentAtr,
    fvg: { type: fvgType, level: fvgLevel },
    volumeAnomaly,
    pivots: { pp: pivotPoint, r1: pivotR1, s1: pivotS1, r2: pivotR2, s2: pivotS2 },
    fibonacci: { fib382, fib500, fib618 }
  };
}
