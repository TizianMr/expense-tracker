import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, NavLink, redirect, useActionData, useNavigation } from '@remix-run/react';
import { Button, TextInput } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import GitHubLink from '~/components/ui/github-link';
import { authenticator, EMAIL_PASSWORD_STRATEGY, getLoggedInUser, updateSession } from '~/db/auth.server';
import i18next from '~/utils/i18n/i18next.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getLoggedInUser(request);

  if (user) return redirect('/dashboard');

  return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.clone().formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const t = await i18next.getFixedT(request);

  if (!email || !password) {
    return { error: t('LoginPage.errors.required') };
  }

  try {
    const user = await authenticator.authenticate(EMAIL_PASSWORD_STRATEGY, request);

    return await updateSession(request, user, '/dashboard');
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
  const { t } = useTranslation();
  const { state } = useNavigation();

  return (
    <>
      <div className='flex min-h-screen flex-col px-4 py-10 lg:px-6'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm flex flex-col justify-center flex-1'>
          <img
            alt='Expense tracker logo'
            className='mx-auto'
            src='/logo-horizontal.png'
            width='200rem'
          />
          <h3 className='text-center text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
            {t('LoginPage.title')}
          </h3>
          <Form
            className='mt-6 space-y-4'
            method='post'>
            <div>
              <label
                className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
                htmlFor='email'>
                {t('LoginPage.mail')} <span className='text-red-500'>*</span>
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
                className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
                htmlFor='password'>
                {t('LoginPage.pwd')} <span className='text-red-500'>*</span>
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
              {t('LoginPage.submit')}
            </Button>
          </Form>
          {data?.error && (
            <p className='mt-2 text-tremor-label text-center text-red-500 dark:text-red-300'>{data.error}</p>
          )}
          <p className='mt-4 text-tremor-label text-tremor-content dark:text-dark-tremor-content text-center'>
            {t('LoginPage.registerQuestion')}{' '}
            <span className='underline underline-offset-4'>
              <NavLink to={'/signup'}>{t('LoginPage.registerAction')}</NavLink>
            </span>
          </p>
        </div>

        <GitHubLink />
      </div>
    </>
  );
};

export default LoginPage;
