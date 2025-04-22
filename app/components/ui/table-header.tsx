import { useSearchParams } from '@remix-run/react';
import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/react';
import { TableHeaderCell } from '@tremor/react';

import { SortDirection, TableState, ThDef } from '~/interfaces';
import { cx } from '~/utils/helpers';

interface CommonProps extends Omit<ThDef, 'title' | 'isSortable'> {
  id: string;
  children: React.ReactNode;
}

type ConditionalProps =
  | {
      isSortable: true;
      tableState: Omit<TableState, 'paginationState'>;
      onSortingChange: (sortBy: string, direction: SortDirection | null) => void;
    }
  | {
      isSortable: false;
      tableState?: never;
      onSortingChange?: never;
    };

type Props = CommonProps & ConditionalProps;

const TableHeader = ({ isSortable, children, id, onSortingChange, tableState, options }: Props) => {
  const [, setSearchParams] = useSearchParams();
  const sortDirection: SortDirection | null = tableState?.sortBy === id ? tableState.sortDirection : null;

  if (!isSortable) {
    return (
      <TableHeaderCell className={cx('w-52', options?.align ? `text-${options.align}` : '')}>
        {children}
      </TableHeaderCell>
    );
  }

  const handleSorting = () => {
    const newDirection = determineNewSortDirection();

    setNewSearchParams(newDirection);

    onSortingChange?.(id, newDirection);
  };

  const determineNewSortDirection = (): SortDirection | null => {
    let newDirection: SortDirection | null;
    switch (sortDirection) {
      case SortDirection.ASC:
        newDirection = SortDirection.DESC;
        break;
      case SortDirection.DESC:
        newDirection = null;
        break;
      default:
        newDirection = SortDirection.ASC;
        break;
    }

    return newDirection;
  };

  const setNewSearchParams = (newSortDirection: SortDirection | null) => {
    const params = new URLSearchParams();

    if (newSortDirection) {
      params.set('sortBy', id);
      params.set('sortDirection', newSortDirection);
    } else {
      params.delete('sortBy');
      params.delete('sortDirection');
    }

    setSearchParams(params);
  };

  return (
    <TableHeaderCell className={cx('w-52', options?.align ? `text-${options.align}` : '')}>
      <div
        className={
          '-mx-2 inline-flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2 hover:bg-gray-50 hover:dark:bg-gray-900'
        }
        {...(isSortable && {
          role: 'button',
          tabIndex: 0,
          onClick: handleSorting,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSorting();
            }
          },
        })}>
        <span>{children}</span>

        <div className='-space-y-2'>
          <RiArrowUpSLine
            aria-hidden='true'
            className={cx(
              'size-3.5 text-gray-900 dark:text-gray-50',
              sortDirection === SortDirection.DESC ? 'opacity-30' : '',
            )}
          />
          <RiArrowDownSLine
            aria-hidden='true'
            className={cx(
              'size-3.5 text-gray-900 dark:text-gray-50',
              sortDirection === SortDirection.ASC ? 'opacity-30' : '',
            )}
          />
        </div>
      </div>
    </TableHeaderCell>
  );
};

export default TableHeader;
