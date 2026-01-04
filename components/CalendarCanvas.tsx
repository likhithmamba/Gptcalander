import React, { useMemo, useRef, useEffect } from 'react';
import { useCalendarState, useCalendarDispatch } from '../hooks';
import { dateToYYYYMMDD } from '../core';
import { CalendarEvent } from '../types';

// Constants
const HOUR_HEIGHT = 80;
const START_HOUR = 6;
const END_HOUR = 24;

export const CalendarCanvas: React.FC = () => {
  const { events, currentDate } = useCalendarState();
  const dispatch = useCalendarDispatch();
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter events for today
  const dayEvents = useMemo(() => {
    const ymd = dateToYYYYMMDD(currentDate);
    return events.filter(e => e.date === ymd);
  }, [events, currentDate]);

  // Layout Engine: Calculate absolute positions
  const processedEvents = useMemo(() => {
      // Sort by start time
      const sorted = [...dayEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      // Simple overlap logic (Version 1: Full width, overlapping z-index)
      // In a real engine, we'd calculate width % based on overlaps
      return sorted.map(event => {
          const [h, m] = event.startTime.split(':').map(Number);
          const [endH, endM] = event.endTime.split(':').map(Number);
          
          const startMin = (h * 60) + m;
          const endMin = (endH * 60) + endM;
          const duration = endMin - startMin;
          
          const top = (startMin - (START_HOUR * 60)) * (HOUR_HEIGHT / 60);
          const height = duration * (HOUR_HEIGHT / 60);
          
          return { ...event, _layout: { top, height, left: 0, width: 100 } };
      });
  }, [dayEvents]);

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

  const handleCanvasClick = (e: React.MouseEvent) => {
      // In a real implementation, calculate time from Y coord
      dispatch({ type: 'OPEN_PALETTE_WITH', payload: '' });
  };

  // Auto-scroll to current time
  useEffect(() => {
      if (containerRef.current) {
          const now = new Date();
          const mins = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
          const scrollY = (mins * (HOUR_HEIGHT / 60)) - 100;
          containerRef.current.scrollTop = scrollY;
      }
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-bg text-text animate-fade-in relative overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-6 flex items-baseline justify-between border-b border-surfaceHighlight/50 bg-bg/95 backdrop-blur z-10">
            <div>
                <h1 className="text-4xl font-light tracking-tighter">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </h1>
                <p className="text-mist font-mono text-sm mt-1 uppercase tracking-widest">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
            </div>
            <div className="text-right">
               <span className="text-[10px] text-mist/50 border border-mist/20 px-2 py-1 rounded font-mono">CMD + K</span>
            </div>
        </div>

        {/* Timeline Canvas */}
        <div ref={containerRef} className="flex-1 overflow-y-auto relative custom-scrollbar" onClick={handleCanvasClick}>
            <div className="relative min-h-full w-full max-w-4xl mx-auto" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}>
                
                {/* Time Markers */}
                {hours.map(hour => (
                    <div key={hour} className="absolute w-full border-t border-surfaceHighlight/30 flex" style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}>
                        <span className="w-16 text-right pr-4 text-xs font-mono text-mist/40 -mt-2">
                            {hour}:00
                        </span>
                    </div>
                ))}

                {/* Current Time Indicator (if today) */}
                <div className="absolute w-full border-t border-red-500/50 z-20" style={{ top: 200 /* Mock position */ }}>
                    <span className="absolute left-0 -top-2 bg-red-500/10 text-red-500 text-[9px] px-1 font-mono">NOW</span>
                </div>

                {/* Events */}
                {processedEvents.map(event => (
                    <div
                        key={event.id}
                        className="absolute left-20 right-4 rounded-md border-l-2 p-3 overflow-hidden hover:brightness-110 transition-all cursor-pointer group"
                        style={{
                            top: event._layout?.top,
                            height: Math.max(event._layout?.height || 0, 30),
                            backgroundColor: 
                                event.category === 'deep_work' ? 'rgba(168, 85, 247, 0.1)' : 
                                event.category === 'meeting' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(39, 39, 42, 0.5)',
                            borderColor: 
                                event.category === 'deep_work' ? '#a855f7' : 
                                event.category === 'meeting' ? '#6366f1' : '#555',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Select event
                        }}
                    >
                        <div className="flex justify-between items-start">
                             <h3 className="text-sm font-medium text-text/90 leading-none">{event.title}</h3>
                             <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-1 rounded">{event.startTime}</span>
                        </div>
                        {event._layout!.height > 40 && (
                            <p className="text-xs text-mist mt-1 line-clamp-2">{event.description || event.category}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
