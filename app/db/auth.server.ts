import { User } from '@prisma/client';
import { createCookieSessionStorage } from '@remix-run/node';
import { hash, verify } from 'argon2';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

type AuthUser = {
  id: string;
  email: string;
};

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET || 'super-secret'],
    secure: process.env.NODE_ENV === 'production',
  },
});

export const authenticator = new Authenticator<AuthUser>();

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    return await login({ password, email });
  }),
);

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

export const login = async ({ password, email }: Pick<User, 'password' | 'email'>): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('User with this email does not exist');
  }

  const isValidPassword = await verify(user.password, password);

  if (!isValidPassword) {
    throw new Error('Passwort is not valid');
  }

  return {
    id: user.id,
    email: user.email,
  };
};
