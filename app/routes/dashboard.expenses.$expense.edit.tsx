import { Alert } from '@chakra-ui/react';
import { Category } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';

import { FormErrors } from './dashboard.expenses';
import { fetchExpenseById, updateExpense, UpdateExpense } from '../db/expense.server';
import ExpenseForm from '~/components/expense-form';
import { fetchBudgets } from '~/db/budget.server';
import { SortDirection } from '~/interfaces';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const expenseId = params.expense as string;

  const [expense, budgets] = await Promise.all([
    await fetchExpenseById(expenseId),
    await fetchBudgets({
      page: 1,
      pageSize: 100,
      sortBy: 'id',
      sortDirection: SortDirection.ASC,
    }),
  ]);

  return { expense, budgets };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
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

  const updatedExpense = await updateExpense(expense);
  return updatedExpense;
};

const EditExpenseDialog = () => {
  const { expense, budgets } = useLoaderData<typeof loader>();
  const { contentRef, errors } = useOutletContext<{
    contentRef: React.RefObject<HTMLDivElement>;
    errors: FormErrors;
  }>();

  if (!expense) {
    return (
      <Alert.Root status='error'>
        <Alert.Indicator />
        <Alert.Title>The expense you are trying to edit could not be found.</Alert.Title>
      </Alert.Root>
    );
  }

  return (
    <ExpenseForm
      budgets={budgets.items}
      contentRef={contentRef}
      errors={errors}
      expense={expense}
    />
  );
};

export default EditExpenseDialog;
