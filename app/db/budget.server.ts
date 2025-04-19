import { Budget } from '@prisma/client';

import { Filter, ListResult } from '~/interfaces';

export type CreateBudget = Pick<Budget, 'title' | 'amount'>;
type BudgetWithRemaining = Budget & { remainingBudget: number };

export const createBudget = async (budget: CreateBudget): Promise<Budget> => {
  return await prisma.budget.create({ data: budget });
};

export const fetchBudgets = async ({
  page,
  pageSize,
  sortBy,
  sortDirection,
}: Filter<Budget>): Promise<ListResult<BudgetWithRemaining>> => {
  const budgets = await prisma.$transaction([
    prisma.budget.count(),
    prisma.budget.findMany({
      orderBy: {
        [sortBy]: sortDirection,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        expenses: {
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
      remainingBudget: budget.amount - totalUsed,
    };
  });

  return {
    items: budgetsWithRemaining,
    page,
    pageSize,
    totalItems: budgets[0],
  };
};
