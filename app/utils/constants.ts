import { Category } from '@prisma/client';

export const EXPENSE_CATEGORIES = [
  { labelKey: 'common.categories.food', value: Category.FOOD, color: 'orange' },
  { labelKey: 'common.categories.transport', value: Category.TRANSPORT, color: 'blue' },
  { labelKey: 'common.categories.shopping', value: Category.SHOPPING, color: 'red' },
  { labelKey: 'common.categories.other', value: Category.OTHER, color: 'cyan' },
];

export const LOCALES = [
  { label: 'English', value: 'en' },
  { label: 'Deutsch', value: 'de' },
] as const;

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
