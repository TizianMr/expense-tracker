import { Budget, Expense } from '@prisma/client';

import { prisma } from '../utils/prisma.server';
import { FilterWithPagination, ListResult } from '~/interfaces';

export type CreateExpense = Pick<Expense, 'title' | 'amount' | 'expenseDate' | 'category' | 'budgetId'>;
export type UpdateExpense = Pick<Expense, 'id'> & CreateExpense;
export type ExpenseWithBudget = Omit<Expense, 'budgetId'> & { budget: Pick<Budget, 'id' | 'title'> | null };
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
  filter,
}: FilterWithPagination<Expense>): Promise<ListResult<ExpenseWithBudget>> => {
  const expenses = await prisma.$transaction([
    prisma.expense.count({
      where: {
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
        Budget: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ]);

  return {
    items: expenses[1].map(({ Budget, ...expense }) => ({
      ...expense,
      budget: Budget ? { id: Budget.id, title: Budget.title } : null,
    })),
    page,
    pageSize,
    totalItems: expenses[0],
  };
};

export const fetchExpenseById = async (id: string): Promise<Expense | null> => {
  return await prisma.expense.findUnique({ where: { id } });
};
