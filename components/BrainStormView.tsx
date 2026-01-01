import React from 'react';
import { ViewProps } from '../types';
import { Trash2 } from 'lucide-react';

export const BrainStormView: React.FC<ViewProps> = ({ thoughts, onDelete }) => {
  const activeThoughts = thoughts.filter(t => t.status === 'active');

  return (
    <div className="pb-32 px-4 max-w-4xl mx-auto w-full pt-8 animate-fade-in">
      <h2 className="text-3xl font-thin text-glow mb-2 tracking-tight">Brainstorm</h2>
      <p className="text-mist mb-8 text-sm">Non-linear thinking space</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {activeThoughts.map(t => (
          <div 
            key={t.id} 
            className="aspect-square bg-paper border border-[#333] p-4 rounded-lg hover:border-accent transition-colors group relative flex flex-col justify-between"
          >
            <p className="text-sm text-glow font-light leading-relaxed">
              {t.content}
            </p>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity self-end">
               <button 
                  onClick={() => onDelete(t.id)}
                  className="text-mist hover:text-red-400 p-1"
               >
                 <Trash2 size={14} />
               </button>
            </div>
          </div>
        ))}
         {/* Placeholder for new idea visual cue */}
         <div className="aspect-square border border-dashed border-[#333] rounded-lg flex items-center justify-center opacity-30">
            <span className="text-2xl text-mist font-thin">+</span>
         </div>
      </div>
    </div>
  );
};
