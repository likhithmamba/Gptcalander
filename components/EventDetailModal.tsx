import React from 'react';
import { CalendarEvent } from '../types';
import { useCalendarDispatch } from '../hooks';
import { Trash2, X, Play } from 'lucide-react';

interface Props {
  event: CalendarEvent;
  onClose: () => void;
}

export const EventDetailModal: React.FC<Props> = ({ event, onClose }) => {
  const dispatch = useCalendarDispatch();

  const handleDelete = () => {
    dispatch({ type: 'DELETE_EVENT', payload: event.id });
    onClose();
  };

  const startFocus = () => {
      onClose();
      dispatch({ type: 'SET_VIEW', payload: 'focus' });
  }

  const categoryColor = 
    event.category === 'deep_work' ? 'text-secondary' :
    event.category === 'meeting' ? 'text-primary' :
    event.category === 'health' ? 'text-success' : 'text-mist';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f10] w-full max-w-sm rounded-xl border border-surfaceHighlight p-6 shadow-2xl animate-scale-in relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decor stripe */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-current ${categoryColor} opacity-50`}></div>

        <div className="flex justify-between items-start mb-6">
            <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest ${categoryColor} border border-current px-2 py-0.5 rounded-full opacity-70`}>
                    {event.category.replace('_', ' ')}
                </span>
                <h2 className="text-xl font-medium text-text mt-3 leading-snug">{event.title}</h2>
            </div>
          <button onClick={onClose} className="text-mist hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm text-mist border-b border-white/5 pb-2">
                <span>Date</span>
                <span className="text-text">{event.date}</span>
            </div>
            <div className="flex justify-between text-sm text-mist border-b border-white/5 pb-2">
                <span>Time</span>
                <span className="text-text">{event.startTime} - {event.endTime}</span>
            </div>
            {event.description && (
                <p className="text-sm text-mist/80 italic mt-2 bg-surfaceHighlight/30 p-3 rounded-lg">
                    "{event.description}"
                </p>
            )}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={startFocus}
            className="flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2.5 bg-text text-bg font-bold rounded-lg hover:bg-white transition-colors"
          >
            <Play size={14} fill="currentColor" />
            Focus
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center justify-center w-10 h-10 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};