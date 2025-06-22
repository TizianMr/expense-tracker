import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useLoaderData, useOutletContext } from '@remix-run/react';
import { RiErrorWarningLine } from '@remixicon/react';
import { Callout } from '@tremor/react';
import { useTranslation } from 'react-i18next';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';

import { BudgetFormErrors } from './dashboard.budgets';
import BudgetForm from '~/components/feature/budget/budget-form';
import { getLoggedInUser } from '~/db/auth.server';
import { fetchBudgetById, updateBudget, UpdateBudget } from '~/db/budget.server';
import i18next from '~/utils/i18n/i18next.server';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const budgetId = params.budget as string;

  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const budget = await fetchBudgetById(budgetId, user.id);

  return budget;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const formData = await request.formData();
  const t = await i18next.getFixedT(request);

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const budget: UpdateBudget = {
    id: params.budget as string,
    amount: parseFloat(convertedAmount),
    title: formData.get('title') as string,
  };

  try {
    const updatedExpense = await updateBudget(budget, user.id);
    return jsonWithSuccess({ ...updatedExpense, success: true }, t('toasts.budget.success.edit'));
  } catch {
    return jsonWithError({ success: false }, t('toasts.budget.error.edit'));
  }
};

const EditBudgetDialog = () => {
  const budget = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const { errors } = useOutletContext<{
    errors: BudgetFormErrors;
  }>();

  if (!budget) {
    return (
      <Callout
        className='mt-4'
        color='rose'
        icon={RiErrorWarningLine}
        title={t('EditBudgetDialog.error.title')}>
        {t('EditBudgetDialog.error.text')}
      </Callout>
    );
  }

  return (
    <BudgetForm
      budget={budget}
      errors={errors}
    />
  );
};

export default EditBudgetDialog;
