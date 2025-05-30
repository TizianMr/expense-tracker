import { Locale } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, NavLink, redirect, useActionData, useNavigation } from '@remix-run/react';
import { Button, TextInput } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import GitHubLink from '~/components/ui/github-link';
import { authenticator, createUser, EMAIL_PASSWORD_STRATEGY, getLoggedInUser, updateSession } from '~/db/auth.server';
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
  const firstName = formData.get('firstname') as string;
  const lastName = formData.get('lastname') as string;

  if (!email || !password || !firstName || !lastName) {
    return { error: 'Required fields need to be filled' };
  }

  try {
    await createUser({
      password,
      email,
      firstName,
      lastName,
      acceptLang: (await i18next.getLocale(request)) as Locale,
    });

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

const SignUpPage = () => {
  const data = useActionData<typeof action>();
  const { state } = useNavigation();
  const { t } = useTranslation();

  return (
    <>
      <div className='flex min-h-screen flex-1 flex-col justify-center px-4 py-10 lg:px-6'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm flex flex-col justify-center flex-1'>
          <img
            alt='Expense tracker logo'
            className='mx-auto'
            src='/logo-horizontal.png'
            width='200rem'
          />
          <h3 className='text-center text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
            {t('SignUpPage.title')}
          </h3>
          <Form
            className='mt-6 space-y-4'
            method='post'>
            <div>
              <label
                className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
                htmlFor='firstname'>
                {t('SignUpPage.firstName')} <span className='text-red-500'>*</span>
              </label>
              <TextInput
                autoComplete='given-name'
                className='mt-2'
                id='firstname'
                name='firstname'
                placeholder='John'
              />
            </div>
            <div>
              <label
                className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
                htmlFor='lastname'>
                {t('SignUpPage.lastName')} <span className='text-red-500'>*</span>
              </label>
              <TextInput
                autoComplete='family-name'
                className='mt-2'
                id='lastname'
                name='lastname'
                placeholder='Doe'
              />
            </div>
            <div>
              <label
                className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
                htmlFor='email'>
                {t('SignUpPage.mail')} <span className='text-red-500'>*</span>
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
                {t('SignUpPage.pwd')} <span className='text-red-500'>*</span>
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
              {t('SignUpPage.submit')}
            </Button>
          </Form>
          {data?.error && (
            <p className='mt-2 text-tremor-label text-center text-red-500 dark:text-red-300'>{data.error}</p>
          )}
          <p className='mt-4 text-tremor-label text-tremor-content dark:text-dark-tremor-content text-center'>
            {t('SignUpPage.signInQuestion')}{' '}
            <span className='underline underline-offset-4'>
              <NavLink to={'/login'}>{t('SignUpPage.signInAction')}</NavLink>
            </span>
          </p>
        </div>

        <GitHubLink />
      </div>
    </>
  );
};

export default SignUpPage;
