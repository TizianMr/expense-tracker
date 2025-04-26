import { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/react';

import { getLoggedInUser } from '~/db/auth.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');
  return redirect('/dashboard');
};
