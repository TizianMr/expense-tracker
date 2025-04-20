import { Expense } from '@prisma/client';
import { LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { RiAddLine } from '@remixicon/react';
import { Button, Card } from '@tremor/react';

import { TableUsageExample } from '~/components/example-table';
import { fetchBudgets } from '~/db/budget.server';
import { fetchExpenses } from '~/db/expense.server';
import { SortDirection } from '~/interfaces';
import { EXPENSE_TABLE_PAGE_SIZE } from '~/utils/constants';

// TODO: loader shouldn't be triggered when dialog is opened
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams;

  const [expenses, budgets] = await Promise.all([
    // expenses
    fetchExpenses({
      page: Number(query.get('page')) || 1,
      pageSize: EXPENSE_TABLE_PAGE_SIZE,
      sortBy: (query.get('sortBy') as keyof Expense) || 'expenseDate',
      sortDirection: (query.get('sortDirection') as SortDirection) || SortDirection.DESC,
    }),
    // budgets
    await fetchBudgets({
      page: 1,
      pageSize: 100,
      sortBy: 'id',
      sortDirection: SortDirection.ASC,
    }),
  ]);

  return { expenses, budgets };
};

const Dashboard = () => {
  const { expenses, budgets } = useLoaderData<typeof loader>();

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
          <TableUsageExample
            expenses={expenses.items}
            paginationState={{ totalItems: expenses.totalItems, page: expenses.page, pageSize: expenses.pageSize }}
          />
        </Card>
      </div>
      <div className='flex justify-content-center'>
        <Card className='mx-auto w-[50vw]'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'>
              Budgets
            </h1>
            <NavLink to='budgets/create'>
              <Button icon={RiAddLine}>Create budget</Button>
            </NavLink>
          </div>
          {JSON.stringify(budgets, null, 2)}
        </Card>
      </div>
      <Outlet />
    </>
  );
};

export default Dashboard;
