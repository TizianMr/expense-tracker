import { Category } from '@prisma/client';
import { ActionFunctionArgs } from '@remix-run/node';

import { createExpense, CreateExpense } from '../db/expense.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const expenseData: CreateExpense = {
    amount: parseFloat(convertedAmount),
    category: formData.get('category') as Category,
    expenseDate: new Date(formData.get('date') as string),
    title: formData.get('title') as string,
  };

  const createdExpense = await createExpense(expenseData);
  return createdExpense;
};
