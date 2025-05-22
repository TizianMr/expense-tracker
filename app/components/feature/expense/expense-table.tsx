import { Badge, Table, TableBody, TableCell, TableHead, TableRow } from '@tremor/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExpenseDropdown } from './expense-dropdown';
import LoadingSpinner from '../../ui/loading-spinner';
import Pagination from '../../ui/pagination';
import TableHeader from '../../ui/table-header';
import { useDelayedNavigationLoading } from '~/customHooks/useDelayedNavigationLoading';
import { useDelayedQueryParamLoading } from '~/customHooks/useDelayedQueryParamLoading';
import { ExpenseWithBudget } from '~/db/expense.server';
import { SortDirection, TablePaginationState, TableState, ThDef } from '~/interfaces';
import { DATE_OPTIONS, EXPENSE_CATEGORIES } from '~/utils/constants';
import { formatCurrency } from '~/utils/helpers';

type Props = {
  expenses: ExpenseWithBudget[];
  paginationState: TablePaginationState;
  excludeColumns?: string[];
  searchParamKey: 'expense' | 'budgetDetails';
};

export function ExpenseTable({ expenses, paginationState, excludeColumns, searchParamKey }: Props) {
  const { t } = useTranslation();
  const dataIsLoading = useDelayedQueryParamLoading('expense');
  const isLoadingFromExpenseMutation = useDelayedNavigationLoading('expenses');
  const [tableState, setTableState] = useState<Omit<TableState, 'paginationState'>>({
    sortBy: null,
    sortDirection: null,
  });

  const columnHeader: ThDef[] = [
    {
      id: 'title',
      title: t('ExpenseTable.headers.title'),
      isSortable: true,
    },
    {
      id: 'amount',
      title: t('ExpenseTable.headers.amount'),
      isSortable: true,
    },
    {
      id: 'expenseDate',
      title: t('ExpenseTable.headers.date'),
      isSortable: true,
    },
    {
      id: 'category',
      title: t('ExpenseTable.headers.category'),
      isSortable: true,
    },
    {
      id: 'budget',
      title: t('ExpenseTable.headers.budget'),
      isSortable: false,
    },
    {
      id: 'actions',
      title: t('ExpenseTable.headers.actions'),
      isSortable: false,
      options: { align: 'right' },
    },
  ];

  const handleSortingChange = (sortBy: string, direction: SortDirection | null) => {
    setTableState({ sortBy, sortDirection: direction });
  };

  const filteredColumnHeader = columnHeader.filter(header => !excludeColumns?.includes(header.id));

  return (
    <div className='flex flex-col flex-1 h-full'>
      <Table className='mt-5'>
        <TableHead>
          <TableRow>
            {filteredColumnHeader.map(header =>
              header.isSortable ? (
                <TableHeader
                  {...header}
                  isSortable
                  key={header.id}
                  searchParamKey={searchParamKey}
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
          {dataIsLoading || isLoadingFromExpenseMutation ? (
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
              const cellStyle = 'max-w-[2rem] truncate';
              const cellRenderers: Record<string, JSX.Element> = {
                title: (
                  <TableCell
                    className={cellStyle}
                    key='title'>
                    {expense.title}
                  </TableCell>
                ),
                amount: (
                  <TableCell
                    className={cellStyle}
                    key='amount'>
                    {formatCurrency(expense.amount)}
                  </TableCell>
                ),
                expenseDate: (
                  <TableCell
                    className={cellStyle}
                    key='expenseDate'>
                    {expense.expenseDate.toLocaleDateString('en-US', DATE_OPTIONS)}
                  </TableCell>
                ),
                category: (
                  <TableCell
                    className={cellStyle}
                    key='category'>
                    {category ? <Badge color={category.color}>{t(category.labelKey)}</Badge> : '-'}
                  </TableCell>
                ),
                budget: (
                  <TableCell
                    className={cellStyle}
                    key='budget'>
                    {expense.budget?.title ?? '-'}
                  </TableCell>
                ),
                actions: (
                  <TableCell key='actions'>
                    <div className='flex justify-end'>
                      <ExpenseDropdown expenseId={expense.id} />
                    </div>
                  </TableCell>
                ),
              };

              return (
                <TableRow key={expense.id}>{filteredColumnHeader.map(header => cellRenderers[header.id])}</TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                className='text-center'
                colSpan={columnHeader.length}>
                {t('ExpenseTable.noData')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className='mt-auto'>
        <Pagination
          paginationState={paginationState}
          searchParamKey={searchParamKey}
        />
      </div>
    </div>
  );
}
