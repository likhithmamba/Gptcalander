export type FuzzyTime = 'morning' | 'afternoon' | 'evening' | 'tonight' | 'soon' | 'later';

export type TimeType = 'none' | 'specific' | 'fuzzy';

export interface Thought {
  id: string;
  content: string;
  createdAt: number;
  status: 'active' | 'done' | 'archived';
  timeType: TimeType;
  specificDate?: string; // ISO string
  fuzzyLabel?: FuzzyTime;
  progress: number; // 0-100
  intensity: 'low' | 'medium' | 'high';
}

export type ViewMode = 'flow' | 'pressure' | 'brainstorm' | 'calendar';

export interface ViewProps {
  thoughts: Thought[];
  onUpdate: (thought: Thought) => void;
  onDelete: (id: string) => void;
}