import { TextInput } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import CurrencyInput from '../../ui/currency-input';
import { BudgetDetails } from '~/db/budget.server';
import { BudgetFormErrors } from '~/routes/dashboard.budgets';

type Props = {
  errors: BudgetFormErrors;
  budget?: BudgetDetails;
};

const BudgetForm = ({ errors, budget }: Props) => {
  const { t } = useTranslation();

  return (
    <div className='space-y-6'>
      <div>
        <label
          className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'
          htmlFor='budget-title'>
          {t('BudgetForm.title')} <span className='text-red-500'>*</span>
        </label>
        <TextInput
          required
          className='mt-2'
          defaultValue={budget?.title}
          error={!!errors.title}
          errorMessage={errors.title}
          id='budget-title'
          name='title'
          placeholder={t('BudgetForm.titlePlaceholder')}
          type='text'
        />
      </div>

      <CurrencyInput
        required
        defaultValue={budget?.amount.toString() ?? ''}
        error={!!errors.amount}
        errorMessage={errors.amount}
        label={t('BudgetForm.amount')}
        name='amount'
        placeholder={t('BudgetForm.amountPlaceholder')}
      />
    </div>
  );
};

export default BudgetForm;
