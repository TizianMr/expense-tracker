import { Badge, Box, Button, Table, Text } from '@chakra-ui/react';
import { Expense } from '@prisma/client';
import { Link, useSearchParams } from '@remix-run/react';

import { ListResult } from '../db/types';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { formatCurrency } from '~/utils/helpers';

type Props = {
  expenses: Expense[];
  paginationInfo: Pick<ListResult<Expense>, 'page' | 'pageSize' | 'totalItems'>;
};

const ExpensesTable = ({ expenses, paginationInfo: { totalItems, page, pageSize } }: Props) => {
  const [queryParams] = useSearchParams();

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const tHeadStyle = {
    // backgroundColor: '#F4F8FA',
    fontWeight: 600,
    color: '#71717a',
  };

  const previousQuery = new URLSearchParams(queryParams);
  previousQuery.set('page', (page - 1).toString());

  const nextQuery = new URLSearchParams(queryParams);
  nextQuery.set('page', (page + 1).toString());

  const remainingRows = pageSize - expenses.length;

  return (
    <Table.Root
      interactive
      tableLayout='fixed'
      size='lg'>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader
            style={tHeadStyle}
            textStyle={'sm'}>
            {'Title'.toUpperCase()}
          </Table.ColumnHeader>
          <Table.ColumnHeader
            textStyle={'sm'}
            style={tHeadStyle}>
            {'Amount'.toUpperCase()}
          </Table.ColumnHeader>
          <Table.ColumnHeader
            textStyle={'sm'}
            style={tHeadStyle}>
            {'Date'.toUpperCase()}
          </Table.ColumnHeader>
          <Table.ColumnHeader
            style={tHeadStyle}
            textStyle={'sm'}>
            {'Category'.toUpperCase()}
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {expenses.map(expense => {
          const category = EXPENSE_CATEGORIES.items.find(cat => cat.value === expense.category);
          return (
            <Table.Row key={expense.id}>
              <Table.Cell>{expense.title}</Table.Cell>
              <Table.Cell>{formatCurrency(expense.amount)}</Table.Cell>
              <Table.Cell>{expense.expenseDate.toLocaleDateString('en-US', dateOptions)}</Table.Cell>
              <Table.Cell>
                <Badge colorPalette={category?.color}>{expense.category || 'NOT SELECTED'}</Badge>
              </Table.Cell>
            </Table.Row>
          );
        })}
        {Array.from({ length: remainingRows }).map((_, i) => (
          <Table.Row
            visibility='hidden'
            aria-hidden='true'
            key={`empty-${i}`}>
            <Table.Cell borderColor='transparent'>&nbsp;</Table.Cell>
          </Table.Row>
        ))}
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
                <Link to={`?${previousQuery.toString()}`}>
                  <Button
                    variant='outline'
                    disabled={page === 1}>
                    Previous
                  </Button>
                </Link>
                <Link to={`?${nextQuery.toString()}`}>
                  <Button
                    variant='outline'
                    disabled={page === Math.ceil(totalItems / pageSize)}>
                    Next
                  </Button>
                </Link>
              </Box>
            </Box>
          </td>
        </tr>
      </Table.Footer>
    </Table.Root>
  );
};

export default ExpensesTable;
