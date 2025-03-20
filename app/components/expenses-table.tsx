import { Badge, Box, Button, HStack, Table, Text } from '@chakra-ui/react';
import { Expense } from '@prisma/client';
import { Link, useSearchParams } from '@remix-run/react';

import { ColumnSorter } from './column-sorter';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { TableHeader, ListResult } from '~/interfaces';
import { formatCurrency } from '~/utils/helpers';

type ExpensesTableProps = {
  expenses: Expense[];
  paginationInfo: Pick<ListResult<Expense>, 'page' | 'pageSize' | 'totalItems'>;
};

type ColumnHeaderProps = {
  headerInfo: TableHeader;
};

const ColumnHeader = ({ headerInfo }: ColumnHeaderProps) => {
  const tHeadStyle = {
    fontWeight: 600,
    color: '#71717a',
  };

  return (
    <Table.ColumnHeader
      style={tHeadStyle}
      textStyle={'sm'}>
      <HStack>
        <Box>{headerInfo.title.toUpperCase()}</Box>
        <HStack>
          <ColumnSorter column={headerInfo} />
        </HStack>
      </HStack>
    </Table.ColumnHeader>
  );
};

// TODO: filtering?
// TODO: loading spinner
// TODO: empty state
// https://refine.dev/docs/examples/table/chakra-ui/advanced-react-table/
const ExpensesTable = ({ expenses, paginationInfo: { totalItems, page, pageSize } }: ExpensesTableProps) => {
  const [queryParams] = useSearchParams();

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const previousQuery = new URLSearchParams(queryParams);
  previousQuery.set('page', (page - 1).toString());

  const nextQuery = new URLSearchParams(queryParams);
  nextQuery.set('page', (page + 1).toString());

  const remainingRows = pageSize - expenses.length;

  const columnHeader: TableHeader[] = [
    {
      id: 'title',
      title: 'Title',
      isSortable: true,
    },
    {
      id: 'amount',
      title: 'Amount',
      isSortable: true,
    },
    {
      id: 'expenseDate',
      title: 'Date',
      isSortable: true,
    },
    {
      id: 'category',
      title: 'Category',
      isSortable: true,
    },
  ];

  return (
    <Table.Root
      interactive
      tableLayout='fixed'
      size='lg'>
      <Table.Header>
        <Table.Row>
          {columnHeader.map(header => (
            <ColumnHeader
              key={header.title}
              headerInfo={header}
            />
          ))}
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
