import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Loader2, Trash2, Plus, RefreshCw } from 'lucide-react';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

export const CalendarView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await apiClient.get('/calendar');
      setEvents(data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchEvents();
      toast.success('Calendar refreshed and updated');
    } catch (error) {
      toast.error('Failed to refresh calendar');
    } finally {
      setRefreshing(false);
    }
  };

  const removeEvent = async (id: number) => {
    try {
      await apiClient.delete(`/calendar/${id}`);
      setEvents(events.filter(item => item.id !== id));
      toast.success('Event removed');
    } catch (error) {
      toast.error('Failed to remove event');
    }
  };

  const addMockEvent = async () => {
    try {
      const newEvent = await apiClient.post('/calendar', {
        title: 'Q3 Earnings Report',
        description: 'Review earnings for top portfolio stocks',
        event_date: new Date(Date.now() + 86400000 * 7).toISOString(),
        event_type: 'Earnings'
      });
      setEvents([...events, newEvent]);
      toast.success('Event added');
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Financial Calendar</h2>
          <p className="text-slate-400 mt-1">Track earnings, dividends, and market events</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline" 
            className="border-white/[0.05] bg-black/20 text-slate-300 hover:text-white hover:bg-white/5"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Sync & Refresh
          </Button>
          <Button onClick={addMockEvent} className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
            <Plus className="w-4 h-4 mr-2" /> Add Event
          </Button>
        </div>
      </div>


      {events.length === 0 ? (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center bg-[#1a1c23] rounded-2xl flex flex-col items-center justify-center border border-white/[0.05]">
            <CalendarIcon className="w-16 h-16 text-blue-500/50 mb-6" />
            <h3 className="text-2xl font-semibold mb-3 text-white">No Upcoming Events</h3>
            <p className="text-slate-400 mb-4 max-w-md">
              Your calendar is clear. Add custom events to keep track of important financial dates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="glass-card border-white/[0.05] bg-[#1a1c23]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-white flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  {event.title}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeEvent(event.id)} className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-400 mb-2">
                  {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <p className="text-slate-300">{event.description}</p>
                <div className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/[0.05] text-slate-300 border border-white/[0.1]">
                  {event.event_type}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
