import { LoaderFunctionArgs } from '@remix-run/node';
import { redirect, useLoaderData, useSearchParams } from '@remix-run/react';
import { RiErrorWarningLine } from '@remixicon/react';
import { Dialog, DialogPanel, Divider, Button, Callout, DonutChart, EventProps } from '@tremor/react';
import qs from 'qs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExpenseTable } from '../components/feature/expense/expense-table';
import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';
import { getLoggedInUser } from '~/db/auth.server';
import { fetchBudgetById } from '~/db/budget.server';
import { fetchExpenses } from '~/db/expense.server';
import { QueryParams, SortDirection } from '~/interfaces';
import { EXPENSE_CATEGORIES, EXPENSE_PAGE_SIZE } from '~/utils/constants';
import { formatCurrency } from '~/utils/helpers';
import i18next from '~/utils/i18n/i18next.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const t = await i18next.getFixedT(request);
  const budgetId = params.budget as string;
  const url = new URL(request.url);
  const query = url.searchParams;
  const parsedQueryParams = qs.parse(query.toString()) as QueryParams;

  const [expenses, budget] = await Promise.all([
    await fetchExpenses(
      {
        sortBy: parsedQueryParams.budgetDetails?.sortBy || 'expenseDate',
        sortDirection: parsedQueryParams.budgetDetails?.sortDirection || SortDirection.ASC,
        page: Number(parsedQueryParams.budgetDetails?.page) || 1,
        pageSize: EXPENSE_PAGE_SIZE,
        filter: [
          { filterBy: 'budgetId', filterValue: budgetId },
          ...(parsedQueryParams.budgetDetails?.filter
            ? [
                {
                  filterBy: parsedQueryParams.budgetDetails.filter.filterBy,
                  filterValue:
                    parsedQueryParams.budgetDetails.filter.filterValue === t('BudgetDetails.noCategory')
                      ? null
                      : parsedQueryParams.budgetDetails.filter.filterValue,
                },
              ]
            : []),
        ],
      },
      user.id,
    ),
    await fetchBudgetById(budgetId, user.id),
  ]);

  return { expenses, budget };
};

const valueFormatter = (number: number) => formatCurrency(number);

const BudgetDetails = () => {
  const [open, setIsOpen] = useState(true);
  const { t } = useTranslation();
  const { triggerDelayedNavigation } = useDelayedNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { budget, expenses } = useLoaderData<typeof loader>();

  const categoryColors = budget?.expensesByCategory.map(expense => {
    const category = EXPENSE_CATEGORIES.find(cat => cat.value === expense.category);
    return category ? category.color : 'gray';
  });

  const budgetsWithTranslatedCategories = budget?.expensesByCategory.map(expense => ({
    ...expense,
    category: t(`common.categories.${expense.category.toLowerCase()}`),
  }));

  const handleClose = () => {
    setIsOpen(false);
    triggerDelayedNavigation('/dashboard'); // delay navigation to allow dialog to close with animation
  };

  const handleValueChange = (v: EventProps) => {
    const nestedParams = qs.parse(searchParams.toString()) as QueryParams;
    let updated = nestedParams;

    if (v) {
      updated = {
        ...nestedParams,
        budgetDetails: {
          filter: { filterBy: 'category', filterValue: v.category },
        },
      };
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { budgetDetails: _, ...rest } = nestedParams; // Destructure to exclude the property
      updated = rest;
    }

    setSearchParams(qs.stringify(updated), { preventScrollReset: true });
  };

  return (
    <Dialog
      static
      open={open}
      onClose={handleClose}>
      <DialogPanel className='lg:w-[60vw] big-dialog'>
        <h3 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong truncate'>
          {budget?.title ?? t('BudgetDetails.error.title')}
        </h3>
        {budget ? (
          <div className='flex flex-col lg:flex-row lg:h-[50vh] items-center'>
            <DonutChart
              showAnimation
              category='amount'
              className='xl:h-[60%] min-h-[15rem]'
              colors={categoryColors}
              data={budgetsWithTranslatedCategories!}
              index='category'
              label={`${formatCurrency(budget.totalUsedBudget)} of ${formatCurrency(budget.amount)}`}
              noDataText={t('BudgetDetails.noData')}
              valueFormatter={valueFormatter}
              onValueChange={v => handleValueChange(v)}
            />
            <div className='lg:h-full w-full lg:overflow-auto'>
              <ExpenseTable
                excludeColumns={['actions', 'budget']}
                expenses={expenses.items}
                paginationState={{ page: expenses.page, pageSize: expenses.pageSize, totalItems: expenses.totalItems }}
                searchParamKey='budgetDetails'
              />
            </div>
          </div>
        ) : (
          <Callout
            className='mt-4'
            color='rose'
            icon={RiErrorWarningLine}
            title={t('BudgetDetails.error.title')}>
            {t('BudgetDetails.error.text')}
          </Callout>
        )}
        <Divider />
        <div className='mt-8 flex items-center justify-end space-x-2'>
          <Button
            variant='secondary'
            onClick={handleClose}>
            {t('common.close')}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default BudgetDetails;
