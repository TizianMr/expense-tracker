import { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, redirect, useLoaderData } from '@remix-run/react';
import { Card } from '@tremor/react';
import qs from 'qs';

import Budgets from '~/components/feature/budget/budgets';
import Expenses from '~/components/feature/expense/expenses';
import Statistics from '~/components/feature/statistics/statistics';
import UserDropdown from '~/components/feature/user-mgmt/user-dropdown';
import GitHubLink from '~/components/ui/github-link';
import { getLoggedInUser } from '~/db/auth.server';
import { fetchBudgets } from '~/db/budget.server';
import { fetchExpenses } from '~/db/expense.server';
import { fetchStatistics } from '~/db/statistics.server';
import { QueryParams, SortDirection, StatisticPeriod } from '~/interfaces';
import { BUDGET_PAGE_SIZE, EXPENSE_PAGE_SIZE } from '~/utils/constants';

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

  return (
    <div className='container m-auto grid lg:grid-cols-[max-content_1fr] grid-rows-[auto_auto_auto_2vh] gap-4'>
      <div className='flex justify-end md:justify-between col-span-5 pt-4'>
        <img
          alt='Expense tracker logo'
          className='hidden h-10 w-auto my-auto md:block'
          src='/logo-horizontal.png'
        />
        <UserDropdown userInfo={user} />
      </div>

      <Card className='lg:col-span-4 col-span-5 min-h-[33rem]'>
        <Statistics statistics={statistics} />
      </Card>

      <Card className='flex flex-col lg:col-span-4 col-span-5 min-w-0 min-h-[33rem]'>
        <Expenses expenses={expenses} />
      </Card>

      <Card className='lg:col-span-1 lg:row-start-2 lg:col-start-5 lg:row-span-2 col-span-5 row-start-3 flex flex-col'>
        <Budgets budgets={budgets} />
      </Card>
      <Outlet />
      <GitHubLink />
    </div>
  );
};

export default Dashboard;
