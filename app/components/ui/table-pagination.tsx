import { useSearchParams } from '@remix-run/react';
import { RiArrowLeftDoubleLine, RiArrowLeftSLine, RiArrowRightDoubleLine, RiArrowRightSLine } from '@remixicon/react';
import { Button } from '@tremor/react';

import { TablePaginationState } from '~/interfaces';

type Props = {
  paginationState: TablePaginationState;
};

const TablePagination = ({ paginationState: { page, pageSize, totalItems } }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const paginationButtons = [
    {
      icon: RiArrowLeftDoubleLine,
      onClick: () => {
        const firstPageQuery = new URLSearchParams(searchParams);
        firstPageQuery.set('page', '1');
        setSearchParams(firstPageQuery);
      },
      disabled: page === 1,
      srText: 'First page',
      mobileView: 'hidden sm:block',
    },
    {
      icon: RiArrowLeftSLine,
      onClick: () => {
        const previousQuery = new URLSearchParams(searchParams);
        previousQuery.set('page', (page - 1).toString());
        setSearchParams(previousQuery);
      },
      disabled: page === 1,
      srText: 'Previous page',
      mobileView: '',
    },
    {
      icon: RiArrowRightSLine,
      onClick: () => {
        const nextQuery = new URLSearchParams(searchParams);
        nextQuery.set('page', (page + 1).toString());
        setSearchParams(nextQuery);
      },
      disabled: page === Math.ceil(totalItems / pageSize),
      srText: 'Next page',
      mobileView: '',
    },
    {
      icon: RiArrowRightDoubleLine,
      onClick: () => {
        const lastPageQuery = new URLSearchParams(searchParams);
        lastPageQuery.set('page', Math.ceil(totalItems / pageSize).toString());
        setSearchParams(lastPageQuery);
      },
      disabled: page === Math.ceil(totalItems / pageSize),
      srText: 'Last page',
      mobileView: 'hidden sm:block',
    },
  ];

  return (
    <div className='flex items-center justify-between'>
      <p className='hidden text-sm tabular-nums text-gray-500 sm:block'>
        Showing{' '}
        <span className='font-semibold text-gray-900 dark:text-gray-50'>
          {page * pageSize - pageSize + 1}-{Math.min(page * pageSize, totalItems)}
        </span>{' '}
        of <span className='font-semibold text-gray-900 dark:text-gray-50'>{totalItems}</span>
      </p>{' '}
      <div className='flex items-center gap-x-6 lg:gap-x-8'>
        <div className='flex items-center gap-x-1.5'>
          {paginationButtons.map((button, index) => (
            <Button
              className='border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-50'
              color='stone'
              disabled={button.disabled}
              key={index}
              size='xs'
              tooltip={button.srText}
              variant='secondary'
              onClick={() => {
                button.onClick();
              }}>
              <span className='sr-only'>{button.srText}</span>
              <button.icon
                aria-hidden='true'
                className='size-4 shrink-0'
              />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
