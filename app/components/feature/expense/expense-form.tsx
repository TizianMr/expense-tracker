import { Expense } from '@prisma/client';
import { DatePicker, SearchSelect, SearchSelectItem, TextInput } from '@tremor/react';
import { de, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import { ExpenseFormErrors } from '../../../routes/dashboard.expenses';
import { EXPENSE_CATEGORIES, LOCALES } from '../../../utils/constants';
import CurrencyInput from '../../ui/currency-input';
import { useControlledInput } from '~/customHooks/useControlledInput';
import { BudgetWithUsage } from '~/db/budget.server';

type Props = {
  errors: ExpenseFormErrors;
  locale: (typeof LOCALES)[number]['value'];
  expense?: Expense;
  budgets: BudgetWithUsage[];
};

const ExpenseForm = ({ errors, expense, budgets, locale }: Props) => {
  const { t } = useTranslation();
  const { handleChange: handleDateChange, value: selectedDate } = useControlledInput(
    expense?.expenseDate ?? new Date(),
  );

  const budgetsList = budgets.map(budget => ({
    label: budget.title,
    value: budget.id,
  }));

  const isExpenseDateWithCurrentMonth =
    selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear();

  return (
    <div className='space-y-6'>
      <div>
        <label
          className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'
          htmlFor='expense-title'>
          {t('ExpenseForm.title')} <span className='text-red-500'>*</span>
        </label>
        <TextInput
          required
          className='mt-2'
          defaultValue={expense?.title}
          error={!!errors.title}
          errorMessage={errors.title}
          id='expense-title'
          name='title'
          placeholder={t('ExpenseForm.titlePlaceholder')}
          type='text'
        />
      </div>

      <CurrencyInput
        required
        defaultValue={expense?.amount.toString() ?? ''}
        error={!!errors.amount}
        errorMessage={errors.amount}
        label={t('ExpenseForm.amount')}
        name='amount'
        placeholder={t('ExpenseForm.amountPlaceholder')}
      />

      <div>
        <label
          className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'
          htmlFor='expense-date'>
          {t('ExpenseForm.date')} <span className='text-red-500'>*</span>
        </label>
        <DatePicker
          defaultValue={selectedDate}
          enableClear={false}
          id='expense-date'
          locale={locale === 'de' ? de : enUS}
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
          {t('ExpenseForm.category')}
        </label>
        <SearchSelect
          className='mt-2'
          defaultValue={expense?.category ?? undefined}
          id='expense-category'
          name='category'>
          {EXPENSE_CATEGORIES.map(item => (
            <SearchSelectItem
              key={item.value}
              value={item.value}>
              {t(item.labelKey)}
            </SearchSelectItem>
          ))}
        </SearchSelect>
      </div>

      <div>
        <label
          className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'
          htmlFor='expense-budget'>
          {t('ExpenseForm.budget')}
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
        {!isExpenseDateWithCurrentMonth && (
          <p className='mt-2 text-tremor-label text-orange-500 dark:text-orange-300'>
            {t('ExpenseForm.budgetHelperText')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ExpenseForm;
