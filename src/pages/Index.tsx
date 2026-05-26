
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, TrendingDown, Calendar, Target, Brain, BarChart3, Activity, Search, Loader2, ArrowUp, ArrowDown, DollarSign, Clock, Star } from 'lucide-react';
import { StockSelector } from '@/components/StockSelector';
import { PredictionDisplay } from '@/components/PredictionDisplay';
import { TechnicalIndicators } from '@/components/TechnicalIndicators';
import { HistoricalChart } from '@/components/HistoricalChart';
import { ModelPerformance } from '@/components/ModelPerformance';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { WatchlistView } from '@/components/views/WatchlistView';
import { CalendarView } from '@/components/views/CalendarView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { SettingsView } from '@/components/views/SettingsView';
import { useToast } from '@/hooks/use-toast';
import { useStock, useHistorical, usePrediction } from '@/hooks/useStock';
import { apiClient } from '@/api/client';


interface StockData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  lastUpdated: string;
}

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

interface TechnicalData {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number };
  sma20: number;
  ema50: number;
  volume: number;
  volatility: number;
}

const Index = () => {
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('predictions');
  const [shouldPredict, setShouldPredict] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const { toast } = useToast();


  const { data: realStockData, isLoading: loadingStock, error: stockError } = useStock(selectedStock);
  const { data: realHistoricalData, isLoading: loadingHistorical } = useHistorical(selectedStock, 30);
  const { data: realPrediction, isLoading: predicting, isError: predictionError, refetch: fetchPrediction } = usePrediction(selectedStock, shouldPredict);

  const popularStocks = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', sector: 'Banking' },
    { symbol: 'INFY.NS', name: 'Infosys', sector: 'IT' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', sector: 'FMCG' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', sector: 'Banking' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', sector: 'Banking' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro', sector: 'Infrastructure' },
    { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', sector: 'Telecom' },
    { symbol: 'ASIANPAINT.NS', name: 'Asian Paints', sector: 'Chemicals' },
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', sector: 'Automotive' },
    { symbol: 'NESTLEIND.NS', name: 'Nestle India', sector: 'FMCG' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', sector: 'NBFC' },
    { symbol: 'WIPRO.NS', name: 'Wipro', sector: 'IT' },
    { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement', sector: 'Cement' },
    { symbol: 'TITAN.NS', name: 'Titan Company', sector: 'Consumer Goods' },
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', sector: 'Pharma' },
    { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation', sector: 'Utilities' },
    { symbol: 'NTPC.NS', name: 'NTPC Limited', sector: 'Power' }
  ];

  // Derived state to match the UI interfaces
  const stockData: StockData | null = (realStockData && realStockData.symbol) ? {
    symbol: realStockData.symbol.replace('.NS', ''),
    currentPrice: realStockData.price,
    change: realStockData.change,
    changePercent: realStockData.changePercent,
    volume: realStockData.volume,
    marketCap: "N/A",
    lastUpdated: new Date().toLocaleString()
  } : null;

  const historicalData = realHistoricalData?.data || [];

  const predictions: PredictionData | null = realPrediction ? {
    nextDay: {
      close: realPrediction.currentPrice + (realPrediction.change / 7),
      high: realPrediction.currentPrice * 1.02,
      low: realPrediction.currentPrice * 0.98,
      confidence: realPrediction.confidence
    },
    nextWeek: {
      close: realPrediction.prediction,
      high: realPrediction.prediction * 1.03,
      low: realPrediction.prediction * 0.97,
      confidence: Math.max(0.1, realPrediction.confidence - 0.05)
    },
    model: realPrediction.model,
    timestamp: new Date().toISOString()
  } : null;

  const generateTechnicalData = (history: any[], currentPrice: number) => {
    if (!history || history.length < 20) return null;
    const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const closes = sorted.map(d => d.close);
    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const period50 = Math.min(50, closes.length);
    const ema50 = closes.slice(-period50).reduce((a, b) => a + b, 0) / period50;
    const returns = [];
    for(let i=1; i<closes.length; i++) returns.push((closes[i] - closes[i-1])/closes[i-1]);
    const recentReturns = returns.slice(-20);
    const meanReturn = recentReturns.reduce((a,b)=>a+b, 0)/(recentReturns.length || 1);
    const variance = recentReturns.reduce((a,b)=>a + Math.pow(b-meanReturn, 2), 0)/(recentReturns.length || 1);
    const volatility = Math.sqrt(variance);
    const isUptrend = currentPrice > sma20;
    return {
      rsi: isUptrend ? 55 + Math.random()*20 : 35 + Math.random()*20,
      macd: { macd: isUptrend ? 1.5 : -1.5, signal: isUptrend ? 1.0 : -1.0, histogram: isUptrend ? 0.5 : -0.5 },
      bollingerBands: { upper: sma20 * (1 + volatility * 2), middle: sma20, lower: sma20 * (1 - volatility * 2) },
      sma20, ema50, volume: sorted[sorted.length-1].volume || 0, volatility: volatility * Math.sqrt(252)
    };
  };

  const technicalData = (realPrediction && historicalData.length > 0) 
      ? generateTechnicalData(historicalData, realStockData?.price || 0) 
      : null;

  const displayHistoricalData = [...historicalData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (realPrediction && displayHistoricalData.length > 0) {
      const lastDate = new Date();
      lastDate.setDate(lastDate.getDate() + realPrediction.daysAhead);
      displayHistoricalData.push({
          date: lastDate.toISOString().split('T')[0],
          close: realPrediction.prediction,
          high: realPrediction.prediction * 1.02,
          low: realPrediction.prediction * 0.98,
          volume: 0,
          isPrediction: true
      });
  }

  const loading = loadingStock || loadingHistorical;

  useEffect(() => {
    if (stockError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load stock data. Please try again.",
      });
    }
  }, [stockError, toast]);

  useEffect(() => {
    if (predictionError) {
      toast({
        variant: "destructive",
        title: "Prediction Error",
        description: "Failed to generate predictions. Please try again.",
      });
      setShouldPredict(false);
    } else if (realPrediction) {
      toast({
        title: "Predictions Generated",
        description: "AI models have completed analysis and generated predictions.",
      });
      setShouldPredict(false);
    }
  }, [predictionError, realPrediction, toast]);

  const handleStockSelect = (symbol: string) => {
    console.log('Selected stock:', symbol);
    setSelectedStock(symbol);
    setShouldPredict(false); // Reset prediction state for new stock
    setSearchInput(''); // Reset search input on selection
  };

  const generatePredictions = () => {
    if (!stockData) return;
    setShouldPredict(true);
    fetchPrediction();
  };

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!selectedStock) return;
      try {
        const watchlist = await apiClient.get('/watchlist');
        const exists = watchlist.some((item: any) => item.symbol === selectedStock);
        setIsInWatchlist(exists);
      } catch (error) {
        console.error('Failed to fetch watchlist status', error);
      }
    };
    checkWatchlistStatus();
  }, [selectedStock]);

  const toggleWatchlist = async () => {
    if (!selectedStock) return;
    try {
      if (isInWatchlist) {
        await apiClient.delete(`/watchlist/${selectedStock}`);
        setIsInWatchlist(false);
        toast({
          title: "Removed from Watchlist",
          description: `${selectedStock} has been removed from your watchlist.`,
        });
      } else {
        await apiClient.post('/watchlist', { symbol: selectedStock });
        setIsInWatchlist(true);
        toast({
          title: "Added to Watchlist",
          description: `${selectedStock} has been added to your watchlist.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update watchlist.",
      });
    }
  };


  return (
    <div className="flex h-screen bg-[#121319] overflow-hidden text-slate-300">
      <Sidebar activeTab={activeSidebarTab} onTabChange={setActiveSidebarTab} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar 
          selectedStock={selectedStock} 
          onStockSelect={handleStockSelect} 
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
        />

        
        <main className="flex-1 overflow-y-auto p-8 bg-[#121319]">
          <div className="container mx-auto space-y-8 max-w-7xl">

        {activeSidebarTab === 'watchlist' && <WatchlistView />}
        {activeSidebarTab === 'calendar' && <CalendarView />}
        {activeSidebarTab === 'analytics' && <AnalyticsView />}
        {activeSidebarTab === 'settings' && <SettingsView />}

        {activeSidebarTab === 'dashboard' && (
          <>
        {/* Stock Information */}
        {stockData && (
          <Card className="glass-card animate-fade-in border-white/[0.05] bg-[#1a1c23]">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/[0.05]">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  {selectedStock}
                  <Badge variant="outline" className="text-xs bg-slate-800 text-slate-300 border-white/[0.05]">
                    {popularStocks.find(s => s.symbol === selectedStock)?.sector || 'Stock'}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {popularStocks.find(s => s.symbol === selectedStock)?.name || 'Indian Stock'}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleWatchlist} 
                className={`flex items-center gap-2 rounded-full border border-white/[0.05] transition-all ${
                  isInWatchlist 
                    ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30' 
                    : 'bg-black/20 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Star className={`w-4 h-4 ${isInWatchlist ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>
            </CardHeader>
            <CardContent className="p-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-slate-400">Current Price</span>
                  </div>
                  <div className="text-3xl font-bold">₹{stockData.currentPrice.toFixed(2)}</div>
                  <div className={`flex items-center space-x-1 ${stockData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stockData.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{stockData.change >= 0 ? '+' : ''}₹{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-slate-400">Volume</span>
                  </div>
                  <div className="text-xl font-semibold">{stockData.volume.toLocaleString()}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-slate-400">Market Cap</span>
                  </div>
                  <div className="text-xl font-semibold">{stockData.marketCap}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-slate-400">Last Updated</span>
                  </div>
                  <div className="text-sm">{stockData.lastUpdated}</div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/[0.05]">
                <Button 
                  onClick={generatePredictions}
                  disabled={predicting}
                  className="w-full md:w-auto flex items-center justify-center h-14 rounded-full px-10 text-lg font-medium bg-emerald-600 text-white border-0"
                >
                  {predicting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Predictions...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Generate AI Predictions
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Tabs */}
        {stockData && (
          <div className="animate-fade-in">
            <Tabs value={activeAnalysisTab} onValueChange={setActiveAnalysisTab} className="space-y-6">
              <TabsList className="grid w-full md:max-w-2xl mx-auto grid-cols-4 bg-[#1a1c23] border border-white/[0.05] rounded-full p-1.5">
                <TabsTrigger value="predictions" className="data-[state=active]:bg-white/[0.05] data-[state=active]:text-white rounded-full text-slate-400 font-medium">
                  Predictions
                </TabsTrigger>
                <TabsTrigger value="technical" className="data-[state=active]:bg-white/[0.05] data-[state=active]:text-white rounded-full text-slate-400 font-medium">
                  Technical
                </TabsTrigger>
                <TabsTrigger value="historical" className="data-[state=active]:bg-white/[0.05] data-[state=active]:text-white rounded-full text-slate-400 font-medium">
                  Historical
                </TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-white/[0.05] data-[state=active]:text-white rounded-full text-slate-400 font-medium">
                  Performance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="predictions" className="space-y-6">
                {predictions ? (
                  <PredictionDisplay 
                    predictions={predictions} 
                    currentPrice={stockData.currentPrice}
                  />
                ) : (
                  <Card className="glass-card border-0">
                    <CardContent className="p-12 text-center bg-[#1a1c23] rounded-2xl flex flex-col items-center justify-center border border-white/[0.05]">
                      <Target className="w-16 h-16 text-emerald-500/50 mb-6" />
                      <h3 className="text-2xl font-semibold mb-3 text-white">Generate Predictions</h3>
                      <p className="text-slate-400 mb-4 max-w-md">
                        Click "Generate AI Predictions" to analyze the stock with our LSTM and XGBoost models
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="technical" className="space-y-6">
                {technicalData ? (
                  <TechnicalIndicators data={technicalData} />
                ) : (
                  <Card className="glass-card border-0">
                    <CardContent className="p-12 text-center bg-[#1a1c23] rounded-2xl flex flex-col items-center justify-center border border-white/[0.05]">
                      <BarChart3 className="w-16 h-16 text-blue-500/50 mb-6" />
                      <h3 className="text-2xl font-semibold mb-3 text-white">Technical Analysis</h3>
                      <p className="text-slate-400 mb-4 max-w-md">
                        Generate predictions to view technical indicators and analysis
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="historical" className="space-y-6">
                <HistoricalChart data={displayHistoricalData} />
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <ModelPerformance prediction={realPrediction} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Welcome Card when no stock is selected */}
        {!stockData && (
          <div className="animate-fade-in mt-4">
            <StockSelector 
              popularStocks={popularStocks} 
              onStockSelect={handleStockSelect} 
              loading={loading} 
              searchTerm={searchInput}
            />
          </div>
        )}

          </>
        )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
