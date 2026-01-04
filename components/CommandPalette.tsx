import React, { useState, useEffect, useRef } from 'react';
import { useCalendarDispatch, useCalendarState } from '../hooks';
import { parseNaturalLanguage } from '../services/geminiService';
import { Loader2, Sparkles, CornerDownLeft } from 'lucide-react';
import { dateToYYYYMMDD } from '../core';

const SUGGESTIONS = [
    "Lunch with Sarah at 12:30 for 1h",
    "Deep work on Q4 Strategy for 2 hours",
    "Gym session at 6pm",
    "Weekly sync tomorrow at 10am"
];

export const CommandPalette: React.FC = () => {
  const { isPaletteOpen, paletteContext, currentDate } = useCalendarState();
  const dispatch = useCalendarDispatch();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useEffect(() => {
    if (isPaletteOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
      if (paletteContext) setInput(paletteContext + ' ');
    } else {
      setInput('');
      setIsProcessing(false);
    }
  }, [isPaletteOpen, paletteContext]);

  // Cycle suggestions
  useEffect(() => {
      const interval = setInterval(() => {
          setSuggestionIndex(prev => (prev + 1) % SUGGESTIONS.length);
      }, 3000);
      return () => clearInterval(interval);
  }, []);

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_PALETTE', payload: !isPaletteOpen });
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'TOGGLE_PALETTE', payload: false });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaletteOpen, dispatch]);

  const executeCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);

    try {
        if (input.trim() === '/focus') {
            dispatch({ type: 'SET_VIEW', payload: 'focus' });
            dispatch({ type: 'TOGGLE_PALETTE', payload: false });
            return;
        }

        const aiResult = await parseNaturalLanguage(input);
        
        const now = new Date();
        let startHour = now.getHours() + 1; 
        let startMin = 0;
        const timeMatch = aiResult.title.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            startHour = parseInt(timeMatch[1]);
            startMin = parseInt(timeMatch[2]);
        }
        
        const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
        const durationMins = aiResult.duration || 60;
        const totalStartMins = startHour * 60 + startMin;
        const totalEndMins = totalStartMins + durationMins;
        const endTimeStr = `${(Math.floor(totalEndMins / 60) % 24).toString().padStart(2, '0')}:${(totalEndMins % 60).toString().padStart(2, '0')}`;

        dispatch({
            type: 'ADD_EVENT',
            payload: {
                id: crypto.randomUUID(),
                title: aiResult.title,
                date: dateToYYYYMMDD(currentDate),
                startTime: startTimeStr,
                endTime: endTimeStr,
                category: aiResult.category,
                description: aiResult.description
            }
        });

        dispatch({ type: 'TOGGLE_PALETTE', payload: false });

    } catch (error) {
        console.error("Exec failed", error);
    } finally {
        setIsProcessing(false);
    }
  };

  if (!isPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[15vh] animate-fade-in transition-all">
        <div className="w-full max-w-xl bg-[#09090b] border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden animate-slide-up ring-1 ring-white/5">
            
            {/* Input Area */}
            <div className="flex items-center px-6 py-5 relative">
                <form onSubmit={executeCommand} className="flex-1 flex items-center gap-4">
                    {isProcessing ? (
                         <Loader2 className="animate-spin text-white" size={24} />
                    ) : (
                         <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 animate-pulse-subtle flex items-center justify-center shadow-glow">
                             <Sparkles size={14} className="text-white" />
                         </div>
                    )}
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-transparent outline-none text-2xl font-light text-white placeholder-white/20 caret-purple-500"
                        placeholder="Describe your intent..."
                        autoComplete="off"
                        autoFocus
                    />
                </form>
            </div>

            {/* Suggestions / Context */}
            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-xs text-mist font-mono">
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-white/30 uppercase tracking-widest">Try:</span>
                    <span className="text-mist/70 truncate animate-fade-in key-{suggestionIndex}">"{SUGGESTIONS[suggestionIndex]}"</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 opacity-50">
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-sans">ESC</kbd>
                        <span>Cancel</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80">
                        <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-sans">↵</kbd>
                        <span>Execute</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};