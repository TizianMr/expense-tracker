import { Badge, Box, Button, HStack, IconButton, Spinner, Table, Text } from '@chakra-ui/react';
import { Expense } from '@prisma/client';
import { Form, Link, useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { MdDelete } from 'react-icons/md';

import { ColumnSorter } from './column-sorter';
import { DATE_OPTIONS, EXPENSE_CATEGORIES } from '../utils/constants';
import { TableHeader, ListResult } from '~/interfaces';
import { formatCurrency } from '~/utils/helpers';

type ExpensesTableProps = {
  expenses: Expense[];
  paginationInfo: Pick<ListResult<Expense>, 'page' | 'pageSize' | 'totalItems'>;
  isDataLoading: boolean;
};

type ColumnHeaderProps = {
  headerInfo: TableHeader;
};

type TablePlaceHolderProps = {
  colSpan: number;
};

const ColumnHeader = ({ headerInfo }: ColumnHeaderProps) => {
  const tHeadStyle = {
    fontWeight: 600,
    color: '#71717a',
  };

  return (
    <Table.ColumnHeader
      style={tHeadStyle}
      textStyle={'sm'}
      width={headerInfo.width || 'auto'}>
      <HStack>
        <Box>{headerInfo.title?.toUpperCase()}</Box>
        <HStack>
          <ColumnSorter column={headerInfo} />
        </HStack>
      </HStack>
    </Table.ColumnHeader>
  );
};

const LoadingSpinnerContainer = ({ colSpan }: TablePlaceHolderProps) => {
  return (
    <tr>
      <td colSpan={colSpan}>
        <Box
          width='100%'
          display='flex'
          justifyContent='center'
          alignItems='center'>
          <Spinner size='lg' />
        </Box>
      </td>
    </tr>
  );
};

const NoDataContainer = ({ colSpan }: TablePlaceHolderProps) => {
  return (
    <tr>
      <td colSpan={colSpan}>
        <Box
          width='100%'
          display='flex'
          justifyContent='center'
          alignItems='center'>
          <Text>No data.</Text>
        </Box>
      </td>
    </tr>
  );
};

// TODO: research and refactor to use tanstack-table
const ExpensesTable = ({
  expenses,
  isDataLoading,
  paginationInfo: { totalItems, page, pageSize },
}: ExpensesTableProps) => {
  const [queryParams] = useSearchParams();
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);

  // show loading spinner if the data is loading for more than 250ms
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isDataLoading) {
      timer = setTimeout(() => {
        setShowLoadingSpinner(true);
      }, 250);
    } else {
      if (timer) {
        clearTimeout(timer);
      }
      setShowLoadingSpinner(false);
    }

    return () => clearTimeout(timer);
  }, [isDataLoading]);

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
    {
      id: 'actions',
      width: '100px',
      isSortable: false,
    },
  ];

  return (
    <Table.Root
      interactive={!showLoadingSpinner && expenses.length > 0}
      tableLayout='fixed'
      size='md'>
      <Table.Header>
        <Table.Row>
          {columnHeader.map(header => (
            <ColumnHeader
              key={header.id}
              headerInfo={header}
            />
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body height='19em'>
        {showLoadingSpinner ? (
          <LoadingSpinnerContainer colSpan={columnHeader.length} />
        ) : expenses.length === 0 ? (
          <NoDataContainer colSpan={columnHeader.length} />
        ) : (
          expenses.map((expense: Expense) => {
            const category = EXPENSE_CATEGORIES.items.find(cat => cat.value === expense.category);
            return (
              <Table.Row key={expense.id}>
                <Table.Cell>{expense.title}</Table.Cell>
                <Table.Cell>{formatCurrency(expense.amount)}</Table.Cell>
                <Table.Cell>{expense.expenseDate.toLocaleDateString('en-US', DATE_OPTIONS)}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={category?.color}>{expense.category || 'NOT SELECTED'}</Badge>
                </Table.Cell>
                <Table.Cell textAlign='end'>
                  <Form
                    action='expenses/delete'
                    method='delete'>
                    <input
                      type='hidden'
                      name='expenseId'
                      value={expense.id}
                    />
                    <IconButton
                      type='submit'
                      variant='ghost'
                      aria-label='Delete expense'>
                      <MdDelete color='#dc2626' />
                    </IconButton>
                  </Form>
                </Table.Cell>
              </Table.Row>
            );
          })
        )}
        {!showLoadingSpinner &&
          expenses.length > 0 &&
          Array.from({ length: remainingRows }).map((_, i) => (
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
            colSpan={columnHeader.length}
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
