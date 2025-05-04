import { LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, redirect, useLoaderData } from '@remix-run/react';
import { RiAddLine, RiBarChartFill, RiQuestionLine } from '@remixicon/react';
import { Button, Card, Icon, Legend } from '@tremor/react';
import qs from 'qs';

import BudgetInfo from '~/components/budget-info';
import { ExpenseTable } from '~/components/expense-table';
import Statistics from '~/components/statistics';
import LoadingSpinner from '~/components/ui/loading-spinner';
import Pagination from '~/components/ui/pagination';
import { Tooltip } from '~/components/ui/tooltip';
import UserDropdown from '~/components/user-dropdown';
import { useDelayedLoading } from '~/customHooks/useDelayedLoading';
import { getLoggedInUser } from '~/db/auth.server';
import { fetchBudgets } from '~/db/budget.server';
import { fetchExpenses } from '~/db/expense.server';
import { fetchStatistics } from '~/db/statistics.server';
import { QueryParams, SortDirection, StatisticPeriod } from '~/interfaces';
import { BUDGET_PAGE_SIZE, EXPENSE_PAGE_SIZE } from '~/utils/constants';

// TODO: loader shouldn't be triggered when dialog is opened
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getLoggedInUser(request);
  if (!user) throw redirect('/login');

  const url = new URL(request.url);
  const query = url.searchParams;
  const parsedQueryParams = qs.parse(query.toString()) as QueryParams;

  const [expenses, budgets, statistics] = await Promise.all([
    // expenses
    fetchExpenses(
      {
        page: Number(parsedQueryParams.expense?.page) || 1,
        pageSize: EXPENSE_PAGE_SIZE,
        sortBy: parsedQueryParams.expense?.sortBy || 'expenseDate',
        sortDirection: parsedQueryParams.expense?.sortDirection || SortDirection.DESC,
      },
      user.id,
    ),
    // budgets
    await fetchBudgets(
      {
        page: Number(parsedQueryParams.budget?.page) || 1,
        pageSize: BUDGET_PAGE_SIZE,
        sortBy: 'id',
        sortDirection: SortDirection.ASC,
      },
      user.id,
    ),
    // statistics
    await fetchStatistics(parsedQueryParams.statistics || StatisticPeriod.WEEK, user.id),
  ]);

  return { expenses, budgets, statistics, user };
};

const Dashboard = () => {
  const { expenses, budgets, statistics, user } = useLoaderData<typeof loader>();
  const { isLoadingLongerThanDelay: isDataLoading } = useDelayedLoading();

  return (
    <div className='container m-auto grid lg:grid-cols-[max-content_1fr] lg:grid-rows-[4vh,45vh,45vh] grid-rows-[4vh_auto_auto_auto] gap-4'>
      <div className='flex justify-end md:justify-between col-span-5 pt-4'>
        <img
          alt='Expense tracker logo'
          className='hidden h-full w-auto object-contain md:block'
          src='logo-horizontal.png'
        />
        <UserDropdown userInfo={user} />
      </div>

      <Card className='lg:col-span-4 col-span-5'>
        <Statistics statistics={statistics} />
      </Card>

      <Card className='flex flex-col lg:col-span-4 col-span-5 min-w-0'>
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

      <Card className='lg:col-span-1 lg:row-start-2 lg:col-start-5 lg:row-span-2 col-span-5 row-start-3 flex flex-col'>
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
        <div className='flex flex-col mx-auto h-full w-full lg:mt-12 mt-6'>
          <div className='flex flex-col flex-grow justify-center lg:justify-start lg:space-y-6'>
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
          <div className='w-full'>
            <Pagination
              paginationState={{ totalItems: budgets.totalItems, page: budgets.page, pageSize: budgets.pageSize }}
              searchParamKey='budget'
            />
          </div>
        </div>
      </Card>
      <Outlet />
    </div>
  );
};

export default Dashboard;
