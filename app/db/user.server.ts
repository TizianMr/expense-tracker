import { hash, verify } from 'argon2';

export const updateMailAddress = async (id: string, newMail: string) => {
  const userWithSameMail = await prisma.user.findUnique({ where: { email: newMail } });

  if (userWithSameMail) {
    throw new Error('Mail address is already taken.');
  }

  const updatedUser = await prisma.user.update({ where: { id }, data: { email: newMail } });

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    lastName: updatedUser.lastName,
    firstName: updatedUser.firstName,
  };
};

export const updatePassword = async (id: string, oldPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user || !(await verify(user.password, oldPassword))) {
    throw new Error('Old password is incorrect.');
  }

  const hashedPassword = await hash(newPassword);

  const updatedUser = await prisma.user.update({ where: { id }, data: { password: hashedPassword } });

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    lastName: updatedUser.lastName,
    firstName: updatedUser.firstName,
  };
};
