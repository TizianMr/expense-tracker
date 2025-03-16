import { Card, Box, Text } from '@chakra-ui/react';
import { useLoaderData } from '@remix-run/react';

import CreateExpenseDialog from '~/components/create-expense-dialog';
import ExpensesTable from '~/components/expenses-table';
import { fetchExpenses } from '~/db/expense.server';

export const loader = async () => {
  const expenses = await fetchExpenses({ page: 1, pageSize: 5 });
  return expenses;
};

const Index = () => {
  const data = useLoaderData<typeof loader>();

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
          <ExpensesTable expenses={data.items} />
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default Index;
