import { Expense } from '@prisma/client';
import {
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  getISOWeek,
  addWeeks,
} from 'date-fns';

import { EXPENSE_CATEGORIES, MONTHS, WEEKDAYS } from '~/utils/constants';
import { getCalenderWeek, getMonth, getWeekday } from '~/utils/helpers';

type Statistics = {
  period: 'week' | 'month' | 'year';
  expensesByCategory: {
    totalUsed: number;
    categories: {
      category: string;
      amount: number;
      share: number;
    }[];
  };
  expensesByPeriod: {
    name: string;
    amount: number;
  }[];
};

export const fetchStatistics = async (period: 'week' | 'month' | 'year'): Promise<Statistics> => {
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'week':
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      break;
    case 'month':
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
      break;
    case 'year':
      startDate = startOfYear(new Date());
      endDate = endOfYear(new Date());
      break;
  }

  const expenses = await prisma.expense.findMany({
    where: {
      expenseDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      amount: true,
      expenseDate: true,
      category: true,
    },
  });

  const expensesByCategory = calculateExpensesByCategory(expenses);
  const expensesByPeriod = calculateExpensesByPeriod(expenses, period);

  return {
    period,
    expensesByCategory,
    expensesByPeriod,
  };
};

const calculateExpensesByCategory = (expenses: Pick<Expense, 'amount' | 'expenseDate' | 'category'>[]) => {
  const expensesByCategory: Statistics['expensesByCategory']['categories'] = EXPENSE_CATEGORIES.map(category => ({
    category: category.value,
    amount: 0,
    share: 0,
  }));
  expensesByCategory.push({ category: 'NO CATEGORY', amount: 0, share: 0 });

  // Calculate amount per category
  expenses.forEach(expense => {
    const categoryEntry =
      expensesByCategory.find(ebc => ebc.category === expense.category) ||
      expensesByCategory.find(ebc => ebc.category === 'NO CATEGORY');
    if (categoryEntry) {
      categoryEntry.amount += expense.amount;
    }
  });

  // Calculate total used budget
  const totalUsed = expensesByCategory.reduce((sum, category) => sum + category.amount, 0);

  // Calculate share per category
  expensesByCategory.forEach(expense => {
    expense.share = Math.round(((100 * expense.amount) / totalUsed) * 10) / 10;
  });

  return { totalUsed, categories: expensesByCategory };
};

const calculateExpensesByPeriod = (
  expenses: Pick<Expense, 'amount' | 'expenseDate' | 'category'>[],
  period: 'week' | 'month' | 'year',
) => {
  const timePeriod = period === 'week' ? WEEKDAYS : period === 'month' ? getCalendarWeeksOfCurrentMonth() : MONTHS;
  const expensesByPeriod = timePeriod.map(period => ({
    name: period,
    amount: 0,
  }));

  expenses.forEach(expense => {
    const timeUnit =
      period === 'week'
        ? getWeekday(expense.expenseDate)
        : period === 'month'
          ? getCalenderWeek(expense.expenseDate)
          : getMonth(expense.expenseDate);

    const entry = expensesByPeriod.find(exp => exp.name === timeUnit);

    if (entry) {
      entry.amount += expense.amount;
    }
  });

  return expensesByPeriod;
};

const getCalendarWeeksOfCurrentMonth = (): string[] => {
  const now = new Date();
  const startOfMonthDate = startOfMonth(now);
  const endOfMonthDate = endOfMonth(now);

  const weeks: string[] = [];
  let current = startOfMonthDate;

  while (current <= endOfMonthDate) {
    const weekNumber = getISOWeek(current);
    weeks.push(`Week ${weekNumber}`);
    current = addWeeks(current, 1); // Move to the next week
  }

  return weeks;
};
