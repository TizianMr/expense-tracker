import { hash, verify } from 'argon2';

import { deleteAvatar } from './s3.server';
import { prisma } from '../utils/prisma.server';
import { getS3ObjectKey } from '~/utils/helpers';

export const updateMailAddress = async (id: string, newMail: string) => {
  const userWithSameMail = await prisma.user.findUnique({ where: { email: newMail } });

  if (userWithSameMail) {
    throw new Error('Mail address is already taken.');
  }

  const updatedUser = await prisma.user.update({ where: { id }, data: { email: newMail } });

  return {
    email: updatedUser.email,
  };
};

export const updatePassword = async (id: string, oldPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user || !(await verify(user.password, oldPassword))) {
    throw new Error('Old password is incorrect.');
  }

  const hashedPassword = await hash(newPassword);
  await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
};

export const updateAvatar = async (id: string, imageUrl: string) => {
  await prisma.user.update({ where: { id }, data: { profilePicture: imageUrl } });

  return {
    profilePicture: imageUrl,
  };
};

export const deleteUser = async (id: string) => {
  const deletedUser = await prisma.user.delete({ where: { id } });

  if (deletedUser.profilePicture) {
    await deleteAvatar(getS3ObjectKey(deletedUser.profilePicture));
  }
};
