import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

export const SettingsView = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiClient.get('/settings');
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put('/settings', settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-white">Account Settings</h2>
        <p className="text-slate-400 mt-1">Manage your platform preferences and notification settings</p>
      </div>

      <Card className="glass-card border-white/[0.05] bg-[#1a1c23]">
        <CardHeader>
          <CardTitle className="text-xl text-white">General Preferences</CardTitle>
          <CardDescription className="text-slate-400">Customize how FinPredict Pro looks and feels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Theme</label>
              <select 
                className="w-full h-10 px-3 rounded-md bg-black/20 border border-white/[0.05] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={settings.theme}
                onChange={(e) => setSettings({...settings, theme: e.target.value})}
              >
                <option value="dark">Professional Dark</option>
                <option value="light">Light Mode</option>
                <option value="system">System Default</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Risk Tolerance</label>
              <select 
                className="w-full h-10 px-3 rounded-md bg-black/20 border border-white/[0.05] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={settings.risk_tolerance}
                onChange={(e) => setSettings({...settings, risk_tolerance: e.target.value})}
              >
                <option value="low">Low (Conservative)</option>
                <option value="medium">Medium (Moderate)</option>
                <option value="high">High (Aggressive)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-white/[0.05]">
            <input 
              type="checkbox" 
              id="notifications" 
              checked={settings.notifications_enabled}
              onChange={(e) => setSettings({...settings, notifications_enabled: e.target.checked})}
              className="w-4 h-4 rounded border-white/[0.1] bg-black/20 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="notifications" className="text-sm font-medium text-slate-300">
              Enable Email Notifications for Watchlist Alerts
            </label>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
