import { Budget, Expense } from '@prisma/client';
import { DatePicker, SearchSelect, SearchSelectItem, TextInput } from '@tremor/react';

import { ExpenseFormErrors } from '../routes/dashboard.expenses';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import CurrencyInput from './ui/currency-input';
import { useControlledInput } from '~/customHooks/useControlledInput';

type Props = {
  errors: ExpenseFormErrors;
  expense?: Expense;
  budgets: Budget[];
};

const ExpenseForm = ({ errors, expense, budgets }: Props) => {
  const { handleChange: handleDateChange, value: selectedDate } = useControlledInput(
    expense?.expenseDate ?? new Date(),
  );

  const budgetsList = budgets.map(budget => ({
    label: budget.title,
    value: budget.id,
  }));

  return (
    <>
      <div className='space-y-6'>
        <div>
          <label
            className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'
            htmlFor='expense-title'>
            Title <span className='text-red-500'>*</span>
          </label>
          <TextInput
            required
            className='mt-2'
            defaultValue={expense?.title}
            error={!!errors.title}
            errorMessage={errors.title}
            id='expense-title'
            name='title'
            placeholder='Title name'
            type='text'
          />
        </div>

        <CurrencyInput
          required
          defaultValue={expense?.amount.toString() ?? ''}
          error={!!errors.amount}
          errorMessage={errors.amount}
          label='Amount'
          name='amount'
          placeholder='Amount...'
        />

        <div>
          <label
            className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'
            htmlFor='expense-date'>
            Date <span className='text-red-500'>*</span>
          </label>
          <DatePicker
            className='mt-2'
            defaultValue={selectedDate}
            enableClear={false}
            id='expense-date'
            onValueChange={date => handleDateChange(date as Date)}
          />
          <input
            name='date'
            type='hidden'
            value={selectedDate.toLocaleDateString('en-CA')} // Format as YYYY-MM-DD
          />
        </div>

        <div>
          <label
            className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'
            htmlFor='expense-category'>
            Category
          </label>
          <SearchSelect
            className='mt-2'
            defaultValue={expense?.category ?? undefined}
            id='expense-category'
            name='category'>
            {EXPENSE_CATEGORIES.items.map(item => (
              <SearchSelectItem
                key={item.value}
                value={item.value}>
                {item.label}
              </SearchSelectItem>
            ))}
          </SearchSelect>
        </div>

        <div>
          <label
            className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'
            htmlFor='expense-budget'>
            Budget
          </label>
          <SearchSelect
            className='mt-2'
            defaultValue={expense?.budgetId ?? undefined}
            id='expense-budget'
            name='budget'>
            {budgetsList.map(budget => (
              <SearchSelectItem
                key={budget.value}
                value={budget.value}>
                {budget.label}
              </SearchSelectItem>
            ))}
          </SearchSelect>
        </div>
      </div>
    </>
  );
};

export default ExpenseForm;
