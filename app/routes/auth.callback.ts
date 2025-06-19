import { LoaderFunctionArgs } from '@remix-run/node';

import { authenticator, GITHUB_STRATEGY, updateSession } from '~/db/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.authenticate(GITHUB_STRATEGY, request);

  return await updateSession(request, user, '/dashboard');
}
