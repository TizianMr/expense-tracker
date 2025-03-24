import { Button, Input, Stack } from '@chakra-ui/react';
import { Expense } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { FaEuroSign } from 'react-icons/fa';

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
} from './ui/dialog';
import { Field } from './ui/field';
import { InputGroup } from './ui/input-group';
import { NumberInputField, NumberInputRoot } from './ui/number-input';
import { SelectContent, SelectItem, SelectLabel, SelectRoot, SelectTrigger, SelectValueText } from './ui/select';
import { EXPENSE_CATEGORIES } from '../utils/constants';

type Props = {
  expense?: Expense;
  title: string;
  action: string;
  isOpen: boolean;
  onClose: () => void;
};

const ExpenseDialog = ({ expense, title, action, isOpen, onClose }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // https://github.com/remix-run/remix/discussions/2749
  const [fetcherKey, setFetcherKey] = useState(expense?.id);
  const fetcher = useFetcher<Expense>({ key: fetcherKey });
  const isSubmitting = fetcher.state === 'submitting';

  const [errors, setErrors] = useState<{
    title?: string;
    amount?: string;
    date?: string;
  }>({});

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setFetcherKey(fetcher.data.id);
      onClose();
    }
  }, [fetcher.data, fetcher.state, onClose]);

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
      if (expense?.id) {
        formData.append('expenseId', expense.id.toString());
      }
      fetcher.submit(formData, { method: expense ? 'put' : 'post', action });
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={onClose}>
      <DialogBackdrop />
      <DialogContent ref={contentRef}>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <fetcher.Form
            ref={formRef}
            id='expenseForm'
            method='post'>
            <Stack gap='4'>
              <Field
                errorText={errors.title}
                label='Title'
                required
                invalid={!!errors.title}>
                <Input
                  name='title'
                  defaultValue={expense?.title ?? ''}
                  placeholder='Groceries'
                />
              </Field>
              <Field
                label='Amount'
                errorText={errors.amount}
                invalid={!!errors.amount}
                required>
                <NumberInputRoot
                  allowMouseWheel
                  width='100%'
                  defaultValue={expense?.amount.toString() ?? '0'}
                  name='amount'
                  locale='de-DE'
                  formatOptions={{
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  }}>
                  <InputGroup
                    width={'100%'}
                    startElement={<FaEuroSign />}>
                    <NumberInputField pattern='\d{1,3}(.\d{3})*(,\d{2})?' />
                  </InputGroup>
                </NumberInputRoot>
              </Field>
              <Field
                label='Date'
                errorText={errors.date}
                invalid={!!errors.date}
                required>
                <Input
                  name='date'
                  type='date'
                  defaultValue={expense?.expenseDate.toISOString().split('T')[0] ?? ''}
                />
              </Field>
              <SelectRoot
                name='category'
                defaultValue={[expense?.category ?? '']}
                collection={EXPENSE_CATEGORIES}>
                <SelectLabel>Category</SelectLabel>
                <SelectTrigger>
                  <SelectValueText placeholder='Select category' />
                </SelectTrigger>
                <SelectContent portalRef={contentRef}>
                  {EXPENSE_CATEGORIES.items.map(item => (
                    <SelectItem
                      item={item}
                      key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              <Input
                visibility='hidden'
                type='submit'
                id='submit-form'
              />
            </Stack>
          </fetcher.Form>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button
              onClick={() => setErrors({})}
              variant='outline'>
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            loading={isSubmitting}
            form='expenseForm'
            onClick={handleSubmit}
            type='submit'>
            Save
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default ExpenseDialog;
