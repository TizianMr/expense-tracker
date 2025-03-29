import { Budget } from '@prisma/client';

import { Filter, ListResult } from '~/interfaces';

export type CreateBudget = Pick<Budget, 'title' | 'amount'>;

export const createBudget = async (budget: CreateBudget): Promise<Budget> => {
  return await prisma.budget.create({ data: budget });
};

export const fetchBudgets = async ({
  page,
  pageSize,
  sortBy,
  sortDirection,
}: Filter<Budget>): Promise<ListResult<Budget>> => {
  const bugets = await prisma.$transaction([
    prisma.budget.count(),
    prisma.budget.findMany({
      orderBy: {
        [sortBy]: sortDirection,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: bugets[1],
    page,
    pageSize,
    totalItems: bugets[0],
  };
};
