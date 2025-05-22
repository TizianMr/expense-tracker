import { Prisma } from '@prisma/client';
import { ActionFunctionArgs } from '@remix-run/node';
import { Form, redirect, useActionData, useNavigation } from '@remix-run/react';
import { Button, Dialog, DialogPanel } from '@tremor/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';
import { getLoggedInUser } from '~/db/auth.server';
import { deleteBudget } from '~/db/budget.server';
import i18next from '~/utils/i18n/i18next.server';

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const budgetId = params.budget as string;
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const t = await i18next.getFixedT(request);

  try {
    await deleteBudget(budgetId, user.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { serverError: (error.meta?.cause as string) || t('common.unknownError') };
    }
  }

  return { budgetId };
};

const DeleteBudgetDialog = () => {
  const data = useActionData<typeof action>();
  const { t } = useTranslation();
  const { state } = useNavigation();
  const { triggerDelayedNavigation } = useDelayedNavigation();
  const [isOpen, setIsOpen] = useState(true);

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
      open={isOpen}
      static={true}
      onClose={handleClose}>
      <DialogPanel>
        <h1 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
          {t('DeleteBudgetDialog.title')}
        </h1>
        <p className='mt-2 leading-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content'>
          {t('DeleteBudgetDialog.text')}
        </p>
        {data?.serverError && (
          <p className='mt-2 text-tremor-label text-red-500 dark:text-red-300'>{data.serverError}</p>
        )}
        <div className='mt-8 flex items-center justify-end space-x-2'>
          <Button
            variant='secondary'
            onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Form method='delete'>
            <Button
              color='red'
              disabled={data?.serverError !== undefined}
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

export default DeleteBudgetDialog;
