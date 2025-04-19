import { Expense } from '@prisma/client';
import { Outlet, useFetcher, useLocation, useNavigate, useOutlet } from '@remix-run/react';
import { Button, Dialog, DialogPanel, Divider } from '@tremor/react';
import { useEffect, useRef, useState } from 'react';

export type FormErrors = {
  title?: string;
  amount?: string;
  date?: string;
};

const ExpenseDialogRoot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inOutlet = !!useOutlet();

  const pathnames = location.pathname.split('/expenses/');
  const action = pathnames[pathnames.length - 1];
  const isEdit = action.includes('edit');

  const formRef = useRef<HTMLFormElement>(null);

  const fetcher = useFetcher<Expense>();
  const isSubmitting = fetcher.state === 'submitting';

  const [isOpen, setIsOpen] = useState(inOutlet);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setIsOpen(false);
    }
  }, [fetcher.data, fetcher.state, navigate]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setErrors({});
      navigate('/dashboard');
    }, 200); // delay navigation to allow dialog to close with animation
  };

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const formData = new FormData(formRef.current!);

    const errors: { title?: string; amount?: string; date?: string } = {};

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

    if (!formData.get('date')) {
      errors['date'] = 'Date is required.';
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
        <h3 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong pb-4'>
          {`${isEdit ? 'Edit' : 'Create'} expense`}
        </h3>
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
            Create
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default ExpenseDialogRoot;
