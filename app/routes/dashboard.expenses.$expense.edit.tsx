import { Category } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useLoaderData, useOutletContext } from '@remix-run/react';
import { RiErrorWarningLine } from '@remixicon/react';
import { Callout } from '@tremor/react';

import { ExpenseFormErrors } from './dashboard.expenses';
import { fetchExpenseById, updateExpense, UpdateExpense } from '../db/expense.server';
import ExpenseForm from '~/components/expense-form';
import { getLoggedInUser } from '~/db/auth.server';
import { fetchBudgets } from '~/db/budget.server';
import { SortDirection } from '~/interfaces';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const expenseId = params.expense as string;

  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const [expense, budgets] = await Promise.all([
    await fetchExpenseById(expenseId, user.id),
    await fetchBudgets(
      {
        sortBy: 'id',
        sortDirection: SortDirection.ASC,
      },
      user.id,
    ),
  ]);

  return { expense, budgets };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const formData = await request.formData();

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const expense: UpdateExpense = {
    id: params.expense as string,
    amount: parseFloat(convertedAmount),
    category: formData.get('category') as Category,
    expenseDate: new Date(formData.get('date') as string),
    title: formData.get('title') as string,
    budgetId: formData.get('budget') as string,
  };

  const updatedExpense = await updateExpense(expense, user.id);
  return updatedExpense;
};

const EditExpenseDialog = () => {
  const { expense, budgets } = useLoaderData<typeof loader>();
  const { errors } = useOutletContext<{
    errors: ExpenseFormErrors;
  }>();

  if (!expense) {
    return (
      <Callout
        className='mt-4'
        color='rose'
        icon={RiErrorWarningLine}
        title='Expense not found'>
        The expense you are trying to edit could not be found.
      </Callout>
    );
  }

  return (
    <ExpenseForm
      budgets={budgets}
      errors={errors}
      expense={expense}
    />
  );
};

export default EditExpenseDialog;
