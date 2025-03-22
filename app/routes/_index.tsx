import { Card, Box, Text } from '@chakra-ui/react';
import { Expense } from '@prisma/client';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigation } from '@remix-run/react';

import CreateExpenseDialog from '~/components/create-expense-dialog';
import ExpensesTable from '~/components/expenses-table';
import { fetchExpenses } from '~/db/expense.server';
import { SortDirection } from '~/interfaces';
import { EXPENSE_TABLE_PAGE_SIZE } from '~/utils/constants';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams;
  const expenses = await fetchExpenses({
    page: Number(query.get('page')) || 1,
    pageSize: EXPENSE_TABLE_PAGE_SIZE,
    sortBy: (query.get('sortBy') as keyof Expense) || 'expenseDate',
    sortDirection: (query.get('sortDirection') as SortDirection) || SortDirection.DESC,
  });
  return expenses;
};

const Index = () => {
  const data = useLoaderData<typeof loader>();
  const { state } = useNavigation();

  return (
    <Box
      justifyContent='center'
      display='flex'>
      <Card.Root
        width='70%'
        mt='5'
        padding='0 !important'
        variant='elevated'>
        <Card.Body>
          <Box
            display='flex'
            mt='-5'
            alignItems='center'
            justifyContent='space-between'>
            <Text textStyle='xl'>Expenses</Text>
            <CreateExpenseDialog />
          </Box>
          <ExpensesTable
            isDataLoading={state === 'loading'}
            expenses={data.items}
            paginationInfo={{ totalItems: data.totalItems, page: data.page, pageSize: data.pageSize }}
          />
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default Index;
