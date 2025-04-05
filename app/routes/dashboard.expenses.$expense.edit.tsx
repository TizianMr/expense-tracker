import { createListCollection, Input, ListCollection, Stack } from '@chakra-ui/react';
import { Budget, Category, Expense } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { FaEuroSign } from 'react-icons/fa';

import { FormErrors } from './dashboard.expenses';
import { Field } from '../components/ui/field';
import { InputGroup } from '../components/ui/input-group';
import { NumberInputField, NumberInputRoot } from '../components/ui/number-input';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '../components/ui/select';
import { fetchExpenseById, updateExpense, UpdateExpense } from '../db/expense.server';
import { EXPENSE_CATEGORIES } from '../utils/constants';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const expenseId = params.expense as string;

  const expense = await fetchExpenseById(expenseId);

  return { expense };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const expense: UpdateExpense = {
    id: params.expense as string,
    amount: parseFloat(convertedAmount),
    category: formData.get('category') as Category,
    expenseDate: new Date(formData.get('date') as string),
    title: formData.get('title') as string,
  };

  const updatedExpense = await updateExpense(expense);
  return updatedExpense;
};

// TODO: own loader to fetch budgets and expense?

const EditExpenseDialog = () => {
  const { expense } = useLoaderData<typeof loader>();
  const { contentRef, errors } = useOutletContext<{
    contentRef: React.RefObject<HTMLDivElement>;
    errors: FormErrors;
  }>();
  // const [budgetCollection, setBudgetCollection] = useState<ListCollection<{ label: string; value: string }>>(
  //   createListCollection({ items: [] }),
  // );

  // useEffect(() => {
  //   if (budgets) {
  //     setBudgetCollection(
  //       createListCollection({
  //         items: budgets.map(budget => ({ label: budget.title, value: budget.id })),
  //       }),
  //     );
  //   }
  // }, [budgets]);

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
      {/* <SelectRoot
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
      </SelectRoot> */}
    </Stack>
  );
};

export default EditExpenseDialog;
