import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
}

interface StockSelectorProps {
  popularStocks: Stock[];
  onStockSelect: (symbol: string) => void;
  loading: boolean;
  searchTerm: string;
}

export const StockSelector: React.FC<StockSelectorProps> = ({
  popularStocks,
  onStockSelect,
  loading,
  searchTerm
}) => {
  const filteredStocks = popularStocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSectorColor = (sector: string) => {
    const colors = {
      'IT': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      'Banking': 'bg-green-500/10 text-green-300 border-green-500/20',
      'Energy': 'bg-red-500/10 text-red-300 border-red-500/20',
      'FMCG': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      'Pharma': 'bg-pink-500/10 text-pink-300 border-pink-500/20',
      'Automotive': 'bg-orange-500/10 text-orange-300 border-orange-500/20',
      'Infrastructure': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      'Telecom': 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      'Chemicals': 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
      'NBFC': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      'Cement': 'bg-slate-500/10 text-slate-300 border-slate-500/20',
      'Consumer Goods': 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      'Utilities': 'bg-teal-500/10 text-teal-300 border-teal-500/20',
      'Power': 'bg-amber-500/10 text-amber-300 border-amber-500/20'
    };
    return colors[sector as keyof typeof colors] || 'bg-gray-500/10 text-gray-300 border-gray-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Popular Stocks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
          <h3 className="text-xl font-bold text-white">Popular Indian Stocks</h3>
          {searchTerm && (
            <Badge variant="secondary" className="bg-white/5 text-slate-300 border-0">
              Filtering by: {searchTerm}
            </Badge>
          )}
        </div>
        
        <div className="stock-grid">
          {filteredStocks.map((stock) => (
            <Button
              key={stock.symbol}
              variant="outline"
              onClick={() => onStockSelect(stock.symbol)}
              disabled={loading}
              className="h-auto p-4 flex flex-col items-start space-y-2 bg-[#1a1c23] border border-white/[0.05] hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-200"
            >
              <div className="font-semibold text-left text-white">{stock.symbol.replace('.NS', '')}</div>
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
          <div className="text-center py-8 text-slate-400 bg-[#1a1c23]/50 border border-white/[0.05] rounded-xl">
            No stocks found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

