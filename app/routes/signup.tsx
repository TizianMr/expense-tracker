import { NavLink } from '@remix-run/react';
import { TextInput } from '@tremor/react';

const SignUpPage = () => {
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
            Sign up
          </h3>
          <form
            action='#'
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
            <button
              className='mt-4 w-full whitespace-nowrap rounded-tremor-default bg-tremor-brand py-2 text-center text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis'
              type='submit'>
              Sign up
            </button>
          </form>
          <p className='mt-4 text-tremor-label text-tremor-content dark:text-dark-tremor-content text-center'>
            Already having an account?{' '}
            <span className='underline underline-offset-4'>
              <NavLink to={'/login'}>Login</NavLink>
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
