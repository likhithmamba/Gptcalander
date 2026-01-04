import { useContext } from 'react';
import { AppStateContext, AppDispatchContext } from './store';

export const useCalendarState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useCalendarState must be used within an AppProvider');
  }
  return context;
};

export const useCalendarDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useCalendarDispatch must be used within an AppProvider');
  }
  return context;
};
