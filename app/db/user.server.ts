import { hash, verify } from 'argon2';

export const updateMailAddress = async (id: string, newMail: string) => {
  return await prisma.user.update({ where: { id }, data: { email: newMail } });
};

export const updatePassword = async (id: string, oldPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user || !(await verify(user.password, oldPassword))) {
    throw new Error('Old password is incorrect');
  }

  const hashedPassword = await hash(newPassword);

  return await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
};
