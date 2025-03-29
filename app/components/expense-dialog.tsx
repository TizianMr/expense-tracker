import { Button, createListCollection, Input, ListCollection, Stack } from '@chakra-ui/react';
import { Budget, Expense } from '@prisma/client';
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
  budgets: Pick<Budget, 'id' | 'title'>[];
  title: string;
  action: string;
  isOpen: boolean;
  onClose: () => void;
};

const ExpenseDialog = ({ expense, budgets, title, action, isOpen, onClose }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // https://github.com/remix-run/remix/discussions/2749
  const [fetcherKey, setFetcherKey] = useState(expense?.id);
  const [budgetCollection, setBudgetCollection] = useState<ListCollection<{ label: string; value: string }>>(
    createListCollection({ items: [] }),
  );
  const fetcher = useFetcher<Expense>({ key: fetcherKey });
  const isSubmitting = fetcher.state === 'submitting';

  const [errors, setErrors] = useState<{
    title?: string;
    amount?: string;
    date?: string;
  }>({});

  useEffect(() => {
    if (budgets) {
      setBudgetCollection(
        createListCollection({
          items: budgets.map(budget => ({ label: budget.title, value: budget.id })),
        }),
      );
    }
  }, [budgets]);

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
            id='expenseForm'
            ref={formRef}>
            <Stack gap='4'>
              <Field
                required
                errorText={errors.title}
                invalid={!!errors.title}
                label='Title'>
                <Input
                  defaultValue={expense?.title ?? ''}
                  name='title'
                  placeholder='Groceries'
                />
              </Field>
              <Field
                required
                errorText={errors.amount}
                invalid={!!errors.amount}
                label='Amount'>
                <NumberInputRoot
                  allowMouseWheel
                  defaultValue={expense?.amount.toString() ?? '0'}
                  formatOptions={{
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  }}
                  locale='de-DE'
                  name='amount'
                  width='100%'>
                  <InputGroup
                    startElement={<FaEuroSign />}
                    width={'100%'}>
                    <NumberInputField pattern='\d{1,3}(.\d{3})*(,\d{2})?' />
                  </InputGroup>
                </NumberInputRoot>
              </Field>
              <Field
                required
                errorText={errors.date}
                invalid={!!errors.date}
                label='Date'>
                <Input
                  defaultValue={expense?.expenseDate.toISOString().split('T')[0] ?? ''}
                  name='date'
                  type='date'
                />
              </Field>
              <SelectRoot
                collection={EXPENSE_CATEGORIES}
                defaultValue={[expense?.category ?? '']}
                name='category'>
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
              <SelectRoot
                collection={budgetCollection}
                name='budget'>
                <SelectLabel>Budget</SelectLabel>
                <SelectTrigger>
                  <SelectValueText placeholder='Select budget' />
                </SelectTrigger>
                <SelectContent portalRef={contentRef}>
                  {budgetCollection.items.map(item => (
                    <SelectItem
                      item={item}
                      key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Stack>
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
