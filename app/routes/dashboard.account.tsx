import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, redirect, useLoaderData, useSearchParams, useSubmit } from '@remix-run/react';
import { RiPencilLine, RiUserLine } from '@remixicon/react';
import { Button, Dialog, DialogPanel, Divider, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import qs from 'qs';
import { useCallback, useState } from 'react';

import ChangeMailForm from '~/components/change-mail-form';
import ChangePasswordForm from '~/components/change-password-form';
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

const AccountSettings = () => {
  const { user } = useLoaderData<typeof loader>();
  const [open, setIsOpen] = useState(true);
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();
  const { triggerDelayedNavigation } = useDelayedNavigation();
  const nestedParams = qs.parse(searchParams.toString()) as QueryParams;

  const handleTabChange = (idx: number) => {
    const updatedSearchParams = {
      tab: TAB_VALUES[idx].value,
    };

    setSearchParams(qs.stringify(updatedSearchParams), { preventScrollReset: true });
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerDelayedNavigation('/dashboard'); // delay navigation to allow dialog to close with animation
  }, [triggerDelayedNavigation]);

  return (
    <Dialog
      static
      open={open}
      onClose={handleClose}>
      <DialogPanel className='lg:w-[40vw] big-dialog'>
        <h3 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
          Account Settings
        </h3>
        <div className='flex lg:flex-row flex-col'>
          <div className='lg:w-[60%] flex flex-col space-y-2 justify-center items-center pt-4'>
            <Form
              method='post'
              onChange={e => {
                submit(e.currentTarget, {
                  action: '/avatar',
                  encType: 'multipart/form-data',
                  navigate: false,
                });
              }}>
              <label
                className='group relative h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white overflow-hidden flex dark:border-gray-800 dark:bg-gray-950 hover:bg-gray-600 cursor-pointer duration-300 ease-in-out'
                htmlFor='profile-pic'>
                <RiPencilLine
                  className='absolute inset-0 m-auto opacity-0 group-hover:opacity-100 duration-300 ease-in-out z-10'
                  color='white'
                />

                {user.profilePicture ? (
                  <span className='group-hover:opacity-50 duration-300 ease-in-out'>
                    <img
                      alt='avatar'
                      src={user.profilePicture}
                    />
                  </span>
                ) : (
                  <RiUserLine className='group-hover:opacity-50 duration-300 ease-in-out' />
                )}

                <input
                  accept='image/*'
                  className='hidden'
                  id='profile-pic'
                  name='profile-pic'
                  type='file'
                />
              </label>
            </Form>
            <div className='truncate text-center'>
              <p className='text-tremor-default text-tremor-content-strong truncate'>{`${user.firstName} ${user.lastName}`}</p>
              <p className='text-tremor-default text-tremor-content dark:text-dark-tremor-content truncate'>
                {user.email}
              </p>
            </div>
            <Button
              color='red'
              variant='light'
              onClick={() => {
                setIsOpen(false);
                triggerDelayedNavigation('delete');
              }}>
              Delete account
            </Button>
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
