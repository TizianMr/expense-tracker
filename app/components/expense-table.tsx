import { Badge, Table, TableBody, TableCell, TableHead, TableRow } from '@tremor/react';
import { useState } from 'react';

import { ExpenseDropdown } from './expense-dropdown';
import LoadingSpinner from './ui/loading-spinner';
import Pagination from './ui/pagination';
import TableHeader from './ui/table-header';
import { useDelayedLoading } from '~/customHooks/useDelayedLoading';
import { ExpenseWithBudget } from '~/db/expense.server';
import { SortDirection, TablePaginationState, TableState, ThDef } from '~/interfaces';
import { DATE_OPTIONS, EXPENSE_CATEGORIES } from '~/utils/constants';
import { formatCurrency } from '~/utils/helpers';

type Props = {
  expenses: ExpenseWithBudget[];
  paginationState: TablePaginationState;
};

export function ExpenseTable({ expenses, paginationState }: Props) {
  const { isLoadingLongerThanDelay: dataIsLoading } = useDelayedLoading();
  const [tableState, setTableState] = useState<Omit<TableState, 'paginationState'>>({
    sortBy: null,
    sortDirection: null,
  });

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
      id: 'budget',
      title: 'Budget',
      isSortable: false,
    },
    {
      id: 'actions',
      title: 'Actions',
      isSortable: false,
      options: { align: 'right' },
    },
  ];

  const handleSortingChange = (sortBy: string, direction: SortDirection | null) => {
    setTableState({ sortBy, sortDirection: direction });
  };

  return (
    <div className='flex flex-col flex-1 h-full'>
      <Table className='mt-5'>
        <TableHead>
          <TableRow>
            {columnHeader.map(header =>
              header.isSortable ? (
                <TableHeader
                  {...header}
                  isSortable
                  key={header.id}
                  tableState={tableState}
                  onSortingChange={handleSortingChange}>
                  {header.title}
                </TableHeader>
              ) : (
                <TableHeader
                  {...header}
                  isSortable={false}
                  key={header.id}>
                  {header.title}
                </TableHeader>
              ),
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataIsLoading ? (
            <TableRow>
              <TableCell
                className='w-full'
                colSpan={columnHeader.length}
                rowSpan={5}>
                <LoadingSpinner />
              </TableCell>
            </TableRow>
          ) : expenses.length ? (
            expenses.map(expense => {
              const category = EXPENSE_CATEGORIES.find(cat => cat.value === expense.category);
              return (
                <TableRow key={expense.id}>
                  <TableCell>{expense.title}</TableCell>
                  <TableCell>{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>{expense.expenseDate.toLocaleDateString('en-US', DATE_OPTIONS)}</TableCell>
                  <TableCell>
                    {expense.category ? <Badge color={category?.color}>{expense.category}</Badge> : '-'}
                  </TableCell>
                  <TableCell>{expense.budget?.title ?? '-'}</TableCell>
                  <TableCell>
                    <div className='flex justify-end'>
                      <ExpenseDropdown expenseId={expense.id} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                className='text-center'
                colSpan={columnHeader.length}>
                No data to show.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className='mt-auto'>
        <Pagination
          paginationState={paginationState}
          searchParamKey='expense'
        />
      </div>
    </div>
  );
}
