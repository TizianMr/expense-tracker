import { Card, Box, Text, Button } from '@chakra-ui/react';
import { Expense } from '@prisma/client';
import { LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData, useNavigation } from '@remix-run/react';
import { useState } from 'react';
import { IoMdAdd } from 'react-icons/io';

import { default as CreateBudgetDialog } from '~/components/budget-dialog';
import ExpensesTable from '~/components/expenses-table';
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
  const { state } = useNavigation();
  const [openCreateBudgetDialog, setOpenCreateBudgetDialog] = useState(false);

  return (
    <>
      <Box
        display='flex'
        justifyContent='center'>
        <Card.Root
          mt='5'
          padding='0 !important'
          variant='elevated'
          width='70%'>
          <Card.Body>
            <Box
              alignItems='center'
              display='flex'
              justifyContent='space-between'
              mt='-5'>
              <Text textStyle='xl'>Expenses</Text>
              <NavLink to='expenses/create'>
                <Button
                  colorPalette='teal'
                  m='4'
                  variant='solid'>
                  <IoMdAdd /> Add expense
                </Button>
              </NavLink>
            </Box>
            <ExpensesTable
              expenses={expenses.items}
              isDataLoading={state === 'loading'}
              paginationInfo={{ totalItems: expenses.totalItems, page: expenses.page, pageSize: expenses.pageSize }}
            />
          </Card.Body>
        </Card.Root>
      </Box>
      <Box
        display='flex'
        justifyContent='center'>
        <Card.Root
          mt='5'
          padding='0 !important'
          variant='elevated'
          width='70%'>
          <Card.Body>
            <Box
              alignItems='center'
              display='flex'
              justifyContent='space-between'
              mt='-5'>
              <Text textStyle='xl'>Budgets</Text>
              <Button
                colorPalette='teal'
                m='4'
                variant='solid'
                onClick={() => setOpenCreateBudgetDialog(true)}>
                <IoMdAdd /> Add budget
              </Button>
              <CreateBudgetDialog
                action='budgets/create'
                isOpen={openCreateBudgetDialog}
                title='Add budget'
                onClose={() => setOpenCreateBudgetDialog(false)}
              />
            </Box>
            {JSON.stringify(budgets, null, 2)}
          </Card.Body>
        </Card.Root>
      </Box>
      <Outlet />
    </>
  );
};

export default Dashboard;
