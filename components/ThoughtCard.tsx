import React from 'react';
import { CalendarEvent } from '../types';

interface Props {
  event: CalendarEvent;
  onClick: () => void;
}

export const ThoughtCard: React.FC<Props> = React.memo(({ event, onClick }) => {
  // Category-based coloring (border & subtle bg)
  const getStyle = () => {
      switch(event.category) {
          case 'deep_work': return 'border-l-2 border-secondary bg-secondary/10 text-secondary-50';
          case 'meeting': return 'border-l-2 border-primary bg-primary/10 text-primary-50';
          case 'health': return 'border-l-2 border-success bg-success/10 text-success-50';
          case 'leisure': return 'border-l-2 border-warning bg-warning/10 text-warning-50';
          default: return 'border-l-2 border-mist bg-surfaceHighlight text-mist';
      }
  }

  return (
    <div
      onClick={onClick}
      className={`text-xs px-2 py-1 mb-1 rounded-r-md text-left transition-all duration-200 cursor-pointer truncate hover:brightness-125 ${getStyle()}`}
      title={`${event.startTime} - ${event.title}`}
    >
      <span className="font-mono opacity-70 mr-1.5">{event.startTime}</span>
      <span className="font-medium">{event.title}</span>
    </div>
  );
});