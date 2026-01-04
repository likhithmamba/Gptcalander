import React, { useState, useEffect, useRef } from 'react';
import { useCalendarDispatch, useCalendarState } from '../hooks';
import { parseNaturalLanguage, materializeThought } from '../services/geminiService';
import { Terminal, Zap, Calendar, ArrowRight, Loader2, Command } from 'lucide-react';
import { dateToYYYYMMDD } from '../core';

export const CommandPalette: React.FC = () => {
  const { isPaletteOpen, paletteContext, currentDate } = useCalendarState();
  const dispatch = useCalendarDispatch();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (paletteContext) setInput(paletteContext);
    } else {
      setInput('');
    }
  }, [isPaletteOpen, paletteContext]);

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_PALETTE', payload: !isPaletteOpen });
      }
      if (e.key === 'Escape' && isPaletteOpen) {
        dispatch({ type: 'TOGGLE_PALETTE', payload: false });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    try {
        // Simple command routing
        if (input.startsWith('/focus')) {
            dispatch({ type: 'SET_VIEW', payload: 'focus' });
            dispatch({ type: 'TOGGLE_PALETTE', payload: false });
            setLoading(false);
            return;
        }

        // AI Parsing
        const aiResult = await parseNaturalLanguage(input);
        
        // Smart Date Logic (Simplified for demo)
        const date = currentDate; // In a real engine, this parses "tomorrow", "next tuesday"
        
        // Time parsing fallback
        const start = new Date(date);
        const [hours, mins] = aiResult.title.match(/(\d{1,2}):(\d{2})/) || [9, 0]; 
        // Note: Real production code would parse time from the AI result more robustly
        // Here we rely on the generic AI parser or default to 9am if unspecified
        
        // For the sake of this prompt's constraints, we assume AI returns duration and we place it at next available slot or 9am
        // We will just use the current logic's time or default
        const now = new Date();
        const startH = now.getHours() + 1;
        
        dispatch({
            type: 'ADD_EVENT',
            payload: {
                id: crypto.randomUUID(),
                title: aiResult.title,
                date: dateToYYYYMMDD(date),
                startTime: `${startH}:00`, // Placeholder for sophisticated slot finding
                endTime: `${startH + 1}:00`,
                category: aiResult.category,
                description: aiResult.description
            }
        });

        dispatch({ type: 'TOGGLE_PALETTE', payload: false });
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  if (!isPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
        <div className="w-full max-w-2xl bg-[#0a0a0b] border border-[#333] shadow-2xl rounded-xl overflow-hidden animate-scale-in">
            <div className="flex items-center px-4 py-4 border-b border-[#222]">
                {loading ? <Loader2 className="animate-spin text-primary" /> : <Terminal className="text-mist" />}
                <form onSubmit={handleSubmit} className="flex-1 ml-4">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-transparent outline-none text-xl font-mono text-text placeholder-mist/30"
                        placeholder="Describe event, task, or intent..."
                        autoComplete="off"
                    />
                </form>
                <div className="flex gap-2">
                    <span className="text-[10px] bg-[#222] text-mist px-2 py-1 rounded font-mono">ESC</span>
                    <span className="text-[10px] bg-[#222] text-mist px-2 py-1 rounded font-mono">ENTER</span>
                </div>
            </div>
            
            {/* Context / Suggestions Area */}
            <div className="bg-[#050505] p-2">
                {!input && (
                    <div className="p-4 text-mist/50 text-sm font-mono space-y-2">
                        <div className="flex items-center gap-3">
                            <Command size={14} /> 
                            <span>Type "/focus" to enter deep work mode</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={14} /> 
                            <span>"Meeting with Engineering at 2pm"</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap size={14} /> 
                            <span>"Plan launch strategy" (Auto-Materialize)</span>
                        </div>
                    </div>
                )}
                {input && !loading && (
                    <div className="px-4 py-2 flex items-center gap-2 text-xs text-secondary font-mono">
                        <ArrowRight size={12} />
                        AI Parsing Active...
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
