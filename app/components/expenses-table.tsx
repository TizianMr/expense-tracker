import { Badge, Box, Button, HStack, IconButton, Spinner, Table, Text } from '@chakra-ui/react';
import { Expense } from '@prisma/client';
import { Link, NavLink, useNavigation, useSearchParams, useSubmit } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';

import { ColumnSorter } from './column-sorter';
import { ConfirmationDialog } from './confirmation-dialog';
import { DATE_OPTIONS, EXPENSE_CATEGORIES } from '../utils/constants';
import { ThDef, ListResult } from '~/interfaces';
import { formatCurrency } from '~/utils/helpers';

type ExpensesTableProps = {
  expenses: Expense[];
  paginationInfo: Pick<ListResult<Expense>, 'page' | 'pageSize' | 'totalItems'>;
  isDataLoading: boolean;
};

type ColumnHeaderProps = {
  headerInfo: ThDef;
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
          alignItems='center'
          display='flex'
          justifyContent='center'
          width='100%'>
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
          alignItems='center'
          display='flex'
          justifyContent='center'
          width='100%'>
          <Text>No data.</Text>
        </Box>
      </td>
    </tr>
  );
};

const ExpensesTable = ({
  expenses,
  isDataLoading,
  paginationInfo: { totalItems, page, pageSize },
}: ExpensesTableProps) => {
  const submit = useSubmit();
  const navigation = useNavigation();
  const [queryParams] = useSearchParams();
  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const wasLoading = useRef(false);
  const isLoading = navigation.state === 'submitting' || navigation.state === 'loading';

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

  useEffect(() => {
    if (wasLoading.current && !isLoading && openConfirmDeleteDialog) {
      handleCloseDeleteDialog();
    }

    wasLoading.current = isLoading;
  }, [isLoading, openConfirmDeleteDialog]);

  const previousQuery = new URLSearchParams(queryParams);
  previousQuery.set('page', (page - 1).toString());

  const nextQuery = new URLSearchParams(queryParams);
  nextQuery.set('page', (page + 1).toString());

  const remainingRows = pageSize - expenses.length;

  const columnHeader: ThDef[] = [
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
      isSortable: false,
    },
  ];

  const handleDeleteExpense = () => {
    if (selectedExpense) submit({ expenseId: selectedExpense.id }, { method: 'delete', action: 'expenses/delete' });
  };

  const handleOpenDeleteDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setOpenConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedExpense(null);
    setOpenConfirmDeleteDialog(false);
  };

  return (
    <>
      <ConfirmationDialog
        description='Deleted expenses cannot be restored.'
        isOpen={openConfirmDeleteDialog}
        isSubmitting={isLoading}
        title='Delete expense?'
        onClose={handleCloseDeleteDialog}
        onSubmit={handleDeleteExpense}
      />
      <Table.Root
        interactive={!showLoadingSpinner && expenses.length > 0}
        size='md'
        tableLayout='fixed'>
        <Table.Header>
          <Table.Row>
            {columnHeader.map(header => (
              <ColumnHeader
                headerInfo={header}
                key={header.id}
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
              const category = EXPENSE_CATEGORIES.find(cat => cat.value === expense.category);
              return (
                <Table.Row key={expense.id}>
                  <Table.Cell>{expense.title}</Table.Cell>
                  <Table.Cell>{formatCurrency(expense.amount)}</Table.Cell>
                  <Table.Cell>{expense.expenseDate.toLocaleDateString('en-US', DATE_OPTIONS)}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={category?.color}>{expense.category || 'NOT SELECTED'}</Badge>
                  </Table.Cell>
                  <Table.Cell textAlign='end'>
                    <HStack>
                      <NavLink to={`expenses/${expense.id}/edit`}>
                        <IconButton
                          aria-label='Edit expense'
                          variant='ghost'>
                          <MdEdit />
                        </IconButton>
                      </NavLink>
                      <IconButton
                        aria-label='Delete expense'
                        variant='ghost'
                        onClick={() => handleOpenDeleteDialog(expense)}>
                        <MdDelete color='#dc2626' />
                      </IconButton>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              );
            })
          )}
          {!showLoadingSpinner &&
            expenses.length > 0 &&
            Array.from({ length: remainingRows }).map((_, i) => (
              <Table.Row
                aria-hidden='true'
                key={`empty-${i}`}
                visibility='hidden'>
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
                alignItems='center'
                display='flex'
                justifyContent='space-between'>
                <Text
                  color={'gray.500'}
                  pl='2'
                  textStyle='sm'>
                  {`Showing ${page * pageSize - pageSize + 1} to ${Math.min(page * pageSize, totalItems)} of ${totalItems} results`}
                </Text>
                <Box
                  display='flex'
                  gap='3'>
                  <Link to={`?${previousQuery.toString()}`}>
                    <Button
                      disabled={page === 1}
                      variant='outline'>
                      Previous
                    </Button>
                  </Link>
                  <Link to={`?${nextQuery.toString()}`}>
                    <Button
                      disabled={page === Math.ceil(totalItems / pageSize)}
                      variant='outline'>
                      Next
                    </Button>
                  </Link>
                </Box>
              </Box>
            </td>
          </tr>
        </Table.Footer>
      </Table.Root>
    </>
  );
};

export default ExpensesTable;
