import { Category } from '@prisma/client';
import { ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';

import { ExpenseFormErrors } from './dashboard.expenses';
import ExpenseForm from '~/components/expense-form';
import { fetchBudgets } from '~/db/budget.server';
import { createExpense, CreateExpense } from '~/db/expense.server';
import { SortDirection } from '~/interfaces';

export const loader = async () => {
  const budgets = await fetchBudgets({
    sortBy: 'id',
    sortDirection: SortDirection.ASC,
  });

  return budgets;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const expenseData: CreateExpense = {
    amount: parseFloat(convertedAmount),
    category: formData.get('category') as Category,
    expenseDate: new Date(formData.get('date') as string),
    title: formData.get('title') as string,
    budgetId: formData.get('budget') as string,
  };

  const createdExpense = await createExpense(expenseData);
  return createdExpense;
};

const CreateExpenseDialog = () => {
  const budgets = useLoaderData<typeof loader>();
  const { errors } = useOutletContext<{
    errors: ExpenseFormErrors;
  }>();

  return (
    <ExpenseForm
      budgets={budgets}
      errors={errors}
    />
  );
};

export default CreateExpenseDialog;
