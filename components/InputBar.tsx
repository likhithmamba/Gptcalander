import React, { useState, useEffect, useRef } from 'react';
import { useCalendarDispatch } from '../hooks';
import { parseNaturalLanguage } from '../services/geminiService';
import { Zap } from 'lucide-react';

interface Props {
  date: Date;
  onClose: () => void;
  position: { top: number; left: number };
  prefill?: string;
}

export const InlineInput: React.FC<Props> = ({ date, onClose, position, prefill }) => {
  const [text, setText] = useState(prefill || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const dispatch = useCalendarDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (prefill && inputRef.current) {
      inputRef.current.setSelectionRange(prefill.length, prefill.length);
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, prefill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      onClose();
      return;
    }

    setIsAnalyzing(true);
    const aiResult = await parseNaturalLanguage(text);
    setIsAnalyzing(false);

    // Default time logic
    const startTime = new Date(date);
    if (startTime.getHours() === 0 && startTime.getMinutes() === 0) {
        startTime.setHours(9, 0, 0, 0);
    }
    
    const endTime = new Date(startTime.getTime() + (aiResult.duration) * 60 * 1000);

    dispatch({
      type: 'ADD_EVENT',
      payload: {
        id: crypto.randomUUID(),
        title: aiResult.title,
        date: date.toISOString().split('T')[0],
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        category: aiResult.category,
        description: aiResult.description
      },
    });

    onClose();
  };

  const isCentered = position.top === window.innerHeight / 2 && position.left === window.innerWidth / 2;
  const positionStyle = isCentered ? 
    { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } :
    { top: position.top, left: position.left, transform: 'translateY(-50%)' };

  return (
    <div
      className="fixed z-50 p-1"
      style={positionStyle}
    >
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={text}
          disabled={isAnalyzing}
          onChange={(e) => setText(e.target.value)}
          onBlur={isAnalyzing ? undefined : onClose}
          className={`w-72 bg-surfaceHighlight/90 backdrop-blur-xl border ${isAnalyzing ? 'border-secondary animate-pulse' : 'border-primary/50'} text-text placeholder-mist/40 rounded-lg px-4 py-3 text-sm outline-none shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all`}
          placeholder="Meeting with Dev team..."
        />
        {isAnalyzing && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary animate-spin">
                <Zap size={16} fill="currentColor" />
            </div>
        )}
      </form>
    </div>
  );
};