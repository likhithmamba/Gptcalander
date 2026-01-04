import React, { useState } from 'react';
import { useCalendarDispatch, useCalendarState } from '../hooks';
import { ChevronLeft, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { dateToYYYYMMDD } from '../core';

export const ControlDock: React.FC = () => {
  const dispatch = useCalendarDispatch();
  const { currentDate, view, isPaletteOpen } = useCalendarState();
  const [isHovered, setIsHovered] = useState(false);

  const isToday = dateToYYYYMMDD(currentDate) === dateToYYYYMMDD(new Date());

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    dispatch({ type: 'SET_DATE', payload: newDate });
  };

  return (
    <div 
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-slide-up"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
          flex items-center gap-3 px-2 py-2 rounded-full bg-[#18181b]/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] 
          transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
          ${isHovered ? 'pl-5 pr-2 scale-100 ring-1 ring-white/10' : 'pl-4 pr-2 opacity-90 hover:opacity-100'}
      `}>
        
        {/* Date Context */}
        <button 
            onClick={() => dispatch({ type: 'SET_DATE', payload: new Date() })}
            className="flex flex-col items-start justify-center h-full mr-2 group"
        >
             <span className="text-[10px] font-mono text-mist uppercase leading-none tracking-widest group-hover:text-white transition-colors">
                {currentDate.toLocaleDateString('en-US', { month: 'short' })}
             </span>
             <span className={`text-xl font-medium leading-none font-sans ${isToday ? 'text-white' : 'text-mist group-hover:text-white'}`}>
                {currentDate.getDate()}
             </span>
        </button>

        <div className="w-px h-8 bg-white/10 mx-1"></div>

        {/* Primary Action - The "Brain" */}
        <button 
            onClick={() => dispatch({ type: 'TOGGLE_PALETTE', payload: !isPaletteOpen })} 
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
            title="AI Command (Cmd+K)"
        >
            <Sparkles size={18} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
            <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        {/* Expanded Controls */}
        <div className={`flex items-center gap-1 overflow-hidden transition-all duration-300 ${isHovered ? 'w-auto opacity-100 ml-1' : 'w-0 opacity-0'}`}>
            
            <button 
                onClick={() => dispatch({ type: 'SET_VIEW', payload: view === 'focus' ? 'canvas' : 'focus' })}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${view === 'focus' ? 'bg-white text-black' : 'hover:bg-white/10 text-mist hover:text-white'}`}
                title="Focus Mode"
            >
                <Zap size={18} fill={view === 'focus' ? "currentColor" : "none"} />
            </button>

            <div className="w-px h-4 bg-white/10 mx-1"></div>

            <button onClick={() => changeDate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full text-mist hover:text-white hover:bg-white/10 transition-colors">
                <ChevronLeft size={16} />
            </button>
            <button onClick={() => changeDate(1)} className="w-8 h-8 flex items-center justify-center rounded-full text-mist hover:text-white hover:bg-white/10 transition-colors">
                <ChevronRight size={16} />
            </button>
        </div>

      </div>
    </div>
  );
}