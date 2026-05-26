import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, Loader2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

interface WatchlistViewProps {
  onAnalyze: (symbol: string) => void;
}

export const WatchlistView = ({ onAnalyze }: WatchlistViewProps) => {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const data = await apiClient.get('/watchlist');
      setWatchlist(data);
    } catch (error) {
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const removeStock = async (symbol: string) => {
    try {
      await apiClient.delete(`/watchlist/${symbol}`);
      setWatchlist(watchlist.filter(item => item.symbol !== symbol));
      toast.success(`${symbol} removed from watchlist`);
    } catch (error) {
      toast.error('Failed to remove stock');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-white">Your Watchlist</h2>
        <p className="text-slate-400 mt-1">Monitor your favorite stocks and AI predictions</p>
      </div>

      {watchlist.length === 0 ? (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center bg-[#1a1c23] rounded-2xl flex flex-col items-center justify-center border border-white/[0.05]">
            <TrendingUp className="w-16 h-16 text-emerald-500/50 mb-6" />
            <h3 className="text-2xl font-semibold mb-3 text-white">Watchlist is Empty</h3>
            <p className="text-slate-400 mb-4 max-w-md">
              Go to the Dashboard and search for stocks to add them to your watchlist.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((item) => (
            <Card key={item.id} className="glass-card border-white/[0.05] bg-[#1a1c23]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold text-white">{item.symbol}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeStock(item.symbol)} className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">Added on: {new Date(item.added_at).toLocaleDateString()}</p>
                <Button 
                  onClick={() => onAnalyze(item.symbol)}
                  className="w-full mt-4 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/20">
                  Analyze Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
