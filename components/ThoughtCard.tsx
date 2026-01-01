import React, { useState } from 'react';
import { Trash2, Zap, MoreHorizontal, CheckCircle2, Circle } from 'lucide-react';
import { Thought } from '../types';
import { analyzeThought } from '../services/geminiService';

interface Props {
  thought: Thought;
  onUpdate: (t: Thought) => void;
  onDelete: (id: string) => void;
  minimal?: boolean;
  style?: React.CSSProperties; // Allow passing external styles (rotation etc)
}

export const ThoughtCard: React.FC<Props> = ({ thought, onUpdate, onDelete, minimal = false, style }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleToggleStatus = () => {
    onUpdate({
      ...thought,
      status: thought.status === 'done' ? 'active' : 'done',
      progress: thought.status === 'done' ? 0 : 100,
    });
  };

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    const result = await analyzeThought(thought.content);
    setSuggestion(result.suggestion);
    onUpdate({ ...thought, intensity: result.intensity });
    setIsAnalyzing(false);
  };

  const isDone = thought.status === 'done';
  
  // Intensity Colors
  const getIntensityStyles = () => {
    if (isDone) return 'border-transparent opacity-60 grayscale';
    switch(thought.intensity) {
        case 'high': return 'border-red-500/40 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)] hover:border-red-500/70';
        case 'medium': return 'border-warning/30 shadow-[0_0_10px_-3px_rgba(245,158,11,0.1)] hover:border-warning/60';
        case 'low': 
        default: return 'border-white/5 hover:border-primary/40';
    }
  };

  return (
    <div 
      className={`
        relative rounded-xl transition-all duration-300 ease-out group
        ${minimal ? 'p-3 bg-transparent border-b border-[#222]' : 'p-5 glass-card'}
        ${getIntensityStyles()}
        ${isHovered ? 'shadow-2xl -translate-y-1 scale-[1.01]' : ''}
      `}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        {/* Interactive Checkbox */}
        <button
          onClick={handleToggleStatus}
          className={`
            mt-1 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
            ${isDone ? 'text-success scale-110' : 'text-mist hover:text-primary hover:scale-110'}
          `}
        >
          {isDone ? <CheckCircle2 size={20} className="fill-success/20" /> : <Circle size={20} />}
        </button>

        <div className="flex-1 min-w-0">
          <div 
            className={`
              text-base font-normal text-text cursor-pointer select-none transition-all leading-relaxed
              ${isDone ? 'line-through text-mist blur-[0.5px]' : ''}
            `}
            onClick={handleToggleStatus}
          >
            {thought.content}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 h-5">
            {/* Meta Tags */}
            {thought.fuzzyLabel && !minimal && (
              <span className="text-[10px] uppercase tracking-widest font-bold text-mist/80 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  {thought.fuzzyLabel}
              </span>
            )}
             {suggestion && (
              <div className="text-[10px] text-accent italic animate-fade-in flex items-center gap-1">
                <Zap size={10} className="fill-accent" /> {suggestion}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Menu */}
        <div className={`
            absolute top-3 right-3 flex items-center gap-1 
            transition-all duration-300 
            ${isHovered || isAnalyzing ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
        `}>
          <button 
            onClick={handleAnalyze} 
            className={`p-2 rounded-lg hover:bg-white/10 text-mist hover:text-accent transition-colors ${isAnalyzing ? 'animate-pulse text-accent' : ''}`}
            title="AI Insight"
          >
            <Zap size={16} />
          </button>
          
          <button 
            onClick={() => onDelete(thought.id)} 
            className="p-2 rounded-lg hover:bg-white/10 text-mist hover:text-danger transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Decorative Glow on Hover */}
      <div className={`
          absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent -z-10
          transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none
      `}></div>
    </div>
  );
};