import { Budget } from '@prisma/client';

import { Filter, FilterWithPagination, ListResult } from '~/interfaces';

export type CreateBudget = Pick<Budget, 'title' | 'amount'>;
type DeleteBudget = Pick<Budget, 'id'>;
type BudgetWithUsage = Budget & { totalUsedBudget: number };
type BudgetDetails = BudgetWithUsage & { expensesByCategory: { category: string; amount: number }[] };

export const createBudget = async (budget: CreateBudget): Promise<Budget> => {
  return await prisma.budget.create({ data: budget });
};

export const deleteBudget = async ({ id }: DeleteBudget) => {
  return await prisma.budget.delete({ where: { id } });
};

// function signatures
export function fetchBudgets(filter: FilterWithPagination<Budget>): Promise<ListResult<BudgetWithUsage>>;
export function fetchBudgets(filter: Filter<Budget>): Promise<BudgetWithUsage[]>;

export async function fetchBudgets(
  filter: Filter<Budget> | FilterWithPagination<Budget>,
): Promise<ListResult<BudgetWithUsage> | BudgetWithUsage[]> {
  const isPaginated = 'page' in filter && 'pageSize' in filter;

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

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

export const fetchBudgetById = async (id: string): Promise<BudgetDetails | null> => {
  const budgetDetails = await prisma.$transaction([
    prisma.budget.findUnique({ where: { id } }),
    prisma.expense.findMany({ where: { budgetId: id } }),
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
