import { createListCollection, Input, ListCollection, Stack } from '@chakra-ui/react';
import { Budget, Expense } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import { FaEuroSign } from 'react-icons/fa';

import { Field } from './ui/field';
import { InputGroup } from './ui/input-group';
import { NumberInputField, NumberInputRoot } from './ui/number-input';
import { SelectContent, SelectItem, SelectLabel, SelectRoot, SelectTrigger, SelectValueText } from './ui/select';
import { FormErrors } from '../routes/dashboard.expenses';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { ListResult } from '~/interfaces';

type Props = {
  contentRef: React.RefObject<HTMLDivElement>;
  errors: FormErrors;
  expense?: Expense;
  budgets: Budget[];
};

const SCROLL_TRESHOLD = 80; // px

const ExpenseForm = ({ contentRef, errors, expense, budgets }: Props) => {
  const [budgetCollection, setBudgetCollection] = useState<ListCollection<{ label: string; value: string }>>(
    createListCollection({ items: [] }),
  );
  const selectRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(2);
  const fetcher = useFetcher<ListResult<Budget>>();
  const [shouldFetch, setShouldFetch] = useState(true);

  const scrolledToLastPage = fetcher.data && page > Math.ceil(fetcher.data.totalItems / fetcher.data.pageSize);

  // Add Listeners to scroll and client resize
  useEffect(() => {
    let ref: HTMLDivElement | null = null;
    if (selectRef.current) {
      ref = selectRef.current;
    }

    const scrollListener = () => {
      if (!ref) return;
      // Check if the user scrolled to the bottom of the select content
      setShouldFetch(ref.scrollHeight - ref.scrollTop - SCROLL_TRESHOLD < ref.clientHeight);
    };

    if (ref) {
      ref.addEventListener('scroll', scrollListener);
    }

    // Clean up
    return () => {
      if (ref) {
        ref.removeEventListener('scroll', scrollListener);
      }
    };
  }, [shouldFetch]);

  useEffect(() => {
    if (!shouldFetch) return;

    if (fetcher.state === 'loading' || scrolledToLastPage) {
      setShouldFetch(false);
      return;
    }

    // TODO: replace with location.pathname
    fetcher.load(`/dashboard/expenses/create?page=${page}`);

    setShouldFetch(false);
  }, [fetcher, page, scrolledToLastPage, shouldFetch]);

  useEffect(() => {
    if (scrolledToLastPage) {
      setShouldFetch(false);
      return;
    }

    if (fetcher.data && fetcher.data.items) {
      setBudgetCollection(prevCollection =>
        createListCollection({
          items: [
            ...prevCollection.items,
            ...(fetcher.data?.items.map(budget => ({ label: budget.title, value: budget.id })) ?? []),
          ],
        }),
      );
      setPage(prevPage => prevPage + 1);
    }
  }, [fetcher.data, scrolledToLastPage]);

  useEffect(() => {
    if (budgets) {
      setBudgetCollection(
        createListCollection({
          items: budgets.map(budget => ({ label: budget.title, value: budget.id })),
        }),
      );
    }
  }, [budgets]);

  return (
    <Stack gap='4'>
      <Field
        required
        errorText={errors.title}
        invalid={!!errors.title}
        label='Title'>
        <Input
          defaultValue={expense?.title ?? ''}
          name='title'
          placeholder='test'
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
        defaultValue={expense?.category ? [expense.category] : undefined}
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
        <SelectContent
          maxH='20em'
          overflowY='auto'
          portalRef={contentRef}
          ref={selectRef}>
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
  );
};

export default ExpenseForm;
