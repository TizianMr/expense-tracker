import { Category } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';

import { FormErrors } from './dashboard.expenses';
import ExpenseForm from '~/components/expense-form';
import { fetchBudgets } from '~/db/budget.server';
import { createExpense, CreateExpense } from '~/db/expense.server';
import { SortDirection } from '~/interfaces';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams;

  const budgets = await fetchBudgets({
    page: Number(query.get('page')) || 1,
    pageSize: 5,
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
  const { contentRef, errors } = useOutletContext<{
    contentRef: React.RefObject<HTMLDivElement>;
    errors: FormErrors;
  }>();

  return (
    <ExpenseForm
      budgets={budgets.items}
      contentRef={contentRef}
      errors={errors}
    />
  );
};

export default CreateExpenseDialog;
