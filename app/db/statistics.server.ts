import { Expense } from '@prisma/client';
import { startOfWeek, endOfWeek, startOfYear, endOfYear, startOfMonth, endOfMonth, getISOWeek } from 'date-fns';

import { prisma } from '../utils/prisma.server';
import { StatisticPeriod } from '~/interfaces';
import { EXPENSE_CATEGORIES, NO_CATEGORY } from '~/utils/constants';

export type Statistics = {
  period: StatisticPeriod;
  expensesByCategory: {
    totalUsed: number;
    categories: {
      category: string;
      amount: number;
      share: number;
    }[];
  };
  expensesByPeriod: number[];
};

export const fetchStatistics = async (period: StatisticPeriod, userId: string): Promise<Statistics> => {
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case StatisticPeriod.WEEK:
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      break;
    case StatisticPeriod.MONTH:
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
      break;
    case StatisticPeriod.YEAR:
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
      createdByUserId: userId,
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
  expensesByCategory.push({ category: NO_CATEGORY, amount: 0, share: 0 });

  // Calculate amount per category
  expenses.forEach(expense => {
    const categoryEntry =
      expensesByCategory.find(ebc => ebc.category === expense.category) ||
      expensesByCategory.find(ebc => ebc.category === NO_CATEGORY);
    if (categoryEntry) {
      categoryEntry.amount += expense.amount;
    }
  });

  // Calculate total used budget
  const totalUsed = expensesByCategory.reduce((sum, category) => sum + category.amount, 0);

  // Calculate share per category
  expensesByCategory.forEach(expense => {
    if (expense.amount === 0) {
      expense.share = 0;
    } else {
      expense.share = Math.round(((100 * expense.amount) / totalUsed) * 10) / 10;
    }
  });

  return { totalUsed, categories: expensesByCategory };
};

const calculateExpensesByPeriod = (
  expenses: Pick<Expense, 'amount' | 'expenseDate' | 'category'>[],
  period: StatisticPeriod,
) => {
  let expensesByPeriod: number[] = Array(getNumberOfWeeksInCurrentMonth()).fill(0);
  switch (period) {
    case StatisticPeriod.WEEK:
      expensesByPeriod = Array(7).fill(0);
      break;
    case StatisticPeriod.MONTH:
      expensesByPeriod = Array(getNumberOfWeeksInCurrentMonth()).fill(0);
      break;
    case StatisticPeriod.YEAR:
      expensesByPeriod = Array(12).fill(0);
      break;
  }

  expenses.forEach(expense => {
    const index =
      period === StatisticPeriod.WEEK
        ? (expense.expenseDate.getDay() + 6) % 7 // week starts on monday
        : period === StatisticPeriod.MONTH
          ? getISOWeek(expense.expenseDate) - getISOWeek(startOfMonth(Date.now()))
          : expense.expenseDate.getMonth();

    expensesByPeriod[index] += expense.amount;
  });

  return expensesByPeriod;
};

function getNumberOfWeeksInCurrentMonth(): number {
  const now = new Date();
  const firstWeek = getISOWeek(startOfMonth(now));
  const lastWeek = getISOWeek(endOfMonth(now));
  // Handle year wrap-around (e.g., December to January)
  if (lastWeek < firstWeek) {
    // ISO weeks reset at the start of the year
    const weeksInYear = getISOWeek(new Date(now.getFullYear(), 11, 31));
    return weeksInYear - firstWeek + 1 + lastWeek;
  }
  return lastWeek - firstWeek + 1;
}
