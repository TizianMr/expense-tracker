import { Badge, Box, Button, Table, Text } from '@chakra-ui/react';
import { Expense } from '@prisma/client';

import { ListResult } from '../db/types';
import { EXPENSE_CATEGORIES } from '../utils/constants';

type Props = {
  expenses: Expense[];
  paginationInfo: Pick<ListResult<Expense>, 'page' | 'pageSize' | 'totalItems'>;
};

const ExpensesTable = ({ expenses, paginationInfo: { totalItems, page, pageSize } }: Props) => {
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const tHeadStyle = {
    backgroundColor: '#F4F8FA',
    fontWeight: 600,
  };

  return (
    <Table.Root
      interactive
      size='lg'>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader
            style={tHeadStyle}
            textStyle={'sm'}
            borderRadius={'10px 0px 0px 0px'}>
            Title
          </Table.ColumnHeader>
          <Table.ColumnHeader
            textStyle={'sm'}
            style={tHeadStyle}>
            Amount
          </Table.ColumnHeader>
          <Table.ColumnHeader
            textStyle={'sm'}
            style={tHeadStyle}>
            Date
          </Table.ColumnHeader>
          <Table.ColumnHeader
            style={tHeadStyle}
            textStyle={'sm'}
            borderRadius={'0px 10px 0px 0px'}>
            Category
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {expenses.map(expense => {
          const category = EXPENSE_CATEGORIES.items.find(cat => cat.value === expense.category);
          return (
            <Table.Row key={expense.id}>
              <Table.Cell>{expense.title}</Table.Cell>
              <Table.Cell>{expense.amount} €</Table.Cell>
              <Table.Cell>{expense.expenseDate.toLocaleDateString('en-US', dateOptions)}</Table.Cell>
              <Table.Cell>
                <Badge colorPalette={category?.color}>{expense.category || 'NOT SELECTED'}</Badge>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
      <Table.Footer>
        <tr>
          <td
            colSpan={4}
            style={{ paddingTop: '1rem' }}>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'>
              <Text
                pl='2'
                color={'gray.500'}
                textStyle='sm'>
                {`Showing ${page * pageSize - pageSize + 1} to ${Math.min(page * pageSize, totalItems)} of ${totalItems} results`}
              </Text>
              <Box
                gap='3'
                display='flex'>
                <Button
                  variant='outline'
                  disabled={page === 1}>
                  Previous
                </Button>
                <Button
                  variant='outline'
                  disabled={page === Math.ceil(totalItems / pageSize)}>
                  Next
                </Button>
              </Box>
            </Box>
          </td>
        </tr>
      </Table.Footer>
    </Table.Root>
  );
};

export default ExpensesTable;
