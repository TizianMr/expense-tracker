import { Expense } from '@prisma/client';

import { Filter, ListResult } from './types';
import { prisma } from '../utils/prisma.server';

export type CreateExpense = Pick<Expense, 'title' | 'amount' | 'expenseDate' | 'category'>;

export const createExpense = async (expense: CreateExpense): Promise<Expense> => {
  return await prisma.expense.create({ data: expense });
};

export const fetchExpenses = async ({ page, pageSize }: Filter): Promise<ListResult<Expense>> => {
  const expenses = await prisma.$transaction([
    prisma.expense.count(),
    prisma.expense.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: expenses[1],
    page,
    pageSize,
    totalItems: expenses[0],
  };
};
