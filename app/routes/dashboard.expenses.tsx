import { Expense } from '@prisma/client';
import { Outlet, useFetcher, useLocation, useNavigate, useOutlet } from '@remix-run/react';
import { Button, Dialog, DialogPanel, Divider } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';

export type ExpenseFormErrors = {
  title?: string;
  amount?: string;
  date?: string;
};

const ExpenseDialogRoot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inOutlet = !!useOutlet();
  const { t } = useTranslation();
  const { triggerDelayedNavigation } = useDelayedNavigation();

  const pathnames = location.pathname.split('/expenses/');
  const action = pathnames[pathnames.length - 1];
  const isEdit = action.includes('edit');

  const formRef = useRef<HTMLFormElement>(null);

  const fetcher = useFetcher<Expense>();
  const isSubmitting = fetcher.state === 'submitting';

  const [isOpen, setIsOpen] = useState(inOutlet);
  const [errors, setErrors] = useState<ExpenseFormErrors>({});

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setIsOpen(false);
    }
  }, [fetcher.data, fetcher.state, navigate]);

  const handleClose = () => {
    setIsOpen(false);
    triggerDelayedNavigation('/dashboard'); // delay navigation to allow dialog to close with animation
    setErrors({});
  };

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const formData = new FormData(formRef.current!);

    const errors: ExpenseFormErrors = {};

    if (!formData.get('title')) {
      errors['title'] = t('ExpenseDialogRoot.errors.required');
    }

    if (!formData.get('amount')) {
      errors['amount'] = t('ExpenseDialogRoot.errors.required');
    }

    const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');
    if (isNaN(Number(convertedAmount))) {
      errors['amount'] = t('ExpenseDialogRoot.errors.invalidAmount');
    }

    if (!formData.get('date')) {
      errors['date'] = t('ExpenseDialogRoot.errors.required');
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
    } else {
      fetcher.submit(formData, { method: isEdit ? 'put' : 'post', action });
      handleClose();
    }
  };

  if (pathnames.length < 2) {
    navigate('/dashboard');
  }

  return (
    <Dialog
      static
      open={isOpen}
      onClose={handleClose}>
      <DialogPanel>
        <h3 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
          {t(`ExpenseDialogRoot.title.${isEdit ? 'edit' : 'create'}`)}
        </h3>
        <p className='mt-1 pb-4 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content'>
          {t('ExpenseDialogRoot.subtitle')}
        </p>
        <fetcher.Form
          id='expenseForm'
          ref={formRef}>
          <Outlet context={{ errors }} />
        </fetcher.Form>
        <Divider />
        <div className='mt-8 flex items-center justify-end space-x-2'>
          <Button
            variant='secondary'
            onClick={handleClose}>
            Cancel
          </Button>
          <Button
            loading={isSubmitting}
            variant='primary'
            onClick={handleSubmit}>
            {t(`common.${isEdit ? 'edit' : 'create'}`)}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default ExpenseDialogRoot;
