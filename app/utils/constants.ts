import { Category } from '@prisma/client';

export const EXPENSE_CATEGORIES = [
  { label: 'Food', value: Category.FOOD, color: 'orange' },
  { label: 'Transport', value: Category.TRANSPORT, color: 'blue' },
  { label: 'Shopping', value: Category.SHOPPING, color: 'red' },
  { label: 'Other', value: Category.OTHER, color: 'cyan' },
];

export const EXPENSE_PAGE_SIZE = 5;
export const BUDGET_PAGE_SIZE = 6;

export const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: undefined,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
