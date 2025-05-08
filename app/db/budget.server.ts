import { Budget } from '@prisma/client';

import { prisma } from '../utils/prisma.server';
import { Filter, FilterWithPagination, ListResult } from '~/interfaces';

export type CreateBudget = Pick<Budget, 'title' | 'amount'>;
export type UpdateBudget = Pick<Budget, 'id'> & CreateBudget;
export type BudgetWithUsage = Omit<Budget, 'createdByUserId'> & { totalUsedBudget: number };
export type BudgetDetails = BudgetWithUsage & { expensesByCategory: { category: string; amount: number }[] };

export const createBudget = async (budget: CreateBudget, userId: string): Promise<Budget> => {
  return await prisma.budget.create({ data: { ...budget, createdByUserId: userId } });
};

export const deleteBudget = async (id: string, userId: string) => {
  return await prisma.budget.delete({ where: { id, createdByUserId: userId } });
};

export const updateBudget = async (budget: UpdateBudget, userId: string) => {
  const { id, ...updatedBudget } = budget;
  return await prisma.budget.update({ where: { id, createdByUserId: userId }, data: updatedBudget });
};

// function signatures
export function fetchBudgets(
  filter: FilterWithPagination<Budget>,
  userId: string,
): Promise<ListResult<BudgetWithUsage>>;
export function fetchBudgets(filter: Filter<Budget>, userId: string): Promise<BudgetWithUsage[]>;

export async function fetchBudgets(
  filter: Filter<Budget> | FilterWithPagination<Budget>,
  userId: string,
): Promise<ListResult<BudgetWithUsage> | BudgetWithUsage[]> {
  const isPaginated = 'page' in filter && 'pageSize' in filter;

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  const budgets = await prisma.$transaction([
    prisma.budget.count({ where: { createdByUserId: userId } }),
    prisma.budget.findMany({
      where: {
        createdByUserId: userId,
      },
      orderBy: {
        [filter.sortBy]: filter.sortDirection,
      },
      ...(isPaginated && {
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
      include: {
        expenses: {
          where: {
            expenseDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          select: {
            amount: true,
          },
        },
      },
    }),
  ]);

  const budgetsWithRemaining = budgets[1].map(budget => {
    const totalUsed = budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      id: budget.id,
      title: budget.title,
      amount: budget.amount,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
      totalUsedBudget: totalUsed,
    };
  });

  if (isPaginated) {
    return {
      items: budgetsWithRemaining,
      page: filter.page,
      pageSize: filter.pageSize,
      totalItems: budgets[0],
    };
  }

  return budgetsWithRemaining;
}

export const fetchBudgetById = async (id: string, userId: string): Promise<BudgetDetails | null> => {
  const budgetDetails = await prisma.$transaction([
    prisma.budget.findUnique({ where: { id, createdByUserId: userId } }),
    prisma.expense.findMany({ where: { budgetId: id, createdByUserId: userId } }),
  ]);

  if (!budgetDetails[0]) {
    return null;
  }

  const totalUsedBudget = budgetDetails[1].reduce((total, expense) => total + expense.amount, 0);

  const expensesPerCategory = budgetDetails[1].reduce((acc: { category: string; amount: number }[], expense) => {
    const category = acc.find(
      item => item.category === expense.category || (!expense.category && item.category === 'No category'),
    );

    if (category) {
      category.amount += expense.amount;
    } else {
      acc.push({ category: expense.category ?? 'No category', amount: expense.amount });
    }
    return acc;
  }, []);

  return {
    totalUsedBudget,
    expensesByCategory: expensesPerCategory,
    ...budgetDetails[0],
  };
};
