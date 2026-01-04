export type EventCategory = 'deep_work' | 'meeting' | 'health' | 'logistics' | 'leisure';

// 1. Domain Model (Immutable Source of Truth)
export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  category: EventCategory;
  description?: string;
}

// 2. Engine Model (Computed Layout)
export interface RenderableEvent extends CalendarEvent {
  layout: {
    top: number;    // CSS pixels
    height: number; // CSS pixels
    left: number;   // CSS percentage (0-100)
    width: number;  // CSS percentage (0-100)
    zIndex: number;
  };
}

export type AppView = 'canvas' | 'focus';
export type CalendarViewType = 'day' | 'week' | 'month';

// 3. Interaction State
export interface UIState {
  isPaletteOpen: boolean;
  paletteContext?: string; // e.g., "Schedule at 2pm..."
  activeDate: Date;
  view: AppView;
}

// 4. Brainstorming / Thoughts
export interface Thought {
  id: string;
  content: string;
  status: 'pending' | 'scheduled' | 'done';
  createdAt?: string;
}

// 5. Calendar Generation
export interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface Week {
  days: Day[];
}