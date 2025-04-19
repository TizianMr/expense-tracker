import { Budget, Expense } from '@prisma/client';
import { RiMoneyEuroCircleLine } from '@remixicon/react';
import { DatePicker, SearchSelect, SearchSelectItem, TextInput } from '@tremor/react';

import { FormErrors } from '../routes/dashboard.expenses';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { useControlledInput } from '~/customHooks/useControlledInput';

const formatAmount = (value: string) => {
  // Remove all non-numeric characters except digits, dots, and commas
  const numericValue = value.replace(/[^\d.,]/g, '');

  const standardizedValue = numericValue.replace(',', '.');

  const parsedValue = parseFloat(standardizedValue);

  if (isNaN(parsedValue)) {
    return value; // Return the original value to avoid clearing the input
  }

  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true, // Add thousands separators
  }).format(parsedValue);
};

type Props = {
  errors: FormErrors;
  expense?: Expense;
  budgets: Budget[];
};

const ExpenseForm = ({ errors, expense, budgets }: Props) => {
  const {
    handleChange: handleAmountChange,
    value: selectedAmount,
    setValue: setSelectedAmount,
  } = useControlledInput(expense?.amount ? formatAmount(expense.amount.toString()) : '');

  const { handleChange: handleDateChange, value: selectedDate } = useControlledInput(
    expense?.expenseDate ?? new Date(),
  );

  const budgetsList = budgets.map(budget => ({
    label: budget.title,
    value: budget.id,
  }));

  const handleAmountBlur = () => {
    setSelectedAmount(formatAmount(selectedAmount));
  };

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
            autoComplete='title-name'
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

        <div>
          <label
            className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'
            htmlFor='expense-date'>
            Amount <span className='text-red-500'>*</span>
          </label>
          <TextInput
            required
            className='mt-2'
            error={!!errors.amount}
            errorMessage={errors.amount}
            icon={RiMoneyEuroCircleLine}
            name='amount'
            pattern='\d{1,3}(.\d{3})*(,\d{2})?'
            placeholder='Amount...'
            value={selectedAmount}
            onBlur={handleAmountBlur}
            onValueChange={handleAmountChange}
          />
        </div>

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
