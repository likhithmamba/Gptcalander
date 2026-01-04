import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useCalendarState, useCalendarDispatch } from '../hooks';
import { dateToYYYYMMDD } from '../core';
import { computeLayout, HOUR_HEIGHT, START_HOUR, END_HOUR, TOTAL_HEIGHT } from '../core/engine';
import { EventDetailModal } from './EventDetailModal';
import { Sparkles, Command, ArrowRight, Zap } from 'lucide-react';

export const CalendarCanvas: React.FC = () => {
  const { events, currentDate } = useCalendarState();
  const dispatch = useCalendarDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const [nowTop, setNowTop] = useState<number | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Engine: Compute Layout
  const renderableEvents = useMemo(() => {
    const ymd = dateToYYYYMMDD(currentDate);
    const dayEvents = events.filter(e => e.date === ymd);
    return computeLayout(dayEvents);
  }, [events, currentDate]);

  const selectedEvent = useMemo(() => 
    events.find(e => e.id === selectedEventId), 
  [events, selectedEventId]);

  const hasEvents = renderableEvents.length > 0;

  // Engine: Time & "Now" Logic
  useEffect(() => {
      const updateNow = () => {
          const now = new Date();
          const todayYMD = dateToYYYYMMDD(now);
          const currentYMD = dateToYYYYMMDD(currentDate);
          
          if (todayYMD !== currentYMD) {
              setNowTop(null);
              return;
          }
          const minutes = (now.getHours() * 60) + now.getMinutes();
          setNowTop((minutes / 60) * HOUR_HEIGHT);
      };
      
      updateNow();
      const interval = setInterval(updateNow, 60000); 
      return () => clearInterval(interval);
  }, [currentDate]);

  // Interaction: Auto-scroll
  useEffect(() => {
      if (containerRef.current && hasEvents) {
          if (nowTop) {
            containerRef.current.scrollTop = Math.max(0, nowTop - window.innerHeight / 2.5);
          } else {
            containerRef.current.scrollTop = 8 * HOUR_HEIGHT; 
          }
      }
  }, [currentDate, hasEvents]);

  // Interaction: Create on Click
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = containerRef.current.scrollTop;
      const clickY = e.clientY - rect.top + scrollTop;
      const hour = Math.floor(clickY / HOUR_HEIGHT) + START_HOUR;
      
      dispatch({ type: 'OPEN_PALETTE_WITH', payload: `Schedule at ${hour}:00` });
  };

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

  return (
    <div className="flex flex-col h-full w-full bg-void text-text relative overflow-hidden animate-fade-in select-none">
        
        {/* Cinematic Header */}
        <div className="absolute top-0 left-0 w-full p-8 z-50 pointer-events-none bg-gradient-to-b from-void via-void/80 to-transparent flex justify-between items-start">
            <div>
                <h1 className="text-5xl font-thin tracking-tighter text-white font-sans opacity-90">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </h1>
                <p className="text-sm font-mono text-mist uppercase tracking-widest mt-1 opacity-60">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
            </div>
            {/* System Status Indicator - Adds "Premium" Feel */}
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-500/50 border border-emerald-500/20 px-2 py-1 rounded bg-emerald-500/5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Systems Nominal
            </div>
        </div>

        <div 
            ref={containerRef} 
            className="flex-1 overflow-y-auto relative custom-scrollbar scroll-smooth"
            onClick={handleCanvasClick}
        >
            <div className="relative w-full max-w-5xl mx-auto min-h-full" style={{ height: TOTAL_HEIGHT }}>
                
                {/* ZERO STATE - The "Hook" for new users */}
                {!hasEvents && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none">
                        <div className="pointer-events-auto p-8 max-w-md w-full bg-surface/30 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl animate-slide-up text-center group hover:border-white/10 transition-colors">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:bg-white/10 transition-colors">
                                <Sparkles size={20} className="text-white opacity-80" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">Temporal Void Detected</h3>
                            <p className="text-mist text-sm leading-relaxed mb-6">
                                Your schedule is currently unwritten. Use the AI command line to structure your chaos or enter Deep Focus mode.
                            </p>
                            
                            <div className="grid gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); dispatch({ type: 'OPEN_PALETTE_WITH', payload: 'Plan a deep work session for' }); }}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group/btn text-left"
                                >
                                    <span className="text-sm text-text">"Plan a deep work session..."</span>
                                    <ArrowRight size={14} className="text-mist opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); dispatch({ type: 'OPEN_PALETTE_WITH', payload: 'Schedule a team sync at' }); }}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group/btn text-left"
                                >
                                    <span className="text-sm text-text">"Schedule a team sync..."</span>
                                    <ArrowRight size={14} className="text-mist opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                                </button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5 flex justify-center gap-4 text-xs text-mist font-mono opacity-50">
                                <span className="flex items-center gap-1"><Command size={10} /> + K to Command</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Minimal Time Markers (No Lines) */}
                {hours.map(hour => (
                    <div key={hour} className="absolute left-0 w-full group pointer-events-none" style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}>
                        <span className="absolute -top-3 left-0 text-[10px] font-mono text-mute/20 group-hover:text-mute/50 transition-colors w-12 text-right">
                            {hour}:00
                        </span>
                    </div>
                ))}

                {/* The "NOW" Laser - Only visible today */}
                {nowTop !== null && (
                    <div 
                        className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent z-40 pointer-events-none shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                        style={{ top: nowTop }}
                    >
                    </div>
                )}

                {/* Events as "Data Blocks" */}
                {renderableEvents.map(event => {
                    const isPast = nowTop && (event.layout.top + event.layout.height < nowTop);
                    const isCurrent = nowTop && (event.layout.top <= nowTop) && (event.layout.top + event.layout.height >= nowTop);
                    const isDeepWork = event.category === 'deep_work';

                    return (
                        <div
                            key={event.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedEventId(event.id); }}
                            className={`
                                absolute backdrop-blur-md transition-all duration-300 cursor-pointer overflow-hidden rounded-r-sm
                                border-l-[3px] shadow-sm
                                ${isPast ? 'opacity-40 grayscale blur-[0.5px]' : 'opacity-100'}
                                ${isCurrent ? 'ring-1 ring-white/20 shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] z-30' : ''}
                                ${isDeepWork ? 'border-purple-400' : event.category === 'meeting' ? 'border-blue-400' : 'border-zinc-500'}
                                hover:opacity-100 hover:scale-[1.01] hover:z-50 hover:bg-surfaceHighlight hover:shadow-xl
                            `}
                            style={{
                                top: event.layout.top + 2,
                                height: Math.max(event.layout.height - 4, 20),
                                left: `calc(${event.layout.left}% + 60px)`,
                                width: `calc(${event.layout.width}% - 70px)`,
                                zIndex: event.layout.zIndex,
                                background: isDeepWork 
                                    ? 'linear-gradient(90deg, rgba(168,85,247,0.08) 0%, rgba(24,24,27,0.4) 100%)' 
                                    : 'linear-gradient(90deg, rgba(39,39,42,0.6) 0%, rgba(24,24,27,0.4) 100%)'
                            }}
                        >
                            <div className="px-3 py-2 h-full flex flex-col justify-start">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-[9px] font-mono tracking-widest uppercase ${isDeepWork ? 'text-purple-300' : 'text-mist'}`}>
                                        {event.startTime}
                                    </span>
                                    {isDeepWork && <Zap size={10} className="text-purple-400" />}
                                </div>
                                <h3 className={`text-sm font-medium leading-tight truncate ${isDeepWork ? 'text-white' : 'text-zinc-200'}`}>
                                    {event.title}
                                </h3>
                                {event.layout.height > 50 && (
                                    <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                                        {event.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {selectedEvent && (
            <EventDetailModal 
                event={selectedEvent} 
                onClose={() => setSelectedEventId(null)} 
            />
        )}
    </div>
  );
};