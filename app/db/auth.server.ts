import { User } from '@prisma/client';
import { createCookieSessionStorage } from '@remix-run/node';
import { hash, verify } from 'argon2';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

export type AuthUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'profilePicture'>;
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

  return await prisma.user.create({ data: newUser });
};

export const login = async ({ password, email }: LoginInfo): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verify(user.password, password))) {
    throw new Error('Mail or password are not correct');
  }

  return {
    id: user.id,
    email: user.email,
    lastName: user.lastName,
    firstName: user.firstName,
    profilePicture: user.profilePicture,
  };
};
