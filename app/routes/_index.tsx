import { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/react';

import { sessionStorage } from '~/db/auth.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  const user = session.get('user');
  if (!user) throw redirect('/login');
  return redirect('/dashboard');
};
