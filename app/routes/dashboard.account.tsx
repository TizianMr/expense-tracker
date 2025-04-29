import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useActionData, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react';
import { RiUserLine } from '@remixicon/react';
import {
  Button,
  Dialog,
  DialogPanel,
  Divider,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  TextInput,
} from '@tremor/react';
import qs from 'qs';
import { useCallback, useEffect, useState } from 'react';

import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';
import { getLoggedInUser, sessionStorage } from '~/db/auth.server';
import { updateMailAddress, updatePassword } from '~/db/user.server';
import { QueryParams } from '~/interfaces';

type ChangeMailErrors = {
  newMail?: string;
  confirmedMail?: string;
};

type ChangePwdErrors = {
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

  return { user }; // continue to render the page
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const formData = await request.formData();
  const url = new URL(request.url);
  const query = url.searchParams;
  const parsedQueryParams = qs.parse(query.toString()) as QueryParams;

  if (parsedQueryParams.tab === 'email') {
    const errors: ChangeMailErrors = {};
    const newMail = formData.get('new-email') as string;
    const confirmedMail = formData.get('confirm-email') as string;

    if (newMail !== confirmedMail) {
      errors.newMail = 'Mail addresses are not identical.';
      errors.confirmedMail = 'Mail addresses are not identical.';
    }

    if (!newMail) {
      errors.newMail = 'This input is required.';
    }

    if (!confirmedMail) {
      errors.confirmedMail = 'This input is required.';
    }

    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    const updatedUser = await updateMailAddress(user.id, newMail);

    const session = await sessionStorage.getSession(request.headers.get('cookie'));
    session.set('user', updatedUser);

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  } else if (parsedQueryParams.tab === 'password') {
    const errors: ChangePwdErrors = {};
    const oldPwd = formData.get('old-password') as string;
    const newPwd = formData.get('new-password') as string;
    const confirmedPwd = formData.get('new-password') as string;

    if (!oldPwd) {
      errors.oldPwd = 'This input is required.';
    }

    if (!newPwd) {
      errors.newPwd = 'This input is required.';
    }

    if (!confirmedPwd) {
      errors.confirmedPwd = 'This input is required.';
    }

    if (confirmedPwd !== newPwd) {
      errors.newPwd = 'Passwords are not identical.';
      errors.confirmedPwd = 'Passwords are not identical.';
    }

    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    const updatedUser = await updatePassword(user.id, oldPwd, newPwd);

    const session = await sessionStorage.getSession(request.headers.get('cookie'));
    session.set('user', updatedUser);

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  }

  return null;
};

const AccountSettings = () => {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [open, setIsOpen] = useState(true);
  const fetcher = useFetcher<{
    success?: boolean;
    errors?: ChangeMailErrors | ChangePwdErrors;
  }>();
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

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      handleClose();
    }
  }, [fetcher.data, fetcher.state, handleClose]);

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
            <span
              aria-hidden='true'
              className='hidden h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white overflow-hidden sm:flex dark:border-gray-800 dark:bg-gray-950'>
              <RiUserLine />
            </span>
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
                        error={!!(actionData?.errors as ChangeMailErrors)?.newMail}
                        errorMessage={(actionData?.errors as ChangeMailErrors)?.newMail}
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
                        error={!!(actionData?.errors as ChangeMailErrors)?.confirmedMail}
                        errorMessage={(actionData?.errors as ChangeMailErrors)?.confirmedMail}
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
                  </div>
                </fetcher.Form>
              </TabPanel>
              <TabPanel>
                <fetcher.Form method='put'>
                  <div className='space-y-4'>
                    <div>
                      <label
                        className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
                        htmlFor='old-password'>
                        Old password <span className='text-red-500'>*</span>
                      </label>
                      <TextInput
                        autoComplete='password'
                        className='mt-2'
                        error={!!(actionData?.errors as ChangePwdErrors)?.oldPwd}
                        errorMessage={(actionData?.errors as ChangePwdErrors)?.oldPwd}
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
                        New password <span className='text-red-500'>*</span>
                      </label>
                      <TextInput
                        autoComplete='password'
                        className='mt-2'
                        error={!!(actionData?.errors as ChangePwdErrors)?.newPwd}
                        errorMessage={(actionData?.errors as ChangePwdErrors)?.newPwd}
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
                        Confirm new password <span className='text-red-500'>*</span>
                      </label>
                      <TextInput
                        autoComplete='password'
                        className='mt-2'
                        error={!!(actionData?.errors as ChangePwdErrors)?.confirmedPwd}
                        errorMessage={(actionData?.errors as ChangePwdErrors)?.confirmedPwd}
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
                      Change
                    </Button>
                  </div>
                </fetcher.Form>
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
