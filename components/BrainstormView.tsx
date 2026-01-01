import React from 'react';
import { ViewProps } from '../types';
import { ThoughtCard } from './ThoughtCard';
import { Sparkles } from 'lucide-react';

export const BrainStormView: React.FC<ViewProps> = ({ thoughts, onUpdate, onDelete }) => {
  const activeThoughts = thoughts.filter(t => t.status === 'active');

  // Pseudo-random generator for consistent rotations per render
  const getRandomRotation = (id: string) => {
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (seed % 6) - 3; // -3deg to +3deg
  };

  return (
    <div className="pb-40 px-4 w-full pt-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12 animate-fade-in">
             <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/20">
                <Sparkles className="text-secondary" size={24} />
             </div>
             <div>
                <h2 className="text-3xl font-light tracking-tight text-white">Chaos Wall</h2>
                <p className="text-mist text-sm">Organic arrangement of your active mind.</p>
             </div>
          </div>
          
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 perspective-1000">
            {activeThoughts.map((t, i) => {
              const rotation = getRandomRotation(t.id);
              
              return (
                <div 
                    key={t.id} 
                    className="break-inside-avoid animate-scale-in origin-center"
                    style={{ 
                        animationDelay: `${i * 0.05}s`,
                    }}
                >
                  <ThoughtCard 
                    thought={t}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  />
                  {/* Connector visual just for flair */}
                  <div className="flex justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1 h-1 rounded-full bg-mist/30"></div>
                  </div>
                </div>
              );
            })}
            
            {/* "Add New" Placeholder Ghost */}
            <div className="break-inside-avoid p-8 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center opacity-40 hover:opacity-80 hover:border-accent/50 transition-all cursor-default min-h-[150px]">
                <span className="text-4xl font-thin text-mist">+</span>
            </div>
          </div>
      </div>
    </div>
  );
};