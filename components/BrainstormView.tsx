import React, { useState } from 'react';
import { useCalendarState, useCalendarDispatch } from '../hooks';
import { Trash2, CalendarPlus, BrainCircuit, Wand2, Loader2 } from 'lucide-react';
import { Thought } from '../types';
import { materializeThought } from '../services/geminiService';

interface Props {
  onScheduleThought: (id: string) => void;
}

const ThoughtCard: React.FC<{ 
    thought: Thought, 
    onDelete: (id: string) => void, 
    onSchedule: (id: string) => void,
    onMaterialize: (t: Thought) => void,
    isProcessing: boolean
}> = ({ thought, onDelete, onSchedule, onMaterialize, isProcessing }) => {
  return (
    <div className="bg-surface/40 backdrop-blur-md border border-surfaceHighlight p-5 rounded-xl hover:border-primary/50 hover:bg-surface/60 transition-all group flex flex-col justify-between animate-scale-in h-48 relative overflow-hidden">
      
      {isProcessing && (
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm z-10 flex items-center justify-center flex-col gap-2">
              <Loader2 className="animate-spin text-secondary" size={24} />
              <span className="text-xs text-secondary font-mono animate-pulse">MATERIALIZING PLAN...</span>
          </div>
      )}

      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
           <button 
              onClick={() => onMaterialize(thought)}
              className="p-1.5 rounded-md bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-colors"
              title="AI Materialize: Turn into a plan"
            >
              <Wand2 size={14} />
            </button>
            <button 
              onClick={() => onDelete(thought.id)}
              className="p-1.5 rounded-md hover:bg-danger/10 hover:text-danger text-mist transition-colors"
            >
              <Trash2 size={14} />
            </button>
      </div>

      <p className="text-base text-text font-light leading-relaxed mt-2 line-clamp-4">
        {thought.content}
      </p>

      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-[10px] text-mist font-mono">ID: {thought.id.slice(0,4)}</span>
          <button 
            onClick={() => onSchedule(thought.id)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-light transition-colors"
          >
            <CalendarPlus size={14} />
            <span>Schedule Manually</span>
          </button>
      </div>
    </div>
  )
}

export const BrainStormView: React.FC<Props> = ({ onScheduleThought }) => {
  const { thoughts } = useCalendarState();
  const dispatch = useCalendarDispatch();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleDelete = (id: string) => dispatch({ type: 'DELETE_THOUGHT', payload: id });

  const handleMaterialize = async (thought: Thought) => {
      setProcessingId(thought.id);
      const plan = await materializeThought(thought.content);
      
      // Dispatch all generated tasks
      const today = new Date();
      plan.tasks.forEach(task => {
          const taskDate = new Date(today);
          taskDate.setDate(today.getDate() + task.offsetDays);
          
          // Simple time slotting: 10am start
          const start = new Date(taskDate);
          start.setHours(10, 0, 0, 0);
          const end = new Date(start.getTime() + task.duration * 60000);

          dispatch({
              type: 'ADD_EVENT',
              payload: {
                  id: crypto.randomUUID(),
                  title: task.title,
                  date: taskDate.toISOString().split('T')[0],
                  startTime: start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}),
                  endTime: end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}),
                  category: task.category,
                  description: 'AI Materialized'
              }
          });
      });

      // Remove the thought after processing
      dispatch({ type: 'DELETE_THOUGHT', payload: thought.id });
      setProcessingId(null);
  };
  
  const pendingThoughts = thoughts.filter(t => t.status === 'pending');

  return (
    <div className="p-6 h-full overflow-y-auto animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-text">Nexus Storage</h2>
            <p className="text-mist text-sm mt-1">Buffer for raw concepts. Use <span className="text-secondary"><Wand2 size={12} className="inline"/> Materialize</span> to auto-plan.</p>
          </div>
          <div className="px-3 py-1 bg-surfaceHighlight rounded-full text-xs font-mono text-mist">
              COUNT: {pendingThoughts.length}
          </div>
      </div>

      {pendingThoughts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pendingThoughts.map(t => (
            <ThoughtCard 
              key={t.id} 
              thought={t}
              onDelete={handleDelete}
              onSchedule={onScheduleThought}
              onMaterialize={handleMaterialize}
              isProcessing={processingId === t.id}
            />
          ))}
        </div>
      ) : (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center text-mist border-2 border-dashed border-surfaceHighlight rounded-3xl opacity-50">
            <BrainCircuit size={64} className="mb-6 opacity-20" />
            <h3 className="text-lg font-semibold text-text opacity-50">Nexus Empty</h3>
            <p className="max-w-xs opacity-50">Input new signals above.</p>
        </div>
      )}
    </div>
  );
};