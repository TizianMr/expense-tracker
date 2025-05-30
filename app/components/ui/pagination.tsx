import { useSearchParams } from '@remix-run/react';
import { RiArrowLeftDoubleLine, RiArrowLeftSLine, RiArrowRightDoubleLine, RiArrowRightSLine } from '@remixicon/react';
import { Button } from '@tremor/react';
import qs from 'qs';
import { useTranslation } from 'react-i18next';

import { QueryParams, TablePaginationState } from '~/interfaces';

type Props = {
  paginationState: TablePaginationState;
  searchParamKey: 'expense' | 'budget' | 'budgetDetails';
};

const Pagination = ({ paginationState: { page: currentPage, pageSize, totalItems }, searchParamKey }: Props) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const nestedParams = qs.parse(searchParams.toString()) as QueryParams;

  const paginationButtons = [
    {
      icon: RiArrowLeftDoubleLine,
      onClick: () => {
        const updated = {
          ...nestedParams,
          [searchParamKey]: {
            ...(nestedParams[searchParamKey] ?? {}),
            page: 1,
          },
        };

        setSearchParams(qs.stringify(updated), { preventScrollReset: true });
      },
      disabled: currentPage == 1,
      srText: t('Pagination.first'),
      mobileView: 'hidden sm:block',
    },
    {
      icon: RiArrowLeftSLine,
      onClick: () => {
        const updated = {
          ...nestedParams,
          [searchParamKey]: {
            ...(nestedParams[searchParamKey] ?? {}),
            page: currentPage - 1,
          },
        };

        setSearchParams(qs.stringify(updated), { preventScrollReset: true });
      },
      disabled: currentPage == 1,
      srText: t('Pagination.previous'),
      mobileView: '',
    },
    {
      icon: RiArrowRightSLine,
      onClick: () => {
        const updated = {
          ...nestedParams,
          [searchParamKey]: {
            ...(nestedParams[searchParamKey] ?? {}),
            page: currentPage + 1,
          },
        };

        setSearchParams(qs.stringify(updated), { preventScrollReset: true });
      },
      disabled: Number(currentPage) >= Math.ceil(totalItems / pageSize),
      srText: t('Pagination.next'),
      mobileView: '',
    },
    {
      icon: RiArrowRightDoubleLine,
      onClick: () => {
        const updated = {
          ...nestedParams,
          [searchParamKey]: {
            ...(nestedParams[searchParamKey] ?? {}),
            page: Math.ceil(totalItems / pageSize),
          },
        };

        setSearchParams(qs.stringify(updated), { preventScrollReset: true });
      },
      disabled: currentPage >= Math.ceil(totalItems / pageSize),
      srText: t('Pagination.last'),
      mobileView: 'hidden sm:block',
    },
  ];

  return (
    <div className='flex items-center justify-between gap-2'>
      <p className='hidden text-sm tabular-nums text-gray-500 sm:block'>
        {t('Pagination.info.0')}{' '}
        <span className='font-semibold text-gray-900 dark:text-gray-50'>
          {totalItems === 0 ? 0 : currentPage * pageSize - pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)}
        </span>{' '}
        {t('Pagination.info.1')} <span className='font-semibold text-gray-900 dark:text-gray-50'>{totalItems}</span>
      </p>{' '}
      <div className='flex items-center sm:w-auto w-full justify-center gap-x-6 lg:gap-x-8'>
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

export default Pagination;
