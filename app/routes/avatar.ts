import { ActionFunction, redirect } from '@remix-run/node';

import { getLoggedInUser, updateSession } from '~/db/auth.server';
import { getSignedAvatarUrl, uploadAvatar } from '~/db/s3.server';
import { updateAvatar } from '~/db/user.server';
import { getS3ObjectKey } from '~/utils/helpers';

export const action: ActionFunction = async ({ request }) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  let avatarS3Key: string | undefined;
  if (user.profilePicture) {
    avatarS3Key = getS3ObjectKey(user.profilePicture);
  }

  const imageUrl = await uploadAvatar(request, avatarS3Key);

  const updatedUser = await updateAvatar(user.id, imageUrl);

  return await updateSession(request, {
    ...user,
    profilePicture: await getSignedAvatarUrl(getS3ObjectKey(updatedUser.profilePicture)),
  });
};
