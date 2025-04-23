import { TextInput } from '@tremor/react';

import CurrencyInput from './ui/currency-input';
import { BudgetDetails } from '~/db/budget.server';
import { BudgetFormErrors } from '~/routes/dashboard.budgets';

type Props = {
  errors: BudgetFormErrors;
  budget?: BudgetDetails;
};

const BudgetForm = ({ errors, budget }: Props) => {
  return (
    <div className='space-y-6'>
      <div>
        <label
          className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'
          htmlFor='budget-title'>
          Title <span className='text-red-500'>*</span>
        </label>
        <TextInput
          required
          className='mt-2'
          defaultValue={budget?.title}
          error={!!errors.title}
          errorMessage={errors.title}
          id='budget-title'
          name='title'
          placeholder='Title name'
          type='text'
        />
      </div>

      <CurrencyInput
        required
        defaultValue={budget?.amount.toString() ?? ''}
        error={!!errors.amount}
        errorMessage={errors.amount}
        label='Amount'
        name='amount'
        placeholder='Amount...'
      />
    </div>
  );
};

export default BudgetForm;
