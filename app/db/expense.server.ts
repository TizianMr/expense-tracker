import { Budget, Expense } from '@prisma/client';

import { prisma } from '../utils/prisma.server';
import { FilterWithPagination, ListResult } from '~/interfaces';

export type CreateExpense = Pick<Expense, 'title' | 'amount' | 'expenseDate' | 'category' | 'budgetId'>;
export type UpdateExpense = Pick<Expense, 'id'> & CreateExpense;
export type ExpenseWithBudget = Omit<Expense, 'budgetId' | 'createdByUserId'> & {
  budget: Pick<Budget, 'id' | 'title'> | null;
};

export const createExpense = async (expense: CreateExpense, userId: string): Promise<Expense> => {
  return await prisma.expense.create({ data: { ...expense, createdByUserId: userId } });
};

export const deleteExpense = async (id: string, userId: string) => {
  return await prisma.expense.delete({ where: { id, createdByUserId: userId } });
};

export const updateExpense = async (expense: UpdateExpense, userId: string) => {
  const { id, ...updatedExpense } = expense;
  return await prisma.expense.update({ where: { id, createdByUserId: userId }, data: updatedExpense });
};

export const fetchExpenses = async (
  filterOptions: FilterWithPagination<Expense>,
  userId: string,
): Promise<ListResult<ExpenseWithBudget>> => {
  const { page, pageSize, sortBy, sortDirection, filter } = filterOptions;
  const expenses = await prisma.$transaction([
    prisma.expense.count({
      where: {
        createdByUserId: userId,
        AND:
          (filter ?? []).map(filter => ({
            [filter.filterBy]:
              filter.filterValue === null
                ? null // Filter for null fields
                : { equals: filter.filterValue },
          })) || [],
      },
    }),
    prisma.expense.findMany({
      where: {
        createdByUserId: userId,
        AND:
          (filter ?? []).map(filter => ({
            [filter.filterBy]:
              filter.filterValue === null
                ? null // Filter for null fields
                : { equals: filter.filterValue },
          })) || [],
      },
      orderBy: {
        [sortBy]: sortDirection,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        amount: true,
        expenseDate: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        budget: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ]);

  return {
    items: expenses[1].map(({ budget, ...expense }) => ({
      ...expense,
      budget: budget ? { id: budget.id, title: budget.title } : null,
    })),
    page,
    pageSize,
    totalItems: expenses[0],
  };
};

export const fetchExpenseById = async (id: string, userId: string): Promise<Expense | null> => {
  return await prisma.expense.findUnique({ where: { id, createdByUserId: userId } });
};
