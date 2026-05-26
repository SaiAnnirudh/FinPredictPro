import React, { useState } from 'react';
import { Mail, Bell, Search } from 'lucide-react';

interface TopbarProps {
  selectedStock: string;
  onStockSelect: (stock: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ selectedStock, onStockSelect }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const symbol = searchInput.trim().toUpperCase();
      const formattedSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
      onStockSelect(formattedSymbol);
    }
  };

  return (
    <header className="h-20 bg-[#1a1c23] border-b border-white/[0.05] flex items-center justify-between px-8 flex-shrink-0 z-10">
      {/* Search Area */}
      <div className="flex-1 max-w-xl">
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search stock symbol... (e.g. RELIANCE, TCS)"
            className="w-full bg-[#121319] border border-white/[0.05] rounded-xl pl-12 pr-4 h-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-white/[0.1]"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6 ml-8">
        <div className="flex items-center space-x-4">
          <button className="w-10 h-10 rounded-full bg-[#121319] border border-white/[0.05] flex items-center justify-center text-slate-400">
            <Mail className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-[#121319] border border-white/[0.05] flex items-center justify-center text-slate-400 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#121319]"></span>
          </button>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/[0.05] bg-emerald-600/20 flex items-center justify-center">
            <span className="text-emerald-500 font-bold text-sm">JS</span>
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-semibold text-white">John Smith</div>
            <div className="text-xs text-slate-500">jsmith@predict.com</div>
          </div>
        </div>
      </div>
    </header>
  );
};
