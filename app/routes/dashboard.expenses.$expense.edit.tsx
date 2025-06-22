import { Category } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useLoaderData, useOutletContext } from '@remix-run/react';
import { RiErrorWarningLine } from '@remixicon/react';
import { Callout } from '@tremor/react';
import { useTranslation } from 'react-i18next';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';

import { ExpenseFormErrors } from './dashboard.expenses';
import { fetchExpenseById, updateExpense, UpdateExpense } from '../db/expense.server';
import ExpenseForm from '~/components/feature/expense/expense-form';
import { getLoggedInUser } from '~/db/auth.server';
import { fetchBudgets } from '~/db/budget.server';
import { SortDirection } from '~/interfaces';
import i18next from '~/utils/i18n/i18next.server';

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

  return { expense, budgets, locale: user.preferences.locale };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const formData = await request.formData();
  const t = await i18next.getFixedT(request);

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const expense: UpdateExpense = {
    id: params.expense as string,
    amount: parseFloat(convertedAmount),
    category: formData.get('category') as Category,
    expenseDate: new Date(formData.get('date') as string),
    title: formData.get('title') as string,
    budgetId: formData.get('budget') as string,
  };

  try {
    const updatedExpense = await updateExpense(expense, user.id);
    return jsonWithSuccess(updatedExpense, t('toasts.expense.success.edit'));
  } catch {
    return jsonWithError(null, t('toasts.expense.error.edit'));
  }
};

const EditExpenseDialog = () => {
  const { expense, budgets, locale } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const { errors } = useOutletContext<{
    errors: ExpenseFormErrors;
  }>();

  if (!expense) {
    return (
      <Callout
        className='mt-4'
        color='rose'
        icon={RiErrorWarningLine}
        title={t('EditExpenseDialog.error.title')}>
        {t('EditExpenseDialog.error.text')}
      </Callout>
    );
  }

  return (
    <ExpenseForm
      budgets={budgets}
      errors={errors}
      expense={expense}
      locale={locale}
    />
  );
};

export default EditExpenseDialog;
