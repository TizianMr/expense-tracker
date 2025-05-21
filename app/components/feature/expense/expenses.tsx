import { NavLink, useLocation } from '@remix-run/react';
import { RiAddLine } from '@remixicon/react';
import { Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import { ExpenseTable } from './expense-table';
import { useDelayedNavigationLoading } from '~/customHooks/useDelayedNavigationLoading';
import { ExpenseWithBudget } from '~/db/expense.server';
import { ListResult } from '~/interfaces';

type Props = {
  expenses: ListResult<ExpenseWithBudget>;
};

const Expenses = ({ expenses }: Props) => {
  const location = useLocation();
  const { t } = useTranslation();
  const expenseDialogIsLoading = useDelayedNavigationLoading('dashboard', 'expenses/create');

  return (
    <>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'>
          {t('Expenses.title')}
        </h1>
        <NavLink
          preventScrollReset
          to={{ pathname: 'expenses/create', search: location.search }}>
          <Button
            icon={RiAddLine}
            loading={expenseDialogIsLoading}>
            {t('Expenses.create')}
          </Button>
        </NavLink>
      </div>
      <ExpenseTable
        expenses={expenses.items}
        paginationState={{ totalItems: expenses.totalItems, page: expenses.page, pageSize: expenses.pageSize }}
        searchParamKey='expense'
      />
    </>
  );
};

export default Expenses;
