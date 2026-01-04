import React, { useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useCalendarState, useCalendarDispatch } from '../hooks';
import { generateMonthView, dateToYYYYMMDD, getMonthName, getYear, areDatesEqual } from '../core';
import { CalendarEvent, Day, CalendarViewType } from '../types';
import { ThoughtCard } from './ThoughtCard';
import { InlineInput } from './InputBar';
import { EventDetailModal } from './EventDetailModal';
import { ChevronLeft, ChevronRight, Calendar, View, Columns } from 'lucide-react';

interface Props {
  thoughtToSchedule: string | null;
  onScheduled: () => void;
}

export const CalendarCanvas: React.FC<Props> = ({ thoughtToSchedule, onScheduled }) => {
  const { events, currentDate, calendarView } = useCalendarState();
  const dispatch = useCalendarDispatch();
  const [inputState, setInputState] = useState<{ date: Date; position: { top: number; left: number }; prefill?: string } | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState('animate-fade-in');

  // --- Handle scheduling from Brainstorm view ---
  useEffect(() => {
    if (thoughtToSchedule) {
      setInputState({
        date: new Date(), 
        position: { top: window.innerHeight / 2, left: window.innerWidth / 2 },
        prefill: thoughtToSchedule
      });
      onScheduled();
    }
  }, [thoughtToSchedule, onScheduled]);

  // --- Data ---
  const monthView = useMemo(() => generateMonthView(currentDate), [currentDate]);
  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    return events.reduce((acc, event) => {
      (acc[event.date] = acc[event.date] || []).push(event);
      acc[event.date].sort((a, b) => a.startTime.localeCompare(b.startTime));
      return acc;
    }, {} as Record<string, CalendarEvent[]>);
  }, [events]);

  // --- Handlers ---
  const handleDayClick = (dayDate: Date, e: React.MouseEvent<HTMLDivElement>) => {
    if (inputState) return;
    setInputState({
      date: dayDate,
      position: { top: e.clientY, left: e.clientX }
    });
  };

  const handleNav = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const increment = direction === 'prev' ? -1 : 1;
    setAnimationClass(direction === 'prev' ? 'animate-slide-out-right' : 'animate-slide-out-left');

    setTimeout(() => {
      switch (calendarView) {
        case 'month': newDate.setMonth(currentDate.getMonth() + increment); break;
        case 'week': newDate.setDate(currentDate.getDate() + (7 * increment)); break;
        case 'day': newDate.setDate(currentDate.getDate() + increment); break;
      }
      dispatch({ type: 'SET_DATE', payload: newDate });
      setAnimationClass(direction === 'prev' ? 'animate-slide-in-left' : 'animate-slide-in-right');
    }, 150);
  };
  
  const setView = (view: CalendarViewType) => dispatch({ type: 'SET_CALENDAR_VIEW', payload: view });
  const goToToday = () => dispatch({ type: 'SET_DATE', payload: new Date() });
  const selectedEvent = events.find(e => e.id === selectedEventId);

  // --- Sub-Renders ---
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderMonthView = () => (
    <div className={`flex-1 grid grid-cols-7 grid-rows-[auto_1fr] gap-px bg-surfaceHighlight/50 border border-surfaceHighlight rounded-xl overflow-hidden backdrop-blur-sm ${animationClass}`}>
      {weekdays.map(day => <div key={day} className="text-center text-[10px] text-mist font-mono uppercase py-3 bg-surface/80">{day}</div>)}
      {monthView.flatMap(week => week.days).map((day, i) => {
        const ymd = dateToYYYYMMDD(day.date);
        const dayEvents = eventsByDate[ymd] || [];
        return (
          <div key={ymd} className={`relative flex flex-col p-1 min-h-[80px] bg-surface/40 transition-colors ${!day.isCurrentMonth ? 'opacity-20 grayscale' : 'hover:bg-surface/80 cursor-pointer'}`} onClick={(e) => day.isCurrentMonth && handleDayClick(day.date, e)}>
            <div className={`text-[10px] mb-1 w-6 h-6 flex items-center justify-center rounded-full ${day.isToday ? 'bg-primary text-white font-bold' : 'text-mist'}`}>
                {day.date.getDate()}
            </div>
            <div className="flex-1 space-y-0.5 overflow-hidden">{dayEvents.map(event => <ThoughtCard key={event.id} event={event} onClick={() => setSelectedEventId(event.id)} />)}</div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
     <div className={`flex-1 grid grid-cols-7 gap-px bg-surfaceHighlight/50 border border-surfaceHighlight rounded-xl overflow-hidden backdrop-blur-sm ${animationClass}`}>
        {weekDates.map(date => {
          const ymd = dateToYYYYMMDD(date);
          const dayEvents = eventsByDate[ymd] || [];
          const isToday = areDatesEqual(date, new Date());
          return (
             <div key={ymd} className="relative flex flex-col p-2 bg-surface/40 hover:bg-surface/80 cursor-pointer" onClick={(e) => handleDayClick(date, e)}>
                <div className="text-center text-xs mb-3 border-b border-white/5 pb-2">
                    <span className="text-mist font-mono uppercase text-[10px] block">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className={`inline-block mt-1 w-7 h-7 leading-7 rounded-full ${isToday ? 'bg-primary text-white font-bold' : 'text-text'}`}>{date.getDate()}</span>
                </div>
                <div className="flex-1 space-y-1 overflow-hidden">{dayEvents.map(event => <ThoughtCard key={event.id} event={event} onClick={() => setSelectedEventId(event.id)} />)}</div>
            </div>
          )
        })}
     </div>
  );

  const renderDayView = () => {
     const ymd = dateToYYYYMMDD(currentDate);
     const dayEvents = eventsByDate[ymd] || [];
     return (
        <div className={`flex-1 bg-surface/40 border border-surfaceHighlight rounded-xl p-6 backdrop-blur-md ${animationClass} flex flex-col`}>
            <div className="flex items-baseline justify-between mb-8 border-b border-white/10 pb-4">
                <h3 className="text-3xl font-light">{currentDate.toLocaleDateString(undefined, { weekday: 'long' })}</h3>
                <span className="text-xl text-mist font-mono">{currentDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
                {dayEvents.length > 0 ? dayEvents.map(event => (
                    <div key={event.id} className="flex gap-4 group">
                        <div className="w-16 text-right text-xs text-mist font-mono pt-2">{event.startTime}</div>
                        <div className="flex-1">
                            <ThoughtCard event={event} onClick={() => setSelectedEventId(event.id)} />
                        </div>
                    </div>
                )) : (
                    <div className="h-full flex items-center justify-center text-mist opacity-40">No signals detected.</div>
                )}
            </div>
        </div>
     );
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-text animate-fade-in gap-4">
      {inputState && ReactDOM.createPortal(<InlineInput {...inputState} onClose={() => setInputState(null)} />, document.body)}
      {selectedEvent && ReactDOM.createPortal(<EventDetailModal event={selectedEvent} onClose={() => setSelectedEventId(null)} />, document.body)}
      
      {/* Calendar Specific Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-light tracking-tight">{getMonthName(currentDate)} <span className="text-mist opacity-50 font-mono text-lg ml-2">{getYear(currentDate)}</span></h1>
          <button onClick={goToToday} className="text-[10px] font-mono uppercase px-3 py-1 border border-surfaceHighlight rounded-full text-mist hover:text-text hover:bg-surfaceHighlight transition-colors">Today</button>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-surface/80 p-1 rounded-lg border border-surfaceHighlight">
            <button onClick={() => setView('month')} className={`p-1.5 rounded-md transition-colors ${calendarView === 'month' ? 'bg-surfaceHighlight text-text shadow-sm' : 'text-mist hover:text-text'}`}><Calendar size={14} /></button>
            <button onClick={() => setView('week')} className={`p-1.5 rounded-md transition-colors ${calendarView === 'week' ? 'bg-surfaceHighlight text-text shadow-sm' : 'text-mist hover:text-text'}`}><View size={14} /></button>
            <button onClick={() => setView('day')} className={`p-1.5 rounded-md transition-colors ${calendarView === 'day' ? 'bg-surfaceHighlight text-text shadow-sm' : 'text-mist hover:text-text'}`}><Columns size={14} /></button>
            </div>
            <div className="flex items-center gap-1">
            <button onClick={() => handleNav('prev')} className="p-2 rounded-full text-mist hover:text-text hover:bg-surfaceHighlight transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={() => handleNav('next')} className="p-2 rounded-full text-mist hover:text-text hover:bg-surfaceHighlight transition-colors"><ChevronRight size={20} /></button>
            </div>
        </div>
      </div>
      
      {calendarView === 'month' && renderMonthView()}
      {calendarView === 'week' && renderWeekView()}
      {calendarView === 'day' && renderDayView()}
    </div>
  );
};