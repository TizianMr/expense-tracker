import { ActionFunctionArgs } from '@remix-run/node';

import { createBudget, CreateBudget } from '../db/budget.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const budgetData: CreateBudget = {
    amount: parseFloat(convertedAmount),
    title: formData.get('title') as string,
  };

  const createdBudget = await createBudget(budgetData);
  return createdBudget;
};
