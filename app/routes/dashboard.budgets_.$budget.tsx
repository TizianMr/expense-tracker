import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { RiErrorWarningLine } from '@remixicon/react';
import { Dialog, DialogPanel, Divider, Button, Callout, DonutChart, EventProps } from '@tremor/react';
import qs from 'qs';
import { useState } from 'react';

import { ExpenseTable } from '~/components/expense-table';
import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';
import { fetchBudgetById } from '~/db/budget.server';
import { fetchExpenses } from '~/db/expense.server';
import { QueryParams, SortDirection } from '~/interfaces';
import { EXPENSE_CATEGORIES, EXPENSE_PAGE_SIZE } from '~/utils/constants';
import { formatCurrency } from '~/utils/helpers';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const budgetId = params.budget as string;
  const url = new URL(request.url);
  const query = url.searchParams;
  const parsedQueryParams = qs.parse(query.toString()) as QueryParams;

  const [expenses, budget] = await Promise.all([
    await fetchExpenses({
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
                  parsedQueryParams.budgetDetails.filter.filterValue === 'No category'
                    ? null
                    : parsedQueryParams.budgetDetails.filter.filterValue,
              },
            ]
          : []),
      ],
    }),
    await fetchBudgetById(budgetId),
  ]);

  return { expenses, budget };
};

const valueFormatter = (number: number) => formatCurrency(number);

const BudgetDetails = () => {
  const [open, setIsOpen] = useState(true);
  const { triggerDelayedNavigation } = useDelayedNavigation('/dashboard');
  const [searchParams, setSearchParams] = useSearchParams();
  const { budget, expenses } = useLoaderData<typeof loader>();

  const categoryColors = budget?.expensesByCategory.map(expense => {
    const category = EXPENSE_CATEGORIES.find(cat => cat.value === expense.category);
    return category ? category.color : 'gray';
  });

  const handleClose = () => {
    setIsOpen(false);
    triggerDelayedNavigation(); // delay navigation to allow dialog to close with animation
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
      <DialogPanel className='w-[60vw] big-dialog'>
        <h3 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
          {budget?.title ?? 'Not found'}
        </h3>
        {budget ? (
          <div className='flex flex-row h-[35vh] items-center space-x-5'>
            <DonutChart
              showAnimation
              category='amount'
              className='h-[50%] w-[50%]'
              colors={categoryColors}
              data={budget.expensesByCategory}
              index='category'
              label={`${formatCurrency(budget.totalUsedBudget)} of ${formatCurrency(budget.amount)}`}
              noDataText='No expenses assigned to budget'
              valueFormatter={valueFormatter}
              onValueChange={v => handleValueChange(v)}
            />
            <div className='h-full w-[50%]'>
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
            title='Budget not found'>
            The budget you are trying to access could not be found.
          </Callout>
        )}
        <Divider />
        <div className='mt-8 flex items-center justify-end space-x-2'>
          <Button
            variant='secondary'
            onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default BudgetDetails;
