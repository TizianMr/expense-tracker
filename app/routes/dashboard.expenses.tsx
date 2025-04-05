import { Button } from '@chakra-ui/react';
import { Expense } from '@prisma/client';
import { Outlet, useFetcher, useLocation, useNavigate, useOutlet } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

import {
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '../components/ui/dialog';

export type FormErrors = {
  title?: string;
  amount?: string;
  date?: string;
};

const ExpenseDialog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inOutlet = !!useOutlet();

  const pathnames = location.pathname.split('/');
  const action: 'create' | 'edit' = pathnames[pathnames.length - 1] as 'create' | 'edit';

  const formRef = useRef<HTMLFormElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // https://github.com/remix-run/remix/discussions/2749
  const [fetcherKey, setFetcherKey] = useState('');
  const fetcher = useFetcher<Expense>({ key: fetcherKey });
  const isSubmitting = fetcher.state === 'submitting';

  const [isOpen, setIsOpen] = useState(inOutlet);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setFetcherKey(fetcher.data.id);
      setIsOpen(false);
    }
  }, [fetcher.data, fetcher.state, navigate]);

  const handleClose = () => {
    setIsOpen(false);
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

    if (!formData.get('date')) {
      errors['date'] = 'Date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
    } else {
      setErrors({});
      //   if (expense?.id) {
      //     formData.append('expenseId', expense.id.toString());
      //   }
      fetcher.submit(formData, { method: action === 'edit' ? 'put' : 'post', action });
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onExitComplete={() => navigate('/dashboard')}
      onOpenChange={handleClose}>
      <DialogBackdrop />
      <DialogContent ref={contentRef}>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>Create Expense</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <fetcher.Form
            id='expenseForm'
            ref={formRef}>
            <Outlet context={{ contentRef, errors }} />
          </fetcher.Form>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button
              variant='outline'
              onClick={() => setErrors({})}>
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            form='expenseForm'
            loading={isSubmitting}
            type='submit'
            onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default ExpenseDialog;
