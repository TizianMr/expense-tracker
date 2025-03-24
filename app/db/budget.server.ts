import { Budget } from '@prisma/client';

export type CreateBudget = Pick<Budget, 'title' | 'amount'>;

export const createBudget = async (budget: CreateBudget): Promise<Budget> => {
  return await prisma.budget.create({ data: budget });
};
