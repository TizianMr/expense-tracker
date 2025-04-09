import { createListCollection, Input, Stack } from '@chakra-ui/react';
import { Budget, Expense } from '@prisma/client';
import { useRef } from 'react';
import { FaEuroSign } from 'react-icons/fa';

import { Field } from './ui/field';
import { InputGroup } from './ui/input-group';
import { NumberInputField, NumberInputRoot } from './ui/number-input';
import { SelectContent, SelectItem, SelectLabel, SelectRoot, SelectTrigger, SelectValueText } from './ui/select';
import { FormErrors } from '../routes/dashboard.expenses';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { useInfiniteScroll } from '~/customHooks/useInfiniteScroll';

type Props = {
  contentRef: React.RefObject<HTMLDivElement>;
  errors: FormErrors;
  expense?: Expense;
  budgets: Budget[];
};

const ExpenseForm = ({ contentRef, errors, expense, budgets }: Props) => {
  const selectRef = useRef<HTMLDivElement>(null);
  const initialCollection = createListCollection({
    items: budgets.map(budget => ({ label: budget.title, value: budget.id })),
  });

  const budgetCollection = useInfiniteScroll<Budget>(initialCollection, selectRef, 'title', 'id');

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
        defaultValue={expense?.budgetId ? [expense.budgetId] : undefined}
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
