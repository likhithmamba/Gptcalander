import { CalendarEvent, RenderableEvent } from '../types';

/**
 * CONSTANTS
 * Defining the physics of the calendar surface.
 */
export const HOUR_HEIGHT = 80; // Pixels per hour
export const START_HOUR = 0;   // 12 AM
export const END_HOUR = 24;    // 12 AM next day
export const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

/**
 * TIME MATH
 * Deterministic helpers for time conversion.
 */
export const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return (h * 60) + m;
};

export const minutesToPixels = (minutes: number): number => {
  return (minutes / 60) * HOUR_HEIGHT;
};

/**
 * COLLISION & LAYOUT ENGINE
 * Resolves overlapping events into visual columns.
 */
export const computeLayout = (events: CalendarEvent[]): RenderableEvent[] => {
  if (events.length === 0) return [];

  // 1. Sort by start time, then duration (longest first)
  const sorted = [...events].sort((a, b) => {
    const startDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    if (startDiff !== 0) return startDiff;
    const durA = timeToMinutes(a.endTime) - timeToMinutes(a.startTime);
    const durB = timeToMinutes(b.endTime) - timeToMinutes(b.startTime);
    return durB - durA;
  });

  const renderables: RenderableEvent[] = [];
  const columns: RenderableEvent[][] = [];

  // 2. Pack events into overlapping groups (columns)
  // Simple greedy packing: Try to fit in existing column, else create new one.
  // Note: A true production engine uses a graph-coloring approach for optimal packing.
  // This is a robust "visual column" approach.
  
  for (const event of sorted) {
    const start = timeToMinutes(event.startTime);
    const end = timeToMinutes(event.endTime);
    const top = minutesToPixels(start);
    const height = Math.max(minutesToPixels(end - start), 25); // Min height 25px

    // Find a column that this event fits into without overlap
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const lastInCol = col[col.length - 1];
        const lastEnd = timeToMinutes(lastInCol.endTime);
        
        // If the event starts after the last event in this column ends
        if (start >= lastEnd) {
            col.push({ 
                ...event, 
                layout: { top, height, left: 0, width: 0, zIndex: 10 + i } 
            });
            placed = true;
            break;
        }
    }

    if (!placed) {
        columns.push([{ 
            ...event, 
            layout: { top, height, left: 0, width: 0, zIndex: 10 + columns.length } 
        }]);
    }
  }

  // 3. Calculate Widths and Offsets based on columns
  // This is a simplification: We assume if columns exist, they share the width equally.
  // A more complex engine detects disjoint groups.
  
  const widthPerCol = 100 / columns.length;
  
  columns.forEach((col, colIndex) => {
      col.forEach(evt => {
          evt.layout.left = colIndex * widthPerCol;
          evt.layout.width = widthPerCol;
          renderables.push(evt);
      });
  });

  return renderables;
};
