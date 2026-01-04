import { CalendarEvent, Thought } from '../types';

const EVENTS_STORAGE_KEY = 'minimal_calendar_events_v1';
const THOUGHTS_STORAGE_KEY = 'minimal_calendar_thoughts_v1';

// --- Events ---
export const saveEvents = (events: CalendarEvent[]) => {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events', e);
  }
};

export const loadEvents = (): CalendarEvent[] => {
  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load events', e);
    return [];
  }
};

// --- Thoughts ---
export const saveThoughts = (thoughts: Thought[]) => {
  try {
    localStorage.setItem(THOUGHTS_STORAGE_KEY, JSON.stringify(thoughts));
  } catch (e) {
    console.error('Failed to save thoughts', e);
  }
};

export const loadThoughts = (): Thought[] => {
  try {
    const stored = localStorage.getItem(THOUGHTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load thoughts', e);
    return [];
  }
};