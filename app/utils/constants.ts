import { Category } from '@prisma/client';

export const EXPENSE_CATEGORIES = [
  { label: 'Food', value: Category.FOOD, color: 'orange' },
  { label: 'Transport', value: Category.TRANSPORT, color: 'blue' },
  { label: 'Shopping', value: Category.SHOPPING, color: 'red' },
  { label: 'Other', value: Category.OTHER, color: 'cyan' },
];

export const EXPENSE_PAGE_SIZE = 5;
export const BUDGET_PAGE_SIZE = 5;

export const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: undefined,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};
