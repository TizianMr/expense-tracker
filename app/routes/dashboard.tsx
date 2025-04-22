import { Expense } from '@prisma/client';
import { LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { RiAddLine, RiQuestionLine } from '@remixicon/react';
import { Button, Card, Icon, Legend } from '@tremor/react';
import qs from 'qs';

import BudgetInfo from '~/components/budget-info';
import { ExpenseTable } from '~/components/expense-table';
import Pagination from '~/components/ui/pagination';
import { Tooltip } from '~/components/ui/tooltip';
import { fetchBudgets } from '~/db/budget.server';
import { fetchExpenses } from '~/db/expense.server';
import { QueryParams, SortDirection } from '~/interfaces';
import { BUDGET_PAGE_SIZE, EXPENSE_PAGE_SIZE } from '~/utils/constants';

// TODO: loader shouldn't be triggered when dialog is opened
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams;
  const parsedQueryParams = qs.parse(query.toString()) as QueryParams<Expense>;

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
            {budgets.items.map(budget => (
              <BudgetInfo
                key={budget.id}
                remainingAmount={budget.remainingBudget}
                title={budget.title}
                totalAmount={budget.amount}
              />
            ))}
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
