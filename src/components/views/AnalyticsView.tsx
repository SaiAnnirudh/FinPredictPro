import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowUp, BarChart2, CheckSquare, Brain, Target } from 'lucide-react';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

export const AnalyticsView = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiClient.get('/analytics/summary');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-white">Analytics Overview</h2>
        <p className="text-slate-400 mt-1">Platform-wide statistics and personal usage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card bg-emerald-600 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-emerald-50 font-medium">Total Predictions</p>
              <Target className="w-4 h-4 text-emerald-200" />
            </div>
            <h3 className="text-4xl font-bold mt-4 text-white">{stats.total_predictions}</h3>
            <p className="text-xs text-emerald-100 mt-2 flex items-center">Lifetime platform predictions</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/[0.05] bg-[#1a1c23]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-slate-400 font-medium">Active Models</p>
              <Brain className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-4xl font-bold mt-4 text-white">{stats.active_models}</h3>
            <p className="text-xs text-slate-400 mt-2 flex items-center">Currently deployed ML models</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/[0.05] bg-[#1a1c23]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-slate-400 font-medium">Your Watchlist</p>
              <CheckSquare className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-4xl font-bold mt-4 text-white">{stats.watchlist_count}</h3>
            <p className="text-xs text-slate-400 mt-2 flex items-center">Saved stocks tracking</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/[0.05] bg-[#1a1c23]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-slate-400 font-medium">Pending Analysis</p>
              <BarChart2 className="w-4 h-4 text-slate-500" />
            </div>
            <h3 className="text-4xl font-bold mt-4 text-white">{stats.pending_analysis}</h3>
            <p className="text-xs text-slate-400 mt-2">Currently processing in queue</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
