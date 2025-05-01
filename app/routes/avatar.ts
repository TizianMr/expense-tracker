import { ActionFunction, redirect } from '@remix-run/node';

import { getLoggedInUser, sessionStorage } from '~/db/auth.server';
import { uploadAvatar } from '~/db/s3.server';
import { updateAvatar } from '~/db/user.server';

export const action: ActionFunction = async ({ request }) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const imageUrl = await uploadAvatar(request);

  const updatedUser = await updateAvatar(user.id, imageUrl);

  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  session.set('user', updatedUser);

  return new Response(null, {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
};
