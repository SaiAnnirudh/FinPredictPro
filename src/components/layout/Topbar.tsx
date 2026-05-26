import React, { useState } from 'react';
import { Mail, Bell, Search, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';

interface TopbarProps {
  selectedStock: string;
  onStockSelect: (stock: string) => void;
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  onTabChange?: (tab: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  selectedStock, 
  onStockSelect,
  searchInput,
  onSearchInputChange,
  onTabChange
}) => {
  const { userEmail, logout } = useAuth();
  
  const displayName = userEmail 
    ? userEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) 
    : 'Guest';
    
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'G';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const symbol = searchInput.trim().toUpperCase();
      const formattedSymbol = symbol.endsWith('.NS') ? symbol : `${symbol}.NS`;
      onStockSelect(formattedSymbol);
    }
  };

  const notifications = [
    { id: 1, title: 'Prediction Ready', message: 'The LSTM model finished predicting TCS.NS', time: '10m ago', unread: true },
    { id: 2, title: 'Watchlist Update', message: 'RELIANCE.NS is up 3.4% today', time: '2h ago', unread: true },
    { id: 3, title: 'Welcome', message: 'Welcome to FinPredict Pro!', time: '1d ago', unread: false },
  ];

  const handleMailClick = () => {
    window.location.href = "mailto:ts.saiannirudh@gmail.com";
  };

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-20 bg-[#1a1c23] border-b border-white/[0.05] flex items-center justify-between px-8 flex-shrink-0 z-10">
      {/* Search Area */}
      <div className="flex-1 max-w-2xl lg:ml-8">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
          </div>
          <input 
            ref={searchInputRef}
            type="text"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Search for Indian stocks... (e.g. RELIANCE, TCS)"
            className="w-full bg-[#121319] hover:bg-white/[0.02] border border-white/[0.05] rounded-xl pl-12 pr-16 h-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 focus:bg-[#121319] transition-all shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-white/[0.1] bg-white/[0.02] px-2 text-[10px] font-medium text-slate-400 group-focus-within:text-emerald-400/70 group-focus-within:border-emerald-500/30 transition-colors">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6 ml-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleMailClick}
            className="w-10 h-10 rounded-full bg-[#121319] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/[0.1] transition-all"
            title="Contact Support"
          >
            <Mail className="w-5 h-5" />
          </button>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-10 h-10 rounded-full bg-[#121319] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/[0.1] transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#121319]"></span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 border-white/[0.05] bg-[#1a1c23] text-white mr-8" align="end">
              <div className="p-4 border-b border-white/[0.05]">
                <h4 className="font-semibold">Notifications</h4>
              </div>
              <div className="flex flex-col max-h-80 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-4 border-b border-white/[0.05] hover:bg-white/[0.02] cursor-pointer transition-colors flex gap-3">
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.unread ? 'bg-emerald-500' : 'bg-transparent'}`} />
                    <div>
                      <h5 className="text-sm font-medium">{notif.title}</h5>
                      <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                      <span className="text-[10px] text-slate-500 mt-2 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.05]">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/[0.05] bg-emerald-600/20 flex items-center justify-center">
                <span className="text-emerald-500 font-bold text-sm">{initials}</span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-white">{displayName}</div>
                <div className="text-xs text-slate-500">{userEmail || 'guest@predict.com'}</div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-white/[0.05] bg-[#1a1c23] text-white" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.05]" />
            <DropdownMenuItem 
              onClick={() => onTabChange && onTabChange('settings')}
              className="cursor-pointer hover:bg-white/[0.05] focus:bg-white/[0.05] focus:text-white"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onTabChange && onTabChange('help')}
              className="cursor-pointer hover:bg-white/[0.05] focus:bg-white/[0.05] focus:text-white"
            >
              <Mail className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.05]" />
            <DropdownMenuItem 
              onClick={logout}
              className="cursor-pointer text-rose-400 focus:text-rose-300 focus:bg-rose-500/10 hover:bg-rose-500/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
};

