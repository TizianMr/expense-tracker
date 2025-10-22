import { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/react';

import { getLoggedInUser } from '~/db/auth.server';
import { fetchAllExpenses } from '~/db/expense.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const expenses = await fetchAllExpenses(user.id);
  return expenses;
};
