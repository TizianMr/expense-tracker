import { Locale, User, UserPreference } from '@prisma/client';
import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { hash, verify } from 'argon2';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

import { getSignedAvatarUrl } from './s3.server';
import { prisma } from '../utils/prisma.server';
import { localeCookie } from '~/utils/cookies.server';
import { getS3ObjectKey } from '~/utils/helpers';

export type AuthUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'profilePicture'> & {
  preferences: Pick<UserPreference, 'id' | 'theme' | 'locale'>;
};
type LoginInfo = Pick<User, 'password' | 'email'>;
type CreateUser = LoginInfo & Pick<User, 'firstName' | 'lastName'> & { acceptLang: Locale };

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

export const updateSession = async (
  request: Request,
  updatedUser: AuthUser,
  redirectTo?: string,
): Promise<Response> => {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  session.set('user', updatedUser);

  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  headers.append('Set-Cookie', await sessionStorage.commitSession(session));
  headers.append('Set-Cookie', await localeCookie.serialize(updatedUser.preferences.locale));

  if (redirectTo) {
    return redirect(redirectTo, { headers });
  }

  return new Response(JSON.stringify({ success: true }), { headers });
};

export const getLoggedInUser = async (request: Request): Promise<AuthUser | null> => {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  const user = session.get('user');

  return user;
};

export const createUser = async ({ password, email, firstName, lastName, acceptLang }: CreateUser) => {
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
          locale: acceptLang,
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

  if (!user.UserPreference) {
    throw new Error('User preference not found');
  }

  let signedAvatarUrl: string | null = null;
  if (user.profilePicture) {
    signedAvatarUrl = await getSignedAvatarUrl(getS3ObjectKey(user.profilePicture));
  }

  return {
    id: user.id,
    email: user.email,
    lastName: user.lastName,
    firstName: user.firstName,
    profilePicture: signedAvatarUrl,
    preferences: {
      id: user.UserPreference.id,
      theme: user.UserPreference.theme,
      locale: user.UserPreference.locale,
    },
  };
};
