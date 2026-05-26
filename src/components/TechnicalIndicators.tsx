
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap, Target } from 'lucide-react';

interface TechnicalData {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number };
  sma20: number;
  ema50: number;
  volume: number;
  volatility: number;
}

interface TechnicalIndicatorsProps {
  data: TechnicalData;
}

export const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ data }) => {
  const getRSISignal = (rsi: number) => {
    if (rsi > 70) return { signal: 'Overbought', color: 'text-rose-400', bg: 'bg-rose-500/10' };
    if (rsi < 30) return { signal: 'Oversold', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    return { signal: 'Neutral', color: 'text-amber-400', bg: 'bg-amber-500/10' };
  };

  const getMACDSignal = (macd: number, signal: number) => {
    const diff = macd - signal;
    if (diff > 0) return { signal: 'Bullish', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    return { signal: 'Bearish', color: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  const getVolatilityLevel = (volatility: number) => {
    if (volatility > 0.25) return { level: 'High', color: 'text-rose-400', bg: 'bg-rose-500/10' };
    if (volatility > 0.15) return { level: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { level: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  };

  const rsiSignal = getRSISignal(data.rsi);
  const macdSignal = getMACDSignal(data.macd.macd, data.macd.signal);
  const volatilityLevel = getVolatilityLevel(data.volatility);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>Technical Analysis Overview</span>
          </CardTitle>
          <CardDescription>
            Key technical indicators and market signals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{data.rsi.toFixed(1)}</div>
              <div className="text-sm text-slate-400">RSI</div>
              <Badge variant="secondary" className={`${rsiSignal.bg} ${rsiSignal.color} border-0 hover:${rsiSignal.bg} mt-1`}>
                {rsiSignal.signal}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{data.macd.macd.toFixed(2)}</div>
              <div className="text-sm text-slate-400">MACD</div>
              <Badge variant="secondary" className={`${macdSignal.bg} ${macdSignal.color} border-0 hover:${macdSignal.bg} mt-1`}>
                {macdSignal.signal}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{(data.volatility * 100).toFixed(1)}%</div>
              <div className="text-sm text-slate-400">Volatility</div>
              <Badge variant="secondary" className={`${volatilityLevel.bg} ${volatilityLevel.color} border-0 hover:${volatilityLevel.bg} mt-1`}>
                {volatilityLevel.level}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{(data.volume / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-slate-400">Volume</div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-0 hover:bg-amber-500/10 mt-1">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSI Analysis */}
        <Card className="glass-card border--200 bg--50/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>RSI Analysis</span>
            </CardTitle>
            <CardDescription>
              Relative Strength Index - Momentum Oscillator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Current RSI</span>
                <span className="font-bold text-blue-600">{data.rsi.toFixed(2)}</span>
              </div>
              <Progress value={data.rsi} className="h-3" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Oversold (30)</span>
                <span>Neutral (50)</span>
                <span>Overbought (70)</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${rsiSignal.bg} border border-current/20`}>
              <div className={`font-semibold ${rsiSignal.color}`}>Signal: {rsiSignal.signal}</div>
              <div className="text-sm text-slate-300 mt-1">
                {data.rsi > 70 
                  ? "Stock may be overvalued, consider selling"
                  : data.rsi < 30 
                  ? "Stock may be undervalued, consider buying"
                  : "Stock is in neutral territory"
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MACD Analysis */}
        <Card className="glass-card border--200 bg--50/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span>MACD Analysis</span>
            </CardTitle>
            <CardDescription>
              Moving Average Convergence Divergence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">MACD Line</span>
                <span className="font-semibold">{data.macd.macd.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Signal Line</span>
                <span className="font-semibold">{data.macd.signal.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Histogram</span>
                <span className={`font-semibold ${data.macd.histogram >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data.macd.histogram.toFixed(3)}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${macdSignal.bg} border border-current/20`}>
              <div className={`font-semibold ${macdSignal.color}`}>Signal: {macdSignal.signal}</div>
              <div className="text-sm text-slate-300 mt-1">
                {data.macd.macd > data.macd.signal 
                  ? "MACD above signal line - bullish momentum"
                  : "MACD below signal line - bearish momentum"
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bollinger Bands */}
        <Card className="glass-card border--200 bg--50/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <span>Bollinger Bands</span>
            </CardTitle>
            <CardDescription>
              Price volatility and support/resistance levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Upper Band</span>
                <span className="font-semibold text-rose-600">₹{data.bollingerBands.upper.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Middle Band (SMA)</span>
                <span className="font-semibold">₹{data.bollingerBands.middle.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Lower Band</span>
                <span className="font-semibold text-emerald-600">₹{data.bollingerBands.lower.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border--100">
              <div className="font-semibold text-emerald-600">Band Width</div>
              <div className="text-sm text-slate-300 mt-1">
                ₹{(data.bollingerBands.upper - data.bollingerBands.lower).toFixed(2)} 
                ({(((data.bollingerBands.upper - data.bollingerBands.lower) / data.bollingerBands.middle) * 100).toFixed(2)}%)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moving Averages */}
        <Card className="glass-card border--200 bg--50/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <span>Moving Averages</span>
            </CardTitle>
            <CardDescription>
              Trend direction and momentum indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">SMA 20</span>
                <span className="font-semibold">₹{data.sma20.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">EMA 50</span>
                <span className="font-semibold">₹{data.ema50.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Trend</span>
                <span className={`font-semibold ${data.sma20 > data.ema50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data.sma20 > data.ema50 ? 'Bullish' : 'Bearish'}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${data.sma20 > data.ema50 ? 'bg-green-500/10 border--100' : 'bg-red-500/10 border--100'} border`}>
              <div className={`font-semibold ${data.sma20 > data.ema50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {data.sma20 > data.ema50 ? 'Uptrend' : 'Downtrend'}
              </div>
              <div className="text-sm text-slate-300 mt-1">
                {data.sma20 > data.ema50 
                  ? "Short-term moving average above long-term"
                  : "Short-term moving average below long-term"
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
