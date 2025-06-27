import { ActionFunction, redirect } from '@remix-run/node';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';

import { getLoggedInUser, updateSession } from '~/db/auth.server';
import { getSignedAvatarUrl, uploadAvatar } from '~/db/s3.server';
import { updateAvatar } from '~/db/user.server';
import { getS3ObjectKey } from '~/utils/helpers';
import i18next from '~/utils/i18n/i18next.server';

export const action: ActionFunction = async ({ request }) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const t = await i18next.getFixedT(request);
  let avatarS3Key: string | undefined;
  if (user.profilePicture) {
    avatarS3Key = getS3ObjectKey(user.profilePicture);
  }

  try {
    const imageUrl = await uploadAvatar(request, avatarS3Key);

    const updatedUser = await updateAvatar(user.id, imageUrl);

    const res = await updateSession(request, {
      ...user,
      profilePicture: await getSignedAvatarUrl(getS3ObjectKey(updatedUser.profilePicture)),
    });

    return jsonWithSuccess({ success: true }, t('toasts.settings.success.update'), { headers: res.headers });
  } catch {
    return jsonWithError(null, t('toasts.settings.error.update'));
  }
};
