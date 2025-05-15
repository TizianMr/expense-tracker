import { ColorTheme, User, UserPreference } from '@prisma/client';
import { createCookieSessionStorage } from '@remix-run/node';
import { hash, verify } from 'argon2';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

import { getSignedAvatarUrl } from './s3.server';
import { prisma } from '../utils/prisma.server';
import { getS3ObjectKey } from '~/utils/helpers';

export type AuthUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'profilePicture'> & {
  preferences: Pick<UserPreference, 'id' | 'theme'>;
};
type LoginInfo = Pick<User, 'password' | 'email'>;
type CreateUser = LoginInfo & Pick<User, 'firstName' | 'lastName'>;

export const EMAIL_PASSWORD_STRATEGY = 'email-password-strategy';

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
  EMAIL_PASSWORD_STRATEGY,
);

export const updateSession = async (request: Request, updatedUser: AuthUser): Promise<Response> => {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  session.set('user', updatedUser);

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
};

export const getLoggedInUser = async (request: Request): Promise<AuthUser | null> => {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  const user = session.get('user');

  return user;
};

export const createUser = async ({ password, email, firstName, lastName }: CreateUser) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await hash(password);

  const newUser = {
    email,
    firstName,
    lastName,
    password: hashedPassword,
  };

  const createdUser = await prisma.user.create({
    data: {
      ...newUser,
      UserPreference: {
        create: {
          theme: null,
        },
      },
    },
  });

  return createdUser;
};

export const login = async ({ password, email }: LoginInfo): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({ where: { email }, include: { UserPreference: true } });

  if (!user || !(await verify(user.password, password))) {
    throw new Error('Mail or password are not correct');
  }

  let signedAvatarUrl: string | null = null;
  if (user.profilePicture) {
    signedAvatarUrl = await getSignedAvatarUrl(getS3ObjectKey(user.profilePicture));
  }

  const userPreferencesFallback = {
    theme: ColorTheme.DARK,
  };

  return {
    id: user.id,
    email: user.email,
    lastName: user.lastName,
    firstName: user.firstName,
    profilePicture: signedAvatarUrl,
    preferences: {
      id: user.UserPreference?.id || '',
      theme: user.UserPreference?.theme || userPreferencesFallback.theme,
    },
  };
};
