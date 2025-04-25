import { User } from '@prisma/client';
import { hash, verify } from 'argon2';

export const createUser = async ({ password, email }: Pick<User, 'password' | 'email'>) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await hash(password);

  const newUser = {
    email,
    password: hashedPassword,
  };

  return await prisma.user.create({ data: newUser });
};

export const login = async ({ password, email }: Pick<User, 'password' | 'email'>) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('User with this email does not exist');
  }

  const isValidPassword = await verify(user.password, password);

  if (!isValidPassword) {
    throw new Error('Passwort is not valid');
  }
};
