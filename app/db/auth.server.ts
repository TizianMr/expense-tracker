import { Locale, User, UserPreference } from '@prisma/client';
import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { OAuth2Tokens } from 'arctic';
import { hash, verify } from 'argon2';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { GitHubStrategy } from 'remix-auth-github';

import { getSignedAvatarUrl } from './s3.server';
import { prisma } from '../utils/prisma.server';
import { localeCookie } from '~/utils/cookies.server';
import { getS3ObjectKey } from '~/utils/helpers';

export type AuthUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'profilePicture'> & {
  preferences: Pick<UserPreference, 'id' | 'theme' | 'locale'>;
  isGithubUser: boolean;
};

// only the values we neeed
type GithubUser = {
  id: number;
  login: string;
  avatar_url: string;
  email: string | null;
  name: string | null;
};
type LoginInfo = { email: NonNullable<User['email']>; password: NonNullable<User['password']> };
type CreateUser = LoginInfo & Required<Pick<User, 'firstName' | 'lastName'>> & { acceptLang: Locale };

export const EMAIL_PASSWORD_STRATEGY = 'email-password-strategy';
export const GITHUB_STRATEGY = 'github-strategy';

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

    return await emailLogin({ password, email });
  }),
  EMAIL_PASSWORD_STRATEGY,
);

authenticator.use(
  new GitHubStrategy(
    {
      clientId: process.env.CLIENT_ID ?? '',
      clientSecret: process.env.CLIENT_SECRET ?? 'super-secret',
      redirectURI: process.env.CALLBACK_URL ?? 'https://example.app/auth/callback',
      scopes: ['user:email'],
    },
    async ({ tokens }) => {
      return await githubLogin(tokens);
    },
  ),
  GITHUB_STRATEGY,
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

const emailLogin = async ({ password, email }: LoginInfo): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({ where: { email }, include: { UserPreference: true } });

  if (!user?.password || !(await verify(user.password, password))) {
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
    isGithubUser: false,
  };
};

const githubLogin = async (tokens: OAuth2Tokens): Promise<AuthUser> => {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${tokens.accessToken()}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  const githubUser: GithubUser = await response.json();
  const firstName = githubUser.name !== null ? githubUser.name.split(' ')[0] : githubUser.login;
  const lastName = githubUser.name !== null ? githubUser.name.split(' ').slice(1).join(' ') : null;

  const user = await prisma.user.upsert({
    where: { githubId: githubUser.id },
    include: { UserPreference: true },
    update: {
      email: githubUser.email,
      firstName,
      lastName,
      profilePicture: githubUser.avatar_url,
    },
    create: {
      email: githubUser.email,
      githubId: githubUser.id,
      firstName,
      lastName,
      profilePicture: githubUser.avatar_url,
      UserPreference: {
        create: {
          theme: null,
          locale: Locale.en,
        },
      },
    },
  });

  return {
    id: user.id,
    email: user.email,
    lastName: user.lastName,
    firstName: user.firstName,
    profilePicture: user.profilePicture,
    preferences: {
      id: user.UserPreference.id,
      theme: user.UserPreference.theme,
      locale: user.UserPreference.locale,
    },
    isGithubUser: true,
  };
};
