import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  BarChart2, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut,
  Brain
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'watchlist', label: 'Watchlist', icon: CheckSquare, badge: 'New' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const generalItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-[#1a1c23] border-r border-white/[0.05] flex flex-col h-screen flex-shrink-0">
      {/* Logo */}
      <div className="h-20 flex items-center px-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FinPredict</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {/* Menu Section */}
        <div>
          <div className="px-4 text-xs font-semibold text-slate-500 mb-4 tracking-wider">MENU</div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  activeTab === item.id 
                    ? 'bg-white/[0.05] text-emerald-400 font-medium' 
                    : 'text-slate-400 hover:text-slate-300 hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-emerald-600/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* General Section */}
        <div>
          <div className="px-4 text-xs font-semibold text-slate-500 mb-4 tracking-wider">GENERAL</div>
          <nav className="space-y-1">
            {generalItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === item.id 
                    ? 'bg-white/[0.05] text-emerald-400 font-medium' 
                    : 'text-slate-400 hover:text-slate-300 hover:bg-white/[0.02]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
};
