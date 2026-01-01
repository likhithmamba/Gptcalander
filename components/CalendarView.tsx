import React, { useState, useMemo } from 'react';
import { ViewProps, Thought } from '../types';
import { ThoughtCard } from './ThoughtCard';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, List, Flame } from 'lucide-react';

export const CalendarView: React.FC<ViewProps> = ({ thoughts, onUpdate, onDelete }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [viewMode, setViewMode] = useState<'month' | 'schedule'>('month');

  // --- Calendar Logic ---
  const { daysInMonth, firstDayOfMonth, year, month } = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
    return { daysInMonth, firstDayOfMonth, year, month };
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // --- Data Logic ---
  const { tasksByDate, activeDates } = useMemo(() => {
    const map: Record<string, Thought[]> = {};
    const active = new Set<string>();

    thoughts.forEach(t => {
      if (t.status !== 'active') return;
      
      let key = t.specificDate;
      if (!key) {
        const todayKey = new Date().toISOString().split('T')[0];
        if (!t.fuzzyLabel || ['morning', 'afternoon', 'evening', 'tonight'].includes(t.fuzzyLabel)) {
           key = todayKey;
        }
      }

      if (key) {
        if (!map[key]) map[key] = [];
        map[key].push(t);
        active.add(key);
      }
    });
    return { tasksByDate: map, activeDates: active };
  }, [thoughts]);

  // Generate grid cells
  const gridCells = [];
  // Padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    gridCells.push(<div key={`pad-${i}`} className="h-20 md:h-28 bg-transparent" />);
  }
  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = dateKey === selectedDate;
    const isToday = dateKey === new Date().toISOString().split('T')[0];
    const hasTasks = activeDates.has(dateKey);
    const dayTasks = tasksByDate[dateKey] || [];
    
    // Intensity Heatmap Logic
    const highIntensityCount = dayTasks.filter(t => t.intensity === 'high').length;
    let bgGlow = '';
    if (highIntensityCount > 1) bgGlow = 'bg-red-900/10 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]';
    else if (dayTasks.length > 2) bgGlow = 'bg-primary/5 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]';

    gridCells.push(
      <div 
        key={d}
        onClick={() => setSelectedDate(dateKey)}
        className={`
          relative h-20 md:h-28 border-r border-b border-[#222] p-2 cursor-pointer transition-all duration-300 group
          ${isSelected ? 'bg-white/5 ring-1 ring-inset ring-white/10 z-10' : 'hover:bg-white/5'}
          ${isToday ? 'bg-surfaceHighlight' : ''}
          ${bgGlow}
        `}
      >
        <div className="flex justify-between items-start">
          <span 
            className={`
              text-xs font-medium w-7 h-7 flex items-center justify-center rounded-lg transition-all
              ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-mist group-hover:text-white group-hover:bg-white/10'}
            `}
          >
            {d}
          </span>
          {highIntensityCount > 0 && <Flame size={12} className="text-red-500/50 animate-pulse" />}
        </div>
        
        {/* Task Dots */}
        <div className="flex flex-wrap gap-1 content-end h-full pb-2 pl-1">
           {dayTasks.slice(0, 6).map((t, i) => (
             <div 
                key={t.id} 
                className={`w-1.5 h-1.5 rounded-full ${t.intensity === 'high' ? 'bg-red-500' : 'bg-primary'} ${i > 3 ? 'opacity-50' : 'opacity-100'}`}
             ></div>
           ))}
        </div>
      </div>
    );
  }

  const selectedDateObj = new Date(selectedDate);
  const prettyDate = selectedDateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const selectedTasks = tasksByDate[selectedDate] || [];

  return (
    <div className="pb-40 px-2 md:px-4 max-w-5xl mx-auto w-full pt-8">
      
      {/* Controls */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-light text-white tracking-tighter">
            {currentMonth.toLocaleDateString(undefined, { month: 'long' })}
            <span className="text-mist ml-2 font-thin">{year}</span>
          </h2>
          <div className="flex items-center gap-1 bg-surfaceHighlight/50 rounded-full p-1 border border-white/5 backdrop-blur-md">
             <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full text-mist hover:text-white transition-colors"><ChevronLeft size={18} /></button>
             <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full text-mist hover:text-white transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="flex gap-1 bg-surfaceHighlight/50 p-1 rounded-xl border border-white/5 backdrop-blur-md">
           <button 
             onClick={() => setViewMode('month')} 
             className={`p-2.5 rounded-lg transition-all ${viewMode === 'month' ? 'bg-white/10 text-white shadow-inner' : 'text-mist hover:text-white'}`}
           >
             <CalIcon size={18} />
           </button>
           <button 
             onClick={() => setViewMode('schedule')} 
             className={`p-2.5 rounded-lg transition-all ${viewMode === 'schedule' ? 'bg-white/10 text-white shadow-inner' : 'text-mist hover:text-white'}`}
           >
             <List size={18} />
           </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="animate-fade-in">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] uppercase tracking-widest text-mist/60 font-mono">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="glass-panel grid grid-cols-7 border-t border-l border-[#222] rounded-2xl overflow-hidden mb-12 shadow-2xl">
            {gridCells}
          </div>
        </div>
      ) : (
         <div className="text-center py-12 border border-dashed border-white/10 rounded-xl mb-12">
            <p className="text-mist">Timeline view active</p>
         </div>
      )}

      {/* Selected Day Agenda */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 animate-slide-up">
        <div className="text-right md:border-r border-white/10 md:pr-8 pt-2">
           <h3 className="text-4xl font-thin text-white mb-1">{selectedDateObj.getDate()}</h3>
           <p className="text-accent uppercase tracking-widest text-xs font-bold mb-4">{selectedDateObj.toLocaleDateString(undefined, { weekday: 'long' })}</p>
           {selectedTasks.length === 0 && <span className="text-mist text-sm italic">Free Day</span>}
        </div>

        <div className="space-y-4">
           {selectedTasks.length > 0 ? (
             selectedTasks.map(t => (
               <ThoughtCard key={t.id} thought={t} onUpdate={onUpdate} onDelete={onDelete} />
             ))
           ) : (
             <div className="h-32 flex items-center justify-start text-mist/40 border-l-2 border-dashed border-white/5 pl-8">
               <p>No tasks scheduled.</p>
             </div>
           )}
        </div>
      </div>

    </div>
  );
};