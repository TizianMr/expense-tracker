import { createCookie } from '@remix-run/node';

export const localeCookie = createCookie('locale', {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 365 * 24 * 60 * 60,
});
