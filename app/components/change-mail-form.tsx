import { useFetcher } from '@remix-run/react';
import { TextInput, Button } from '@tremor/react';
import { useEffect } from 'react';

import { ChangeMailFormErrors } from '~/routes/dashboard.account';

type Props = {
  onSuccess: () => void;
};

const ChangeMailForm = ({ onSuccess }: Props) => {
  const fetcher = useFetcher<{
    success?: boolean;
    clientErrors?: ChangeMailFormErrors;
    serverError?: string;
  }>();

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      onSuccess();
    }
  }, [fetcher.data, fetcher.state, onSuccess]);

  return (
    <fetcher.Form method='put'>
      <div className='space-y-4'>
        <div>
          <label
            className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
            htmlFor='new-email'>
            New Email <span className='text-red-500'>*</span>
          </label>
          <TextInput
            autoComplete='email'
            className='mt-2'
            error={!!fetcher.data?.clientErrors?.newMail}
            errorMessage={fetcher.data?.clientErrors?.newMail}
            id='new-email'
            name='new-email'
            placeholder='john@company.com'
            type='email'
          />
        </div>
        <div>
          <label
            className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
            htmlFor='confirm-email'>
            Confirm new Email <span className='text-red-500'>*</span>
          </label>
          <TextInput
            autoComplete='email'
            className='mt-2'
            error={!!fetcher.data?.clientErrors?.confirmedMail}
            errorMessage={fetcher.data?.clientErrors?.confirmedMail}
            id='confirm-email'
            name='confirm-email'
            placeholder='john@company.com'
            type='email'
          />
        </div>
        <Button
          className='w-full'
          loading={fetcher.state === 'submitting'}
          type='submit'>
          Change
        </Button>
        {fetcher.data?.serverError && (
          <p className='mt-2 text-tremor-label text-center text-red-500 dark:text-red-300'>
            {fetcher.data.serverError}
          </p>
        )}
      </div>
    </fetcher.Form>
  );
};

export default ChangeMailForm;
