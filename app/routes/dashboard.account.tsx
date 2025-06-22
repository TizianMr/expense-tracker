import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, redirect, useLoaderData, useSearchParams, useSubmit } from '@remix-run/react';
import { RiPencilLine, RiUserLine } from '@remixicon/react';
import { Button, Dialog, DialogPanel, Divider, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import qs from 'qs';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { jsonWithError, jsonWithSuccess } from 'remix-toast';

import ChangeMailForm from '~/components/feature/user-mgmt/change-mail-form';
import ChangePasswordForm from '~/components/feature/user-mgmt/change-password-form';
import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';
import { getLoggedInUser, updateSession } from '~/db/auth.server';
import { updateMailAddress, updatePassword } from '~/db/user.server';
import { QueryParams } from '~/interfaces';
import { cx } from '~/utils/helpers';
import i18next from '~/utils/i18n/i18next.server';

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

  const TAB_VALUES = ['email', 'password'];

  const url = new URL(request.url);

  if (!url.searchParams.has('tab')) {
    url.searchParams.set('tab', TAB_VALUES[0]);
    return redirect(url.toString());
  }

  return { user, TAB_VALUES };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user || user.isGithubUser) throw redirect('/login');

  const t = await i18next.getFixedT(request);
  const formData = await request.formData();
  const url = new URL(request.url);
  const query = url.searchParams;
  const parsedQueryParams = qs.parse(query.toString()) as QueryParams;

  if (parsedQueryParams.tab === 'email') {
    const clientErrors: ChangeMailFormErrors = {};
    const newMail = formData.get('new-email') as string;
    const confirmedMail = formData.get('confirm-email') as string;

    if (newMail !== confirmedMail) {
      clientErrors.newMail = t('AccountSettings.errors.mailNotIdentical');
      clientErrors.confirmedMail = t('AccountSettings.errors.mailNotIdentical');
    }

    if (!newMail) {
      clientErrors.newMail = t('AccountSettings.errors.required');
    }

    if (!confirmedMail) {
      clientErrors.confirmedMail = t('AccountSettings.errors.required');
    }

    if (Object.keys(clientErrors).length > 0) {
      return { clientErrors };
    }

    try {
      const updatedUser = await updateMailAddress(user.id, newMail);

      return jsonWithSuccess(
        await updateSession(request, { ...user, ...updatedUser }),
        t('AccountSettings.success.update'),
      );
    } catch (error) {
      if (error instanceof Error) {
        return jsonWithError({ serverError: error.message }, t('AccountSettings.error.update'));
      }
    }
  } else if (parsedQueryParams.tab === 'password') {
    const clientErrors: ChangePwdFormErrors = {};
    const oldPwd = formData.get('old-password') as string;
    const newPwd = formData.get('new-password') as string;
    const confirmedPwd = formData.get('confirm-password') as string;

    if (!oldPwd) {
      clientErrors.oldPwd = t('AccountSettings.errors.required');
    }

    if (!newPwd) {
      clientErrors.newPwd = t('AccountSettings.errors.required');
    }

    if (!confirmedPwd) {
      clientErrors.confirmedPwd = t('AccountSettings.errors.required');
    }

    if (confirmedPwd !== newPwd) {
      clientErrors.newPwd = t('AccountSettings.errors.pwdNotIdentical');
      clientErrors.confirmedPwd = t('AccountSettings.errors.pwdNotIdentical');
    }

    if (Object.keys(clientErrors).length > 0) {
      return { clientErrors };
    }

    try {
      await updatePassword(user.id, oldPwd, newPwd);
      return jsonWithSuccess(null, t('AccountSettings.success.update'));
    } catch (error) {
      if (error instanceof Error) {
        return jsonWithError({ serverError: error.message }, t('AccountSettings.error.update'));
      }
    }
  }

  return null;
};

const AccountSettings = () => {
  const { user, TAB_VALUES } = useLoaderData<typeof loader>();
  const [open, setIsOpen] = useState(true);
  const submit = useSubmit();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { triggerDelayedNavigation } = useDelayedNavigation({ searchParams: { clear: true, keys: ['tab'] } });
  const nestedParams = qs.parse(searchParams.toString()) as QueryParams;

  const handleTabChange = (idx: number) => {
    const updatedSearchParams = {
      tab: TAB_VALUES[idx],
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
      <DialogPanel className='lg:w-[45vw] big-dialog'>
        <h3 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
          {t('AccountSettings.title')}
        </h3>
        <div className='flex lg:flex-row flex-col'>
          <div
            className={cx(
              'flex flex-col space-y-2 justify-center items-center pt-4',
              user.isGithubUser ? 'lg:w-[100%]' : 'lg:w-[60%]',
            )}>
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
                className={cx(
                  'group relative h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white overflow-hidden flex dark:border-gray-800 dark:bg-gray-950',
                  !user.isGithubUser && 'cursor-pointer duration-300 ease-in-out hover:bg-gray-600',
                )}
                htmlFor='profile-pic'>
                {!user.isGithubUser && (
                  <RiPencilLine
                    className='absolute inset-0 m-auto opacity-0 group-hover:opacity-100 duration-300 ease-in-out z-10'
                    color='white'
                  />
                )}

                {user.profilePicture ? (
                  <span className={cx(!user.isGithubUser && 'group-hover:opacity-50 duration-300 ease-in-out')}>
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
                  disabled={user.isGithubUser}
                  id='profile-pic'
                  name='profile-pic'
                  type='file'
                />
              </label>
            </Form>
            <div className='truncate text-center'>
              <p className='text-tremor-default text-tremor-content-strong truncate dark:dark:text-dark-tremor-content-strong'>{`${user.firstName} ${user.lastName ?? ''}`}</p>
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
              {t('AccountSettings.delete')}
            </Button>
          </div>

          {!user.isGithubUser && (
            <TabGroup
              defaultIndex={TAB_VALUES.findIndex(tab => tab === nestedParams.tab)}
              onIndexChange={handleTabChange}>
              <TabList variant='line'>
                {TAB_VALUES.map(tab => (
                  <Tab
                    key={tab}
                    value={tab}>
                    {t(`AccountSettings.${tab}`)}
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
          )}
        </div>

        <Divider />
        <div className='mt-8 flex items-center justify-end space-x-2'>
          <Button
            variant='secondary'
            onClick={handleClose}>
            {t('common.close')}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default AccountSettings;
