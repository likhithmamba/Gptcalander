import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Calendar, Plus } from 'lucide-react';
import { FuzzyTime } from '../types';

interface Props {
  onAdd: (text: string, fuzzyTime?: FuzzyTime, date?: string) => void;
}

export const InputBar: React.FC<Props> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    
    // Simple heuristic parser for fuzzy time if no specific date is selected
    let content = text;
    let fuzzyTime: FuzzyTime | undefined;
    
    const lower = text.toLowerCase();
    if (lower.includes('morning')) fuzzyTime = 'morning';
    else if (lower.includes('afternoon')) fuzzyTime = 'afternoon';
    else if (lower.includes('evening')) fuzzyTime = 'evening';
    else if (lower.includes('tonight')) fuzzyTime = 'tonight';
    else if (lower.includes('soon')) fuzzyTime = 'soon';
    else if (lower.includes('later')) fuzzyTime = 'later';

    onAdd(content, fuzzyTime, selectedDate || undefined);
    
    // Reset
    setText('');
    setSelectedDate('');
    setShowDatePicker(false);
  };

  const setTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full glass-input pb-6 pt-4 px-4 z-50">
      <div className="max-w-2xl mx-auto space-y-3">
        
        {/* Helper Chips & Date Indicator */}
        <div className="flex items-center justify-between px-1">
           <div className="flex gap-2">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`text-xs px-2 py-1 rounded-md border transition-colors flex items-center gap-1 ${selectedDate ? 'bg-primary/20 border-primary text-primary' : 'border-[#333] text-mist hover:text-text'}`}
              >
                <Calendar size={12} />
                {selectedDate ? selectedDate : 'Date'}
              </button>
              
              {!selectedDate && (
                <button 
                  onClick={setTomorrow}
                  className="text-xs px-2 py-1 rounded-md border border-[#333] text-mist hover:text-text hover:bg-surfaceHighlight transition-colors"
                >
                  + Tomorrow
                </button>
              )}
           </div>
           
           <div className="text-[10px] text-mist font-mono opacity-50 hidden md:block">
             ENTER to save
           </div>
        </div>

        {/* Date Picker Collapse */}
        {showDatePicker && (
          <div className="animate-fade-in bg-surface p-2 rounded-lg border border-[#333] absolute bottom-24 left-4 right-4 md:left-auto md:right-auto md:w-64">
            <input 
              type="date" 
              className="w-full bg-[#111] border border-[#333] text-text rounded p-2 text-sm outline-none focus:border-primary"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        )}

        {/* Main Input */}
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Capture a thought..."
            className="w-full bg-[#0a0a0a] border border-[#333] text-text placeholder-mist/40 rounded-xl px-4 py-3 pr-12 text-base outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all shadow-inner"
            autoComplete="off"
          />
          <button 
            onClick={() => handleSubmit()}
            className={`absolute right-2 top-2 p-1.5 rounded-lg bg-primary text-white hover:bg-indigo-500 transition-all duration-300 ${text.trim() ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};