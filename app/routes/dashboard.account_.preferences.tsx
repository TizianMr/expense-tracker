import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, redirect, useLoaderData } from '@remix-run/react';
import { RiComputerLine, RiMoonLine, RiSunLine } from '@remixicon/react';
import { Button, Dialog, DialogPanel, Divider, Select, SelectItem } from '@tremor/react';
import qs from 'qs';
import { useState } from 'react';

import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';
import { getLoggedInUser, updateSession } from '~/db/auth.server';
import { updateMailAddress, updatePassword } from '~/db/user.server';
import { QueryParams } from '~/interfaces';

export type ChangeMailFormErrors = {
  newMail?: string;
  confirmedMail?: string;
};

export type ChangePwdFormErrors = {
  oldPwd?: string;
  newPwd?: string;
  confirmedPwd?: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  return { user };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const formData = await request.formData();
  const url = new URL(request.url);
  const query = url.searchParams;
  const parsedQueryParams = qs.parse(query.toString()) as QueryParams;

  if (parsedQueryParams.tab === 'email') {
    const clientErrors: ChangeMailFormErrors = {};
    const newMail = formData.get('new-email') as string;
    const confirmedMail = formData.get('confirm-email') as string;

    if (newMail !== confirmedMail) {
      clientErrors.newMail = 'Mail addresses are not identical.';
      clientErrors.confirmedMail = 'Mail addresses are not identical.';
    }

    if (!newMail) {
      clientErrors.newMail = 'This input is required.';
    }

    if (!confirmedMail) {
      clientErrors.confirmedMail = 'This input is required.';
    }

    if (Object.keys(clientErrors).length > 0) {
      return { clientErrors };
    }

    try {
      const updatedUser = await updateMailAddress(user.id, newMail);

      return await updateSession(request, { ...user, ...updatedUser });
    } catch (error) {
      if (error instanceof Error) {
        return { serverError: error.message };
      }
    }
  } else if (parsedQueryParams.tab === 'password') {
    const clientErrors: ChangePwdFormErrors = {};
    const oldPwd = formData.get('old-password') as string;
    const newPwd = formData.get('new-password') as string;
    const confirmedPwd = formData.get('confirm-password') as string;

    if (!oldPwd) {
      clientErrors.oldPwd = 'This input is required.';
    }

    if (!newPwd) {
      clientErrors.newPwd = 'This input is required.';
    }

    if (!confirmedPwd) {
      clientErrors.confirmedPwd = 'This input is required.';
    }

    if (confirmedPwd !== newPwd) {
      clientErrors.newPwd = 'Passwords are not identical.';
      clientErrors.confirmedPwd = 'Passwords are not identical.';
    }

    if (Object.keys(clientErrors).length > 0) {
      return { clientErrors };
    }

    try {
      await updatePassword(user.id, oldPwd, newPwd);
    } catch (error) {
      if (error instanceof Error) {
        return { serverError: error.message };
      }
    }
  }

  return null;
};

const AccountPreferences = () => {
  // const { user } = useLoaderData<typeof loader>();
  const [open, setIsOpen] = useState(true);
  const { triggerDelayedNavigation } = useDelayedNavigation();
  const [value, setValue] = useState('');

  const handleClose = () => {
    setIsOpen(false);
    triggerDelayedNavigation('/dashboard'); // delay navigation to allow dialog to close with animation
  };

  return (
    <Dialog
      static
      open={open}
      onClose={handleClose}>
      <DialogPanel className='lg:w-[40vw] big-dialog'>
        <h3 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong pb-4'>
          Account Preferences
        </h3>

        <Form>
          <label
            className='text-tremor-default text-tremor-content dark:text-dark-tremor-content'
            htmlFor='distance'>
            Color theme
          </label>
          <Select
            className='mt-2'
            id='distance'
            name='distance'
            value={value}
            onValueChange={setValue}>
            <SelectItem
              icon={RiComputerLine}
              value='1'>
              System
            </SelectItem>
            <SelectItem
              icon={RiSunLine}
              value='2'>
              Light
            </SelectItem>
            <SelectItem
              icon={RiMoonLine}
              value='3'>
              Dark
            </SelectItem>
          </Select>

          <Button
            className='w-full mt-4'
            onClick={handleClose}>
            Update
          </Button>
        </Form>

        <Divider />
        <div className='mt-8 flex items-center justify-end space-x-2'>
          <Button
            variant='secondary'
            onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default AccountPreferences;
