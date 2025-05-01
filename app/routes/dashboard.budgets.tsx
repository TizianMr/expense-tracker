import { Budget } from '@prisma/client';
import { Outlet, useFetcher, useLocation, useNavigate, useOutlet } from '@remix-run/react';
import { Button, Dialog, DialogPanel, Divider } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';

import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';

export type BudgetFormErrors = {
  title?: string;
  amount?: string;
};

const BudgetDialogRoot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inOutlet = !!useOutlet();
  const { triggerDelayedNavigation } = useDelayedNavigation();

  const pathnames = location.pathname.split('/budgets/');
  const action = pathnames[pathnames.length - 1];
  const isEdit = action.includes('edit');

  const formRef = useRef<HTMLFormElement>(null);

  const fetcher = useFetcher<Budget>();
  const isSubmitting = fetcher.state === 'submitting';

  const [isOpen, setIsOpen] = useState(inOutlet);
  const [errors, setErrors] = useState<BudgetFormErrors>({});

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

    const errors: BudgetFormErrors = {};

    if (!formData.get('title')) {
      errors['title'] = 'Title is required.';
    }

    if (!formData.get('amount')) {
      errors['amount'] = 'Amount is required.';
    }

    const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');
    if (isNaN(Number(convertedAmount))) {
      errors['amount'] = 'Amount is not a valid number.';
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
          {`${isEdit ? 'Edit' : 'Create'} budget`}
        </h3>
        <p className='mt-1 pb-4 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content'>
          Keep track of your expenses by using budgets. Budgets reset every month.
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
            {`${isEdit ? 'Edit' : 'Create'}`}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default BudgetDialogRoot;
