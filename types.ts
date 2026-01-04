export type EventCategory = 'deep_work' | 'meeting' | 'health' | 'logistics' | 'leisure';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  category: EventCategory;
  description?: string;
  // Engine computed properties for rendering
  _layout?: {
    top: number;
    height: number;
    left: number;
    width: number;
  };
}

export interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface Week {
  days: Day[];
}

export type CalendarViewType = 'timeline' | 'month' | 'week' | 'day';

export interface Thought {
  id: string;
  content: string;
  createdAt: number;
  status: 'pending' | 'processed';
}

export type AppView = 'canvas' | 'focus';

export interface UIState {
  isCommandPaletteOpen: boolean;
  commandMode: 'input' | 'search' | 'action';
  activeDate: Date;
}