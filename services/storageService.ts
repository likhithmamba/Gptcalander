import { Thought } from '../types';

const STORAGE_KEY = 'calander_thoughts_v1';

export const saveThoughts = (thoughts: Thought[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));
  } catch (e) {
    console.error('Failed to save thoughts', e);
  }
};

export const loadThoughts = (): Thought[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load thoughts', e);
    return [];
  }
};
