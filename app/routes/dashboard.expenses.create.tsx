import { Category } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useLoaderData, useOutletContext } from '@remix-run/react';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';

import { ExpenseFormErrors } from './dashboard.expenses';
import ExpenseForm from '~/components/feature/expense/expense-form';
import { getLoggedInUser } from '~/db/auth.server';
import { fetchBudgets } from '~/db/budget.server';
import { createExpense, CreateExpense } from '~/db/expense.server';
import { SortDirection } from '~/interfaces';
import i18next from '~/utils/i18n/i18next.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const budgets = await fetchBudgets(
    {
      sortBy: 'id',
      sortDirection: SortDirection.ASC,
    },
    user.id,
  );

  return { budgets, locale: user.preferences.locale };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const formData = await request.formData();
  const t = await i18next.getFixedT(request);

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const expenseData: CreateExpense = {
    amount: parseFloat(convertedAmount),
    category: formData.get('category') as Category,
    expenseDate: new Date(formData.get('date') as string),
    title: formData.get('title') as string,
    budgetId: formData.get('budget') as string,
  };

  try {
    const createdExpense = await createExpense(expenseData, user.id);
    return jsonWithSuccess(createdExpense, t('Toasts.expense.success.create'));
  } catch {
    return jsonWithError(null, t('Toasts.expense.error.create'));
  }
};

const CreateExpenseDialog = () => {
  const { budgets, locale } = useLoaderData<typeof loader>();
  const { errors } = useOutletContext<{
    errors: ExpenseFormErrors;
  }>();

  return (
    <ExpenseForm
      budgets={budgets}
      errors={errors}
      locale={locale}
    />
  );
};

export default CreateExpenseDialog;
