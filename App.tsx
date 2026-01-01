import React, { useState, useEffect, useCallback } from 'react';
import { FlowView } from './components/FlowView';
import { PressureView } from './components/PressureView';
import { BrainStormView } from './components/BrainstormView';
import { CalendarView } from './components/CalendarView';
import { InputBar } from './components/InputBar';
import { Thought, ViewMode, FuzzyTime } from './types';
import { loadThoughts, saveThoughts } from './services/storageService';
import { Layers, Activity, Grid, Calendar as CalendarIcon } from 'lucide-react';

export default function App() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [view, setView] = useState<ViewMode>('calendar'); // Default to calendar now

  // Initial load
  useEffect(() => {
    const loaded = loadThoughts();
    setThoughts(loaded);
  }, []);

  // Persistence
  useEffect(() => {
    saveThoughts(thoughts);
  }, [thoughts]);

  const addThought = useCallback((content: string, fuzzyTime?: FuzzyTime, date?: string) => {
    const newThought: Thought = {
      id: crypto.randomUUID(),
      content,
      createdAt: Date.now(),
      status: 'active',
      timeType: date ? 'specific' : (fuzzyTime ? 'fuzzy' : 'none'),
      specificDate: date,
      fuzzyLabel: fuzzyTime,
      progress: 0,
      intensity: 'low'
    };
    setThoughts(prev => [newThought, ...prev]);
  }, []);

  const updateThought = useCallback((updated: Thought) => {
    setThoughts(prev => prev.map(t => t.id === updated.id ? updated : t));
  }, []);

  const deleteThought = useCallback((id: string) => {
    setThoughts(prev => prev.filter(t => t.id !== id));
  }, []);

  const renderView = () => {
    const commonProps = { thoughts, onUpdate: updateThought, onDelete: deleteThought };
    switch (view) {
      case 'calendar': return <CalendarView {...commonProps} />;
      case 'pressure': return <PressureView {...commonProps} />;
      case 'brainstorm': return <BrainStormView {...commonProps} />;
      case 'flow': 
      default: return <FlowView {...commonProps} />;
    }
  };

  const NavButton = ({ mode, icon: Icon, label }: { mode: ViewMode, icon: any, label: string }) => (
    <button 
      onClick={() => setView(mode)}
      className={`relative p-2 rounded-xl transition-all duration-300 group ${view === mode ? 'bg-surfaceHighlight text-white shadow-lg' : 'text-mist hover:text-text hover:bg-white/5'}`}
      title={label}
    >
      <Icon size={20} strokeWidth={1.5} />
      {view === mode && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col relative font-sans selection:bg-primary/30 selection:text-white pb-24">
      {/* Top Bar - Glassmorphism */}
      <nav className="sticky top-0 z-40 px-6 py-4 flex justify-between items-center glass-panel border-b border-white/5 mx-4 mt-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
          <h1 className="text-xl font-bold tracking-tighter text-white">CALANDER</h1>
        </div>
        
        <div className="flex gap-1">
          <NavButton mode="flow" icon={Layers} label="Flow" />
          <NavButton mode="calendar" icon={CalendarIcon} label="Calendar" />
          <NavButton mode="pressure" icon={Activity} label="Pressure" />
          <NavButton mode="brainstorm" icon={Grid} label="Brainstorm" />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
        {renderView()}
      </main>

      {/* Input */}
      <InputBar onAdd={addThought} />
    </div>
  );
}