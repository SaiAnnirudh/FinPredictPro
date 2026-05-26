
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Calendar, Target, Brain, ArrowUp, ArrowDown } from 'lucide-react';

interface PredictionData {
  nextDay: {
    close: number;
    high: number;
    low: number;
    confidence: number;
  };
  nextWeek: {
    close: number;
    high: number;
    low: number;
    confidence: number;
  };
  model: string;
  timestamp: string;
}

interface PredictionDisplayProps {
  predictions: PredictionData;
  currentPrice: number;
}

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  predictions,
  currentPrice
}) => {
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const formatChange = (predicted: number, current: number) => {
    const change = predicted - current;
    const changePercent = (change / current) * 100;
    return {
      change,
      changePercent,
      isPositive: change >= 0
    };
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-600';
    if (confidence >= 0.6) return 'text-amber-600';
    return 'text-rose-600';
  };

  const nextDayChange = formatChange(predictions.nextDay.close, currentPrice);
  const nextWeekChange = formatChange(predictions.nextWeek.close, currentPrice);

  return (
    <div className="space-y-6">
      {/* Model Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>AI Model Analysis</span>
          </CardTitle>
          <CardDescription>
            Predictions generated using {predictions.model}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Model Type</div>
              <div className="font-semibold">{predictions.model}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Generated At</div>
              <div className="font-semibold">{new Date(predictions.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Day Prediction */}
        <Card className="glass-card border--200 bg--50/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Next Day Prediction</span>
            </CardTitle>
            <CardDescription>
              Predictions for tomorrow's trading session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Close Price */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Predicted Close</span>
                <Badge className={nextDayChange.isPositive ? 'bg--100 text-green-300' : 'bg--100 text-red-300'}>
                  {nextDayChange.isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {nextDayChange.changePercent.toFixed(2)}%
                </Badge>
              </div>
              <div className="text-2xl font-bold">{formatPrice(predictions.nextDay.close)}</div>
              <div className={`text-sm ${nextDayChange.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {nextDayChange.isPositive ? '+' : ''}₹{nextDayChange.change.toFixed(2)} from current
              </div>
            </div>

            {/* High/Low Range */}
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Predicted Range</div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-rose-600">Low</div>
                  <div className="font-semibold">{formatPrice(predictions.nextDay.low)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-emerald-600">High</div>
                  <div className="font-semibold">{formatPrice(predictions.nextDay.high)}</div>
                </div>
              </div>
            </div>

            {/* Confidence */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Confidence</span>
                <span className={`text-sm font-semibold ${getConfidenceColor(predictions.nextDay.confidence)}`}>
                  {(predictions.nextDay.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={predictions.nextDay.confidence * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Next Week Prediction */}
        <Card className="glass-card border--200 bg--50/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span>Next Week Prediction</span>
            </CardTitle>
            <CardDescription>
              Predictions for the next 7 trading days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Close Price */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Predicted Close</span>
                <Badge className={nextWeekChange.isPositive ? 'bg--100 text-green-300' : 'bg--100 text-red-300'}>
                  {nextWeekChange.isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {nextWeekChange.changePercent.toFixed(2)}%
                </Badge>
              </div>
              <div className="text-2xl font-bold">{formatPrice(predictions.nextWeek.close)}</div>
              <div className={`text-sm ${nextWeekChange.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {nextWeekChange.isPositive ? '+' : ''}₹{nextWeekChange.change.toFixed(2)} from current
              </div>
            </div>

            {/* High/Low Range */}
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Predicted Range</div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-rose-600">Low</div>
                  <div className="font-semibold">{formatPrice(predictions.nextWeek.low)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-emerald-600">High</div>
                  <div className="font-semibold">{formatPrice(predictions.nextWeek.high)}</div>
                </div>
              </div>
            </div>

            {/* Confidence */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Confidence</span>
                <span className={`text-sm font-semibold ${getConfidenceColor(predictions.nextWeek.confidence)}`}>
                  {(predictions.nextWeek.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={predictions.nextWeek.confidence * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="glass-card border--200 bg--50/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Prediction Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600">Short-term Outlook (Next Day)</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Direction:</span>
                  <span className={nextDayChange.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                    {nextDayChange.isPositive ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volatility:</span>
                  <span className="text-amber-600">
                    {Math.abs((predictions.nextDay.high - predictions.nextDay.low) / currentPrice * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-600">Medium-term Outlook (Next Week)</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Direction:</span>
                  <span className={nextWeekChange.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                    {nextWeekChange.isPositive ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volatility:</span>
                  <span className="text-amber-600">
                    {Math.abs((predictions.nextWeek.high - predictions.nextWeek.low) / currentPrice * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
