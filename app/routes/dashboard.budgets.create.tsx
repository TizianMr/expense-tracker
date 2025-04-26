import { ActionFunctionArgs } from '@remix-run/node';
import { redirect, useOutletContext } from '@remix-run/react';

import { BudgetFormErrors } from './dashboard.budgets';
import { createBudget, CreateBudget } from '../db/budget.server';
import BudgetForm from '~/components/budget-form';
import { getLoggedInUser } from '~/db/auth.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const formData = await request.formData();

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const budgetData: CreateBudget = {
    amount: parseFloat(convertedAmount),
    title: formData.get('title') as string,
  };

  const createdBudget = await createBudget(budgetData, user.id);
  return createdBudget;
};

const CreateBudgetDialog = () => {
  const { errors } = useOutletContext<{
    errors: BudgetFormErrors;
  }>();

  return <BudgetForm errors={errors} />;
};

export default CreateBudgetDialog;
