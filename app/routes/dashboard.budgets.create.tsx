import { ActionFunctionArgs } from '@remix-run/node';
import { redirect, useOutletContext } from '@remix-run/react';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';

import { BudgetFormErrors } from './dashboard.budgets';
import { createBudget, CreateBudget } from '../db/budget.server';
import BudgetForm from '~/components/feature/budget/budget-form';
import { getLoggedInUser } from '~/db/auth.server';
import i18next from '~/utils/i18n/i18next.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const formData = await request.formData();
  const t = await i18next.getFixedT(request);

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const budgetData: CreateBudget = {
    amount: parseFloat(convertedAmount),
    title: formData.get('title') as string,
  };

  try {
    const createdBudget = await createBudget(budgetData, user.id);
    return jsonWithSuccess(createdBudget, t('toasts.budget.success.create'));
  } catch {
    return jsonWithError(null, t('toasts.budget.error.create'));
  }
};

const CreateBudgetDialog = () => {
  const { errors } = useOutletContext<{
    errors: BudgetFormErrors;
  }>();

  return <BudgetForm errors={errors} />;
};

export default CreateBudgetDialog;
