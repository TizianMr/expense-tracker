import { Budget } from '@prisma/client';

import { Filter, FilterWithPagination, ListResult } from '~/interfaces';

export type CreateBudget = Pick<Budget, 'title' | 'amount'>;
type BudgetWithRemaining = Budget & { remainingBudget: number };

export const createBudget = async (budget: CreateBudget): Promise<Budget> => {
  return await prisma.budget.create({ data: budget });
};

// function signatures
export function fetchBudgets(filter: FilterWithPagination<Budget>): Promise<ListResult<BudgetWithRemaining>>;
export function fetchBudgets(filter: Filter<Budget>): Promise<BudgetWithRemaining[]>;

export async function fetchBudgets(
  filter: Filter<Budget> | FilterWithPagination<Budget>,
): Promise<ListResult<BudgetWithRemaining> | BudgetWithRemaining[]> {
  const isPaginated = 'page' in filter && 'pageSize' in filter;

  const budgets = await prisma.$transaction([
    prisma.budget.count(),
    prisma.budget.findMany({
      orderBy: {
        [filter.sortBy]: filter.sortDirection,
      },
      ...(isPaginated && {
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
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
