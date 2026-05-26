
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

interface HistoricalData {
  date: string;
  close: number;
  high: number;
  low: number;
  volume: number;
}

interface HistoricalChartProps {
  data: HistoricalData[];
}

export const HistoricalChart: React.FC<HistoricalChartProps> = ({ data }) => {
  const formatPrice = (value: number) => `₹${value.toFixed(2)}`;
  const formatVolume = (value: number) => `${(value / 1000000).toFixed(1)}M`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1c23] border border-white/[0.05] rounded-2xl p-3 shadow-xl">
          <p className="text-white font-semibold">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name === 'Volume' ? formatVolume(entry.value) : formatPrice(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center bg-[#1a1c23] rounded-2xl">
          <TrendingUp className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-white">No Historical Data</h3>
          <p className="text-slate-400">Historical data will be displayed here once a stock is selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Price History (30 Days)</span>
          </CardTitle>
          <CardDescription>
            Historical closing prices with high/low ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={formatVolume}
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  name="Close Price"
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="High"
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#ef4444"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Low"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Volume Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>Volume Analysis</span>
          </CardTitle>
          <CardDescription>
            Daily trading volume trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={formatVolume}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="volume"
                  fill="#8b5cf6"
                  name="Volume"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>30-Day Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                ₹{Math.max(...data.map(d => d.high)).toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">30D High</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rose-600">
                ₹{Math.min(...data.map(d => d.low)).toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">30D Low</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ₹{(data.reduce((sum, d) => sum + d.close, 0) / data.length).toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatVolume(data.reduce((sum, d) => sum + d.volume, 0) / data.length)}
              </div>
              <div className="text-sm text-slate-400">Avg Volume</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
