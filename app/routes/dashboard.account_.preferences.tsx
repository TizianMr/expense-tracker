import { ColorTheme, Locale, Prisma } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, redirect, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { RiComputerLine, RiMoonLine, RiSunLine } from '@remixicon/react';
import { Button, Dialog, DialogPanel, Divider, Select, SelectItem } from '@tremor/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';
import { getLoggedInUser, updateSession } from '~/db/auth.server';
import { fetchUserPreferences, updateUserPreferences } from '~/db/user.server';
import { LOCALES } from '~/utils/constants';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const userPreferences = await fetchUserPreferences(user.id);

  return { userPreferences, colorThemes: Object.values(ColorTheme) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const formData = await request.formData();
  const colorTheme = formData.get('colorTheme') as ColorTheme | 'SYSTEM';
  const locale = formData.get('locale') as Locale;

  try {
    const newUserPreferences = await updateUserPreferences({
      id: user.preferences.id,
      theme: colorTheme === 'SYSTEM' ? null : colorTheme,
      locale,
    });
    return await updateSession(request, { ...user, preferences: newUserPreferences });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { serverError: (error.meta?.cause as string) || 'An unknown error occurred.' };
    }
  }
};

const AccountPreferences = () => {
  const { i18n } = useTranslation();
  const { state } = useNavigation();
  const { t } = useTranslation();
  const { userPreferences, colorThemes } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  const [isOpen, setIsOpen] = useState(true);
  const { triggerDelayedNavigation } = useDelayedNavigation();

  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerDelayedNavigation('/dashboard'); // delay navigation to allow dialog to close with animation
  }, [triggerDelayedNavigation]);

  useEffect(() => {
    if (data && !data.serverError) {
      if (isOpen) {
        handleClose();
      }
    }
  }, [data, handleClose, isOpen]);

  useEffect(() => {
    i18n.changeLanguage(userPreferences?.locale);
  }, [i18n, userPreferences?.locale, userPreferences?.theme]);

  return (
    <Dialog
      static
      open={isOpen}
      onClose={handleClose}>
      <DialogPanel className='lg:w-[40vw] big-dialog'>
        <h3 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong pb-4'>
          {t('AccountPreferences.title')}
        </h3>

        <Form method='post'>
          <div className='space-y-6'>
            <div>
              <label
                className='text-tremor-default text-tremor-content dark:text-dark-tremor-content'
                htmlFor='color-theme'>
                {t('AccountPreferences.theme')}
              </label>
              <Select
                className='mt-2'
                defaultValue={userPreferences?.theme || 'SYSTEM'}
                id='color-theme'
                name='colorTheme'>
                {[...colorThemes, 'SYSTEM'].map(theme => (
                  <SelectItem
                    icon={theme === 'SYSTEM' ? RiComputerLine : theme === 'LIGHT' ? RiSunLine : RiMoonLine}
                    key={theme}
                    value={theme}>
                    {t(`AccountPreferences.color.${theme}`)}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label
                className='text-tremor-default text-tremor-content dark:text-dark-tremor-content'
                htmlFor='lang'>
                {t('AccountPreferences.lang')}
              </label>
              <Select
                className='mt-2'
                defaultValue={userPreferences?.locale}
                id='lang'
                name='locale'>
                {LOCALES.map(locale => (
                  <SelectItem
                    key={locale.value}
                    value={locale.value}>
                    {locale.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <Button
            className='w-full mt-4'
            loading={state === 'submitting'}
            type='submit'>
            {t('AccountPreferences.submit')}
          </Button>
        </Form>

        {data?.serverError && (
          <p className='mt-2 text-center text-tremor-label text-red-500 dark:text-red-300'>{data.serverError}</p>
        )}

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

export default AccountPreferences;
