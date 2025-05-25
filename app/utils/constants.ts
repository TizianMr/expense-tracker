import { Category } from '@prisma/client';

import { supportedLanguages } from './i18n/resource';

export const EXPENSE_CATEGORIES = [
  { labelKey: 'common.categories.food', value: Category.FOOD, color: 'orange' },
  { labelKey: 'common.categories.transport', value: Category.TRANSPORT, color: 'blue' },
  { labelKey: 'common.categories.shopping', value: Category.SHOPPING, color: 'red' },
  { labelKey: 'common.categories.other', value: Category.OTHER, color: 'cyan' },
];

export const NO_CATEGORY = 'none';

export const LOCALES = [
  { label: 'English', value: supportedLanguages[0] },
  { label: 'Deutsch', value: supportedLanguages[1] },
] as const;

export const EXPENSE_PAGE_SIZE = 5;
export const BUDGET_PAGE_SIZE = 6;

export const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: undefined,
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};
