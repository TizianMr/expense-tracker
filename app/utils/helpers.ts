import clsx, { type ClassValue } from 'clsx';
import { getISOWeek } from 'date-fns';
import { twMerge } from 'tailwind-merge';

import { MONTHS, WEEKDAYS } from './constants';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}

export const getWeekday = (date: Date): string => {
  return WEEKDAYS[date.getDay()];
};

export const getMonth = (date: Date): string => {
  return MONTHS[date.getMonth()];
};

export const getCalenderWeek = (date: Date): string => {
  const weekNumber = getISOWeek(date);
  return `Week ${weekNumber}`;
};
