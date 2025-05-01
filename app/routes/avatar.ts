import { ActionFunction, redirect } from '@remix-run/node';

import { getLoggedInUser, updateSession } from '~/db/auth.server';
import { uploadAvatar } from '~/db/s3.server';
import { updateAvatar } from '~/db/user.server';

export const action: ActionFunction = async ({ request }) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const avatarS3Key = user.profilePicture?.split('/')[user.profilePicture?.split('/').length - 1];
  const imageUrl = await uploadAvatar(request, avatarS3Key);

  const updatedUser = await updateAvatar(user.id, imageUrl);

  return await updateSession(request, updatedUser);
};
