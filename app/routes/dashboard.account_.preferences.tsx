import { ColorTheme, Prisma } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, redirect, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { RiComputerLine, RiMoonLine, RiSunLine } from '@remixicon/react';
import { Button, Dialog, DialogPanel, Divider, Select, SelectItem } from '@tremor/react';
import { useCallback, useEffect, useState } from 'react';

import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';
import { getLoggedInUser } from '~/db/auth.server';
import { updateUserPreferences } from '~/db/user.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  return { user, colorThemes: Object.values(ColorTheme) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const formData = await request.formData();
  const colorTheme = formData.get('colorTheme') as ColorTheme;

  try {
    const newUserPreferences = await updateUserPreferences({
      id: user.preferences.id,
      theme: colorTheme,
    });
    return { preferences: newUserPreferences };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { serverError: (error.meta?.cause as string) || 'An unknown error occurred.' };
    }
  }
};

const AccountPreferences = () => {
  const { state } = useNavigation();
  const { user, colorThemes } = useLoaderData<typeof loader>();
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

  return (
    <Dialog
      static
      open={isOpen}
      onClose={handleClose}>
      <DialogPanel className='lg:w-[40vw] big-dialog'>
        <h3 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong pb-4'>
          Account Preferences
        </h3>

        <Form method='post'>
          <label
            className='text-tremor-default text-tremor-content dark:text-dark-tremor-content'
            htmlFor='color-theme'>
            Color theme
          </label>
          <Select
            className='mt-2'
            defaultValue={user.preferences.theme}
            id='color-theme'
            name='colorTheme'>
            {colorThemes.map(theme => (
              <SelectItem
                icon={theme === 'SYSTEM' ? RiComputerLine : theme === 'LIGHT' ? RiSunLine : RiMoonLine}
                key={theme}
                value={theme}>
                {theme.charAt(0) + theme.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </Select>

          <Button
            className='w-full mt-4'
            loading={state === 'submitting'}
            type='submit'>
            Update
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
            Close
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default AccountPreferences;
