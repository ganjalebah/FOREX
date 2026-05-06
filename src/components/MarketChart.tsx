import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from 'recharts';
import { HistoryPoint } from './CurrencyList';
import { cn } from '../lib/utils';

interface MarketChartProps {
  data: HistoryPoint[];
  pair: string;
  theme?: 'light' | 'dark';
  chartType: 'line' | 'candle';
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={cn(
        "p-2 border rounded shadow-lg text-[10px] font-mono",
        theme === 'dark' ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600"
      )}>
        <p className="font-bold mb-1">{label}</p>
        <p className="text-emerald-400">Price: {payload[0].value.toFixed(5)}</p>
        {payload[0].payload.open && (
          <div className="mt-1 border-t border-slate-800 pt-1 space-y-0.5">
            <p>O: {payload[0].payload.open.toFixed(5)}</p>
            <p>H: {payload[0].payload.high.toFixed(5)}</p>
            <p>L: {payload[0].payload.low.toFixed(5)}</p>
            <p>C: {payload[0].payload.close.toFixed(5)}</p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Simplified Candlestick using Bar chart
const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, open, close } = props;
  const isUp = close >= open;
  const color = isUp ? '#10b981' : '#f43f5e';
  
  // y is the top of the bar (min of open/close)
  // height is the absolute difference
  
  const ratio = 1 ; // Just for safety
  
  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2}
        y1={y - (high - Math.max(open, close)) * ratio}
        x2={x + width / 2}
        y2={y + height + (Math.min(open, close) - low) * ratio}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={Math.max(1, height)}
        fill={color}
      />
    </g>
  );
};

export const MarketChart: React.FC<MarketChartProps> = ({ data, pair, theme = 'dark', chartType }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-[10px] uppercase tracking-widest font-mono p-12 text-center">
        Waiting for more data points to generate chart...
      </div>
    );
  }

  // Calculate domain for Y axis to zoom in
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices, ...data.map(d => d.low || d.price));
  const maxPrice = Math.max(...prices, ...data.map(d => d.high || d.price));
  const range = maxPrice - minPrice;
  const padding = range === 0 ? 1 : range * 0.1;

  const chartTheme = {
    grid: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    text: theme === 'dark' ? '#64748b' : '#94a3b8',
    line: '#10b981'
  };

  const candleData = data.map(d => ({
    ...d,
    // For candlestick, Bar chart can take a Range [low, high]
    // We'll use two Bars: one for the body [open, close] and one for the wick [low, high]
    body: [d.open, d.close],
    wick: [d.low, d.high]
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'line' ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
            <XAxis dataKey="time" hide={true} />
            <YAxis 
              domain={[minPrice - padding, maxPrice + padding]} 
              tick={{ fontSize: 9, fill: chartTheme.text, fontFamily: 'monospace' }}
              orientation="right"
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(pair.includes('JPY') || pair.includes('XAU') ? 2 : 4)}
            />
            <Tooltip content={<CustomTooltip theme={theme} />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        ) : (
          <BarChart data={candleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={-2}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
            <XAxis dataKey="time" hide={true} />
            <YAxis 
              domain={[minPrice - padding, maxPrice + padding]} 
              tick={{ fontSize: 9, fill: chartTheme.text, fontFamily: 'monospace' }}
              orientation="right"
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(pair.includes('JPY') || pair.includes('XAU') ? 2 : 4)}
            />
            <Tooltip content={<CustomTooltip theme={theme} />} />
            {/* Wick */}
            <Bar dataKey="wick" isAnimationActive={false} barSize={1}>
              {candleData.map((entry, index) => (
                <Cell key={`wick-${index}`} fill={entry.close >= entry.open ? '#10b981' : '#f43f5e'} />
              ))}
            </Bar>
            {/* Body */}
            <Bar dataKey="body" isAnimationActive={false} barSize={8}>
              {candleData.map((entry, index) => (
                <Cell key={`body-${index}`} fill={entry.close >= entry.open ? '#10b981' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
