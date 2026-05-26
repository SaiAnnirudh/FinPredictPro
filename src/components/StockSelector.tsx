
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
}

interface StockSelectorProps {
  popularStocks: Stock[];
  onStockSelect: (symbol: string) => void;
  loading: boolean;
}

export const StockSelector: React.FC<StockSelectorProps> = ({
  popularStocks,
  onStockSelect,
  loading
}) => {
  const [customSymbol, setCustomSymbol] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStocks = popularStocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomSubmit = () => {
    if (customSymbol.trim()) {
      const symbol = customSymbol.trim().toUpperCase();
      const formattedSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
      onStockSelect(formattedSymbol);
      setCustomSymbol('');
    }
  };

  const getSectorColor = (sector: string) => {
    const colors = {
      'IT': 'bg--100 text-blue-300 border--200 bg--50/30',
      'Banking': 'bg--100 text-green-300 border--200 bg--50/30',
      'Energy': 'bg--100 text-red-300 border--200 bg--50/30',
      'FMCG': 'bg--100 text-purple-300 border--200 bg--50/30',
      'Pharma': 'bg--100 text-pink-300 border--200 bg--50/30',
      'Automotive': 'bg--100 text-orange-300 border--200 bg--50/30',
      'Infrastructure': 'bg--100 text-cyan-300 border--200 bg--50/30',
      'Telecom': 'bg--100 text-indigo-300 border--200 bg--50/30',
      'Chemicals': 'bg--100 text-yellow-300 border--200 bg--50/30',
      'NBFC': 'bg--100 text-emerald-300 border--200 bg--50/30',
      'Cement': 'bg--100 text-slate-300 border--200 bg--50/30',
      'Consumer Goods': 'bg--100 text-rose-300 border--200 bg--50/30',
      'Utilities': 'bg--100 text-teal-300 border--200 bg--50/30',
      'Power': 'bg--100 text-amber-300 border--200 bg--50/30'
    };
    return colors[sector as keyof typeof colors] || 'bg--100 text-gray-300 border--200 bg--50/30';
  };

  return (
    <div className="space-y-6">
      {/* Custom Symbol Input */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Enter Custom NSE Symbol</h3>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., RELIANCE, TCS, HDFCBANK"
            value={customSymbol}
            onChange={(e) => setCustomSymbol(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
            className="bg-slate-800/50 border--200/60 text-white placeholder:text-slate-400"
            disabled={loading}
          />
          <Button 
            onClick={handleCustomSubmit}
            disabled={!customSymbol.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Popular Stocks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Popular NSE Stocks</h3>
          <Input
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-slate-800/50 border--200/60 text-white placeholder:text-slate-400"
          />
        </div>
        
        <div className="stock-grid">
          {filteredStocks.map((stock) => (
            <Button
              key={stock.symbol}
              variant="outline"
              onClick={() => onStockSelect(stock.symbol)}
              disabled={loading}
              className="h-auto p-4 flex flex-col items-start space-y-2 bg-[#1a1c23] border--200/60 hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-200"
            >
              <div className="font-semibold text-left">{stock.symbol.replace('.NS', '')}</div>
              <div className="text-xs text-slate-400 text-left line-clamp-2">{stock.name}</div>
              <Badge className={`text-xs ${getSectorColor(stock.sector)}`}>
                {stock.sector}
              </Badge>
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              )}
            </Button>
          ))}
        </div>
        
        {filteredStocks.length === 0 && searchTerm && (
          <div className="text-center py-8 text-slate-400">
            No stocks found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};
