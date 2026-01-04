import React, { useMemo } from 'react';
import { useCalendarState, useCalendarDispatch } from '../hooks';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, CheckCircle, Clock } from 'lucide-react';
import { dateToYYYYMMDD } from '../core';

export const Dashboard: React.FC = () => {
  const { events, thoughts } = useCalendarState();
  const dispatch = useCalendarDispatch();

  // 1. Calculate Cognitive Load (Events per day) for the graph
  const loadData = useMemo(() => {
      const today = new Date();
      const data = [];
      for(let i = 0; i < 14; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const ymd = dateToYYYYMMDD(d);
          const dailyEvents = events.filter(e => e.date === ymd);
          // Weighted score: Deep work = 2, others = 1
          const score = dailyEvents.reduce((acc, e) => acc + (e.category === 'deep_work' ? 2 : 1), 0);
          
          data.push({
              name: d.getDate().toString(),
              fullDate: d.toLocaleDateString(),
              load: score
          });
      }
      return data;
  }, [events]);

  const upcomingEvents = useMemo(() => {
      const today = dateToYYYYMMDD(new Date());
      return events
        .filter(e => e.date >= today)
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
        .slice(0, 4);
  }, [events]);

  const stats = {
      pendingThoughts: thoughts.length,
      deepWorkCount: events.filter(e => e.category === 'deep_work').length,
      upcomingTotal: events.length
  };

  const startFocus = () => {
      dispatch({ type: 'SET_APP_VIEW', payload: 'focus' });
  }

  return (
    <div className="p-6 h-full overflow-y-auto animate-fade-in space-y-6">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface/50 backdrop-blur-md border border-surfaceHighlight p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full text-primary"><Activity /></div>
            <div>
                <h3 className="text-2xl font-bold text-text">{stats.upcomingTotal}</h3>
                <p className="text-xs text-mist uppercase tracking-wider">Active Events</p>
            </div>
        </div>
        <div className="bg-surface/50 backdrop-blur-md border border-surfaceHighlight p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-secondary/20 rounded-full text-secondary"><Zap /></div>
            <div>
                <h3 className="text-2xl font-bold text-text">{stats.pendingThoughts}</h3>
                <p className="text-xs text-mist uppercase tracking-wider">Ideas Buffered</p>
            </div>
        </div>
        <div className="bg-surface/50 backdrop-blur-md border border-surfaceHighlight p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-surfaceHighlight transition-colors" onClick={startFocus}>
            <div className="p-3 bg-accent/20 rounded-full text-accent"><Clock /></div>
            <div>
                <h3 className="text-lg font-bold text-text">Start Focus</h3>
                <p className="text-xs text-mist uppercase tracking-wider">Enter Flow State</p>
            </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-surface/50 backdrop-blur-md border border-surfaceHighlight rounded-xl p-6 h-72">
          <h2 className="text-sm font-mono text-mist uppercase mb-4">Cognitive Load Forecast (14 Days)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={loadData}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#444" tick={{fontSize: 12}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0f10', borderColor: '#333', color: '#fff' }}
                itemStyle={{ color: '#888' }}
              />
              <Area type="monotone" dataKey="load" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
            </AreaChart>
          </ResponsiveContainer>
      </div>

      {/* Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface/50 backdrop-blur-md border border-surfaceHighlight rounded-xl p-6">
              <h2 className="text-sm font-mono text-mist uppercase mb-4">Upcoming Priorities</h2>
              <div className="space-y-3">
                  {upcomingEvents.length === 0 ? <p className="text-mist text-sm">Clear skies ahead.</p> : upcomingEvents.map(e => (
                      <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-surfaceHighlight/50">
                          <div className={`w-1 h-8 rounded-full ${
                              e.category === 'deep_work' ? 'bg-secondary' : 
                              e.category === 'meeting' ? 'bg-primary' : 
                              e.category === 'health' ? 'bg-success' : 'bg-mist'
                          }`}></div>
                          <div>
                              <h4 className="text-sm font-medium text-text">{e.title}</h4>
                              <p className="text-xs text-mist">{e.date} • {e.startTime}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

           <div className="bg-surface/50 backdrop-blur-md border border-surfaceHighlight rounded-xl p-6 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surfaceHighlight flex items-center justify-center mb-4">
                  <CheckCircle className="text-success" size={24}/>
              </div>
              <h3 className="text-text font-semibold">System Optimal</h3>
              <p className="text-sm text-mist mt-2 max-w-xs">Your schedule density is within healthy limits. Consider adding a Deep Work block for Friday.</p>
           </div>
      </div>

    </div>
  );
};
