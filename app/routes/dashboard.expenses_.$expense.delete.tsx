import { ActionFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useNavigate, useNavigation } from '@remix-run/react';
import { Button, Dialog, DialogPanel } from '@tremor/react';
import { useCallback, useEffect, useState } from 'react';

import { deleteExpense } from '../db/expense.server';

export const action = async ({ params }: ActionFunctionArgs) => {
  const expenseId = params.expense as string;

  await deleteExpense({ id: expenseId });

  return { expenseId };
};

const DeleteDialog = () => {
  const data = useActionData<typeof action>();
  const navigate = useNavigate();
  const { state } = useNavigation();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      navigate('/dashboard');
    }, 200); // delay navigation to allow dialog to close with animation
  }, [navigate]);

  useEffect(() => {
    if (data) {
      handleClose();
    }
  }, [data, handleClose, navigate]);

  return (
    <Dialog
      open={isOpen}
      static={true}
      onClose={handleClose}>
      <DialogPanel>
        <h1 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
          Delete expense?
        </h1>
        <p className='mt-2 leading-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content'>
          Deleted expenses cannot be restored.
        </p>
        <div className='mt-8 flex items-center justify-end space-x-2'>
          <Button
            variant='secondary'
            onClick={handleClose}>
            Cancel
          </Button>
          <Form method='delete'>
            <Button
              color='red'
              loading={state === 'submitting'}
              type='submit'
              variant='primary'>
              Delete
            </Button>
          </Form>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default DeleteDialog;
