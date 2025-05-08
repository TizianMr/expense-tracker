import { ActionFunctionArgs } from '@remix-run/node';
import { Form, redirect, useNavigation } from '@remix-run/react';
import { Button, Dialog, DialogPanel } from '@tremor/react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';
import { getLoggedInUser, sessionStorage } from '~/db/auth.server';
import { deleteUser } from '~/db/user.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  if (user.isDemo) {
    return redirect('/dashboard');
  }

  await deleteUser(user.id);

  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  return redirect('/login', {
    headers: { 'Set-Cookie': await sessionStorage.destroySession(session) },
  });
};

const DeleteUserDialog = () => {
  const { t } = useTranslation();
  const { state } = useNavigation();
  const { triggerDelayedNavigation } = useDelayedNavigation();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerDelayedNavigation('/dashboard'); // delay navigation to allow dialog to close with animation
  }, [triggerDelayedNavigation]);

  return (
    <Dialog
      open={isOpen}
      static={true}
      onClose={handleClose}>
      <DialogPanel>
        <h1 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
          {t('DeleteUserDialog.title')}
        </h1>
        <p className='mt-2 leading-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content'>
          {t('DeleteUserDialog.text')}
        </p>
        <div className='mt-8 flex items-center justify-end space-x-2'>
          <Button
            variant='secondary'
            onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Form method='delete'>
            <Button
              color='red'
              loading={state === 'submitting'}
              type='submit'
              variant='primary'>
              {t('common.delete')}
            </Button>
          </Form>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default DeleteUserDialog;
