import { ActionFunctionArgs } from '@remix-run/node';
import { Form, redirect, useNavigation } from '@remix-run/react';
import { Button, Dialog, DialogPanel } from '@tremor/react';
import { useCallback, useState } from 'react';

import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';
import { getLoggedInUser, sessionStorage } from '~/db/auth.server';
import { deleteUser } from '~/db/user.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  await deleteUser(user.id);

  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  return redirect('/login', {
    headers: { 'Set-Cookie': await sessionStorage.destroySession(session) },
  });
};

const DeleteUserDialog = () => {
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
          Delete User?
        </h1>
        <p className='mt-2 leading-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content'>
          Once deleted, you cannot restore your account. All expenses and budgets will be lost.
        </p>
        <div className='mt-8 flex items-center justify-end space-x-2'>
          <Button
            variant='secondary'
            onClick={handleClose}>
            Cancel
          </Button>
          <Form method='delete'>
            <Button
              color='red'
              loading={state === 'submitting'}
              type='submit'
              variant='primary'>
              Delete
            </Button>
          </Form>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default DeleteUserDialog;
