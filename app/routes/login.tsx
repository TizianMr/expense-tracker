import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, NavLink, redirect, useActionData, useNavigation } from '@remix-run/react';
import { Button, TextInput } from '@tremor/react';

import { authenticator, EMAIL_PASSWORD_STRATEGY, sessionStorage } from '~/db/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  const user = session.get('user');

  if (user) return redirect('/dashboard');

  return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.clone().formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'E-Mail and password are required' };
  }

  try {
    const user = await authenticator.authenticate(EMAIL_PASSWORD_STRATEGY, request);

    const session = await sessionStorage.getSession(request.headers.get('cookie'));

    session.set('user', user);

    return redirect('/dashboard', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    // Return validation errors or authentication errors
    if (error instanceof Error) {
      return { error: error.message };
    }

    // Re-throw any other errors (including redirects)
    throw error;
  }
};

const LoginPage = () => {
  const data = useActionData<typeof action>();
  const { state } = useNavigation();

  return (
    <>
      <div className='flex min-h-screen flex-1 flex-col justify-center px-4 py-10 lg:px-6'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
          <img
            alt='Expense tracker logo'
            className='mx-auto'
            src='logo.png'
            width='150rem'
          />
          <h3 className='text-center text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
            Login
          </h3>
          <Form
            className='mt-6 space-y-4'
            method='post'>
            <div>
              <label
                className='text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong'
                htmlFor='email'>
                Email
              </label>
              <TextInput
                autoComplete='email'
                className='mt-2'
                id='email'
                name='email'
                placeholder='john@company.com'
                type='email'
              />
            </div>
            <div>
              <label
                className='text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong'
                htmlFor='password'>
                Password
              </label>
              <TextInput
                autoComplete='password'
                className='mt-2'
                id='password'
                name='password'
                placeholder='password'
                type='password'
              />
            </div>
            <Button
              className='mt-4 w-full whitespace-nowrap rounded-tremor-default bg-tremor-brand py-2 text-center text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis'
              loading={state === 'submitting'}
              type='submit'>
              Login
            </Button>
          </Form>
          {data?.error && (
            <p className='mt-2 text-tremor-label text-center text-red-500 dark:text-red-300'>{data.error}</p>
          )}
          <p className='mt-4 text-tremor-label text-tremor-content dark:text-dark-tremor-content text-center'>
            Don&apos;t have an account?{' '}
            <span className='underline underline-offset-4'>
              <NavLink to={'/signup'}>Sign up</NavLink>
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
