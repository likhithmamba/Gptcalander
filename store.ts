import React, { createContext, useReducer, Dispatch } from 'react';
import { CalendarEvent, Thought, AppView, CalendarViewType } from './types';
import { loadEvents, saveEvents, loadThoughts, saveThoughts } from './services/storageService';

// State
export interface AppState {
  events: CalendarEvent[];
  thoughts: Thought[];
  currentDate: Date;
  view: AppView; // High level view (Canvas vs Focus)
  calendarView: CalendarViewType;
  isPaletteOpen: boolean;
  paletteContext?: string; // Pre-filled text for the palette
}

// Actions
export type Action =
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_DATE'; payload: Date }
  | { type: 'ADD_THOUGHT'; payload: Thought }
  | { type: 'DELETE_THOUGHT'; payload: string }
  | { type: 'SET_VIEW'; payload: AppView }
  | { type: 'SET_CALENDAR_VIEW'; payload: CalendarViewType }
  | { type: 'TOGGLE_PALETTE'; payload: boolean }
  | { type: 'OPEN_PALETTE_WITH'; payload: string };

// Reducer
const appReducer = (state: AppState, action: Action): AppState => {
  let newEvents, newThoughts;
  switch (action.type) {
    case 'ADD_EVENT':
      newEvents = [...state.events, action.payload];
      saveEvents(newEvents);
      return { ...state, events: newEvents };
    case 'DELETE_EVENT':
      newEvents = state.events.filter(event => event.id !== action.payload);
      saveEvents(newEvents);
      return { ...state, events: newEvents };
    case 'ADD_THOUGHT':
      newThoughts = [...state.thoughts, action.payload];
      saveThoughts(newThoughts);
      return { ...state, thoughts: newThoughts };
    case 'DELETE_THOUGHT':
      newThoughts = state.thoughts.filter(t => t.id !== action.payload);
      saveThoughts(newThoughts);
      return { ...state, thoughts: newThoughts };
    case 'SET_DATE':
      return { ...state, currentDate: action.payload };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_CALENDAR_VIEW':
      return { ...state, calendarView: action.payload };
    case 'TOGGLE_PALETTE':
      return { ...state, isPaletteOpen: action.payload, paletteContext: action.payload ? state.paletteContext : undefined };
    case 'OPEN_PALETTE_WITH':
      return { ...state, isPaletteOpen: true, paletteContext: action.payload };
    default:
      return state;
  }
};

const initialState: AppState = {
  events: loadEvents(),
  thoughts: loadThoughts(),
  currentDate: new Date(),
  view: 'canvas',
  calendarView: 'day',
  isPaletteOpen: false,
};

// Context
// Initialize with undefined to enforce Provider usage
export const AppStateContext = createContext<AppState | undefined>(undefined);
export const AppDispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

// Provider Component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return React.createElement(
    AppStateContext.Provider,
    { value: state },
    React.createElement(
      AppDispatchContext.Provider,
      { value: dispatch },
      children
    )
  );
};
