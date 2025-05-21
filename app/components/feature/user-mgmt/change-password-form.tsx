import { useFetcher } from '@remix-run/react';
import { TextInput, Button } from '@tremor/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ChangePwdFormErrors } from '~/routes/dashboard.account';

type Props = {
  onSuccess: () => void;
};

const ChangePasswordForm = ({ onSuccess }: Props) => {
  const { t } = useTranslation();
  const fetcher = useFetcher<{
    success?: boolean;
    clientErrors?: ChangePwdFormErrors;
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
            htmlFor='old-password'>
            {t('ChangePasswordForm.oldPwd')} <span className='text-red-500'>*</span>
          </label>
          <TextInput
            autoComplete='password'
            className='mt-2'
            error={!!fetcher.data?.clientErrors?.oldPwd}
            errorMessage={fetcher.data?.clientErrors?.oldPwd}
            id='old-password'
            name='old-password'
            placeholder='password'
            type='password'
          />
        </div>
        <div>
          <label
            className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
            htmlFor='new-password'>
            {t('ChangePasswordForm.newPwd')} <span className='text-red-500'>*</span>
          </label>
          <TextInput
            autoComplete='password'
            className='mt-2'
            error={!!fetcher.data?.clientErrors?.newPwd}
            errorMessage={fetcher.data?.clientErrors?.newPwd}
            id='new-password'
            name='new-password'
            placeholder='password'
            type='password'
          />
        </div>
        <div>
          <label
            className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
            htmlFor='confirm-password'>
            {t('ChangePasswordForm.confirmPwd')} <span className='text-red-500'>*</span>
          </label>
          <TextInput
            autoComplete='password'
            className='mt-2'
            error={!!fetcher.data?.clientErrors?.confirmedPwd}
            errorMessage={fetcher.data?.clientErrors?.confirmedPwd}
            id='confirm-password'
            name='confirm-password'
            placeholder='password'
            type='password'
          />
        </div>
        <Button
          className='w-full'
          loading={fetcher.state === 'submitting'}
          type='submit'>
          {t('ChangePasswordForm.submit')}
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

export default ChangePasswordForm;
