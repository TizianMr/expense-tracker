import { Expense } from '@prisma/client';

import { prisma } from '../utils/prisma.server';
import { Filter, ListResult } from '~/interfaces';

export type CreateExpense = Pick<Expense, 'title' | 'amount' | 'expenseDate' | 'category'>;
export type UpdateExpense = Pick<Expense, 'id'> & CreateExpense;
type DeleteExpense = Pick<Expense, 'id'>;

export const createExpense = async (expense: CreateExpense): Promise<Expense> => {
  return await prisma.expense.create({ data: expense });
};

export const deleteExpense = async ({ id }: DeleteExpense) => {
  return await prisma.expense.delete({ where: { id } });
};

export const updateExpense = async ({ id, ...updatedExpense }: UpdateExpense) => {
  return await prisma.expense.update({ where: { id }, data: updatedExpense });
};

export const fetchExpenses = async ({
  page,
  pageSize,
  sortBy,
  sortDirection,
}: Filter<Expense>): Promise<ListResult<Expense>> => {
  const expenses = await prisma.$transaction([
    prisma.expense.count(),
    prisma.expense.findMany({
      orderBy: {
        [sortBy]: sortDirection,
      },
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

export const fetchExpenseById = async (id: string): Promise<Expense | null> => {
  return await prisma.expense.findUnique({ where: { id } });
};
