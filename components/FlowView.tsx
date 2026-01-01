import React, { useMemo } from 'react';
import { ViewProps } from '../types';
import { ThoughtCard } from './ThoughtCard';
import { ArrowDown } from 'lucide-react';

export const FlowView: React.FC<ViewProps> = ({ thoughts, onUpdate, onDelete }) => {
  
  const sortedThoughts = useMemo(() => {
    return [...thoughts].sort((a, b) => b.createdAt - a.createdAt);
  }, [thoughts]);

  if (thoughts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-mist opacity-50 animate-fade-in">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#333] flex items-center justify-center mb-4 animate-spin-slow">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
        </div>
        <p className="text-sm font-light tracking-[0.2em] uppercase">Stream Empty</p>
        <p className="text-xs mt-2 text-mist/60">Capture a thought below</p>
      </div>
    );
  }

  return (
    <div className="pb-40 px-4 max-w-3xl mx-auto w-full relative">
      <div className="py-12 relative">
        
        {/* Header with floating effect */}
        <div className="sticky top-24 z-20 mb-16 backdrop-blur-xl py-4 -mx-4 px-4 bg-bg/50 border-b border-white/5">
            <h2 className="text-4xl font-thin text-transparent bg-clip-text bg-gradient-to-r from-white to-mist tracking-tighter">
                Flow
            </h2>
            <div className="h-1 w-12 bg-primary mt-2 rounded-full animate-pulse"></div>
        </div>

        {/* Central Spine */}
        <div className="absolute left-6 md:left-1/2 top-32 bottom-0 w-[2px] bg-gradient-to-b from-primary via-secondary to-transparent opacity-20 hidden md:block"></div>

        <div className="space-y-12">
          {sortedThoughts.map((t, index) => {
             // Alternating layout for desktop
             const isLeft = index % 2 === 0;
             return (
               <div 
                 key={t.id} 
                 className={`
                    relative flex md:items-center 
                    ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}
                    group
                 `}
               >
                 {/* The Node on the spine */}
                 <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0a0a0a] border border-primary z-10 group-hover:scale-150 group-hover:bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>

                 {/* The Content */}
                 <div className="w-full md:w-1/2 md:px-8 pl-0">
                    <div className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <ThoughtCard 
                            thought={t} 
                            onUpdate={onUpdate} 
                            onDelete={onDelete} 
                        />
                    </div>
                 </div>
                 
                 {/* Empty space for the other side */}
                 <div className="hidden md:block w-1/2"></div>
               </div>
             );
          })}
        </div>

        {/* End of Stream Indicator */}
        <div className="flex flex-col items-center justify-center mt-24 opacity-30">
            <ArrowDown className="animate-bounce" />
            <span className="text-xs font-mono uppercase tracking-widest mt-2">End of Stream</span>
        </div>

      </div>
    </div>
  );
};