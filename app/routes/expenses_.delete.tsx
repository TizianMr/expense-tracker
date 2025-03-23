import { ActionFunctionArgs, redirect } from '@remix-run/node';

import { deleteExpense } from '../db/expense.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const expenseId = formData.get('expenseId') as string;

  await deleteExpense({ id: expenseId });
  return redirect('/');
};
