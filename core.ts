import { Day, Week } from './types';

// --- date.utils.ts ---

export const getMonthName = (date: Date, locale = 'en-US') => {
  return date.toLocaleString(locale, { month: 'long' });
};

export const getYear = (date: Date) => {
  return date.getFullYear();
};

export const areDatesEqual = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const dateToYYYYMMDD = (date: Date) => {
  return date.toISOString().split('T')[0];
};


// --- view.generator.ts ---

export const generateMonthView = (targetDate: Date): Week[] => {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const today = new Date();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start grid on Sunday

  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End grid on Saturday

  const weeks: Week[] = [];
  let currentWeek: Day[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    currentWeek.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: areDatesEqual(currentDate, today),
    });

    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weeks;
};
