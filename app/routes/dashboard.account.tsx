import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useLoaderData, useSearchParams } from '@remix-run/react';
import { RiPencilLine, RiUserLine } from '@remixicon/react';
import { Button, Dialog, DialogPanel, Divider, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import qs from 'qs';
import { useCallback, useState } from 'react';

import ChangeMailForm from '~/components/change-mail-form';
import ChangePasswordForm from '~/components/change-password-form';
import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';
import { getLoggedInUser, sessionStorage } from '~/db/auth.server';
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

const TAB_VALUES = [
  { label: 'Change Email', value: 'email' },
  { label: 'Change Password', value: 'password' },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const url = new URL(request.url);

  if (!url.searchParams.has('tab')) {
    url.searchParams.set('tab', TAB_VALUES[0].value);
    return redirect(url.toString());
  }

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

      const session = await sessionStorage.getSession(request.headers.get('cookie'));
      session.set('user', updatedUser);

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return { serverError: error.message };
      }
    }
  } else if (parsedQueryParams.tab === 'password') {
    const clientErrors: ChangePwdFormErrors = {};
    const oldPwd = formData.get('old-password') as string;
    const newPwd = formData.get('new-password') as string;
    const confirmedPwd = formData.get('new-password') as string;

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
      const updatedUser = await updatePassword(user.id, oldPwd, newPwd);

      const session = await sessionStorage.getSession(request.headers.get('cookie'));
      session.set('user', updatedUser);

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': await sessionStorage.commitSession(session),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return { serverError: error.message };
      }
    }
  }

  return null;
};

const AccountSettings = () => {
  const { user } = useLoaderData<typeof loader>();
  const [open, setIsOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { triggerDelayedNavigation } = useDelayedNavigation('/dashboard');
  const nestedParams = qs.parse(searchParams.toString()) as QueryParams;

  const handleTabChange = (idx: number) => {
    const updatedSearchParams = {
      tab: TAB_VALUES[idx].value,
    };

    setSearchParams(qs.stringify(updatedSearchParams), { preventScrollReset: true });
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerDelayedNavigation(); // delay navigation to allow dialog to close with animation
  }, [triggerDelayedNavigation]);

  return (
    <Dialog
      static
      open={open}
      onClose={handleClose}>
      <DialogPanel className='w-[40vw] big-dialog'>
        <h3 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
          Account Settings
        </h3>
        <div className='flex'>
          <div className='w-[60%] flex flex-col space-y-2 justify-center items-center pt-4'>
            <label
              className='group relative hidden h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white overflow-hidden sm:flex dark:border-gray-800 dark:bg-gray-950 hover:bg-gray-300 cursor-pointer duration-300 ease-in-out'
              htmlFor='profile-picture'>
              <RiPencilLine className='absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out' />
              <RiUserLine className='group-hover:opacity-50 transition-opacity duration-300 ease-in-out' />
              <input
                accept='image/*'
                className='hidden'
                id='profile-picture'
                type='file'
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // trigger action for updloading a file
                    console.log('Selected file:', file);
                    // Handle the file upload logic here
                  }
                }}
              />
            </label>
            <div className='truncate text-center'>
              <p className='text-tremor-default text-tremor-content-strong truncate'>{`${user.firstName} ${user.lastName}`}</p>
              <p className='text-tremor-default text-tremor-content dark:text-dark-tremor-content truncate'>
                {user.email}
              </p>
            </div>
          </div>

          <TabGroup
            defaultIndex={TAB_VALUES.findIndex(tab => tab.value === nestedParams.tab)}
            onIndexChange={handleTabChange}>
            <TabList variant='line'>
              {TAB_VALUES.map(tab => (
                <Tab
                  key={tab.value}
                  value={tab.value}>
                  {tab.label}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              <TabPanel>
                <ChangeMailForm onSuccess={handleClose} />
              </TabPanel>
              <TabPanel>
                <ChangePasswordForm onSuccess={handleClose} />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>

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

export default AccountSettings;
