import { LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { RiAddLine, RiBarChartFill, RiQuestionLine } from '@remixicon/react';
import { Button, Card, Icon, Legend } from '@tremor/react';
import qs from 'qs';

import BudgetInfo from '~/components/budget-info';
import { ExpenseTable } from '~/components/expense-table';
import LoadingSpinner from '~/components/ui/loading-spinner';
import Pagination from '~/components/ui/pagination';
import { Tooltip } from '~/components/ui/tooltip';
import { useDelayedLoading } from '~/customHooks/useDelayedLoading';
import { fetchBudgets } from '~/db/budget.server';
import { fetchExpenses } from '~/db/expense.server';
import { QueryParams, SortDirection } from '~/interfaces';
import { BUDGET_PAGE_SIZE, EXPENSE_PAGE_SIZE } from '~/utils/constants';

// TODO: loader shouldn't be triggered when dialog is opened
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams;
  const parsedQueryParams = qs.parse(query.toString()) as QueryParams;

  const [expenses, budgets] = await Promise.all([
    // expenses
    fetchExpenses({
      page: Number(parsedQueryParams.expense?.page) || 1,
      pageSize: EXPENSE_PAGE_SIZE,
      sortBy: parsedQueryParams.expense?.sortBy || 'expenseDate',
      sortDirection: parsedQueryParams.expense?.sortDirection || SortDirection.DESC,
    }),
    // budgets
    await fetchBudgets({
      page: Number(parsedQueryParams.budget?.page) || 1,
      pageSize: BUDGET_PAGE_SIZE,
      sortBy: 'id',
      sortDirection: SortDirection.ASC,
    }),
  ]);

  return { expenses, budgets };
};

const Dashboard = () => {
  const { expenses, budgets } = useLoaderData<typeof loader>();
  const { isLoadingLongerThanDelay: isDataLoading } = useDelayedLoading();

  return (
    <>
      <div className='flex justify-content-center'>
        <Card className='flex flex-col mx-auto w-[80vw] h-[40vh]'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'>
              Expenses
            </h1>
            <NavLink to='expenses/create'>
              <Button icon={RiAddLine}>Create expense</Button>
            </NavLink>
          </div>
          <ExpenseTable
            expenses={expenses.items}
            paginationState={{ totalItems: expenses.totalItems, page: expenses.page, pageSize: expenses.pageSize }}
            searchParamKey='expense'
          />
        </Card>
      </div>
      <div className='flex justify-content-center'>
        <Card className='mx-auto w-[25vw]'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <h1 className='text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'>
                Budgets
              </h1>
              <Tooltip
                className='w-[20rem]'
                content={
                  <Legend
                    categories={[
                      'No worries! You are well within your budget.',
                      "Heads up! You're nearing your budget limit.",
                      "Alert! You've nearly maxed out your budget.",
                    ]}
                    className='tooltip-legend-white'
                    colors={['emerald', 'orange', 'red']}
                  />
                }
                showArrow={false}>
                <Icon
                  icon={RiQuestionLine}
                  size='sm'
                />
              </Tooltip>
            </div>

            <NavLink to='budgets/create'>
              <Button icon={RiAddLine}>Create budget</Button>
            </NavLink>
          </div>
          <div className='space-y-6 mt-5'>
            {isDataLoading ? (
              <LoadingSpinner />
            ) : budgets.items.length ? (
              budgets.items.map(budget => (
                <BudgetInfo
                  id={budget.id}
                  key={budget.id}
                  title={budget.title}
                  totalAmount={budget.amount}
                  usedAmount={budget.totalUsedBudget}
                />
              ))
            ) : (
              <div className='text-center'>
                <RiBarChartFill
                  aria-hidden={true}
                  className='mx-auto h-7 w-7 text-tremor-content-subtle dark:text-dark-tremor-content-subtle'
                />
                <p className='mt-2 text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong'>
                  No data to show
                </p>
                <p className='text-tremor-default text-tremor-content dark:text-dark-tremor-content'>
                  Get started by creating your first budget
                </p>
              </div>
            )}
          </div>
          <div className='mt-6'>
            <Pagination
              paginationState={{ totalItems: budgets.totalItems, page: budgets.page, pageSize: budgets.pageSize }}
              searchParamKey='budget'
            />
          </div>
        </Card>
      </div>
      <Outlet />
    </>
  );
};

export default Dashboard;
