import React from 'react';
import { useCalendarState, useCalendarDispatch } from '../hooks';
import { Trash2, CalendarPlus, BrainCircuit } from 'lucide-react';
import { Thought } from '../types';

interface Props {
  onScheduleThought: (id: string) => void;
}

const ThoughtCard: React.FC<{ thought: Thought, onDelete: (id: string) => void, onSchedule: (id: string) => void }> = ({ thought, onDelete, onSchedule }) => {
  return (
    <div className="bg-surface border border-surfaceHighlight p-4 rounded-lg hover:border-primary/50 transition-colors group flex flex-col justify-between animate-scale-in">
      <p className="text-sm text-text font-light leading-relaxed mb-4">
        {thought.content}
      </p>
      <div className="flex justify-end items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onSchedule(thought.id)}
          className="text-mist hover:text-primary p-1"
          title="Schedule this thought"
        >
          <CalendarPlus size={14} />
        </button>
        <button 
          onClick={() => onDelete(thought.id)}
          className="text-mist hover:text-danger p-1"
          title="Delete this thought"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export const BrainStormView: React.FC<Props> = ({ onScheduleThought }) => {
  const { thoughts } = useCalendarState();
  const dispatch = useCalendarDispatch();

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_THOUGHT', payload: id });
  };
  
  const pendingThoughts = thoughts.filter(t => t.status === 'pending');

  return (
    <div className="p-4 md:px-6 md:pb-6 h-full overflow-y-auto animate-fade-in">
      {pendingThoughts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pendingThoughts.map(t => (
            <ThoughtCard 
              key={t.id} 
              thought={t}
              onDelete={handleDelete}
              onSchedule={onScheduleThought}
            />
          ))}
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center text-mist">
            <BrainCircuit size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-text">Your mind is clear.</h3>
            <p className="max-w-xs">Use the input bar at the top to capture thoughts and ideas as they come.</p>
        </div>
      )}
    </div>
  );
};