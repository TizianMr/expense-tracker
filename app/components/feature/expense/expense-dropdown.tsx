import { NavLink, useLocation } from '@remix-run/react';
import { RiMoreFill } from '@remixicon/react';
import { Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown';

type Props = {
  expenseId: string;
};

export const ExpenseDropdown = ({ expenseId }: Props) => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className='p-1.5 border border-transparent hover:border-gray-300 data-[state=open]:border-gray-300 data-[state=open]:bg-gray-50 hover:dark:border-gray-700 data-[state=open]:dark:border-gray-700 data-[state=open]:dark:bg-gray-900 rounded-md'
          variant='light'>
          <RiMoreFill
            aria-hidden='true'
            className='size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-data-[state=open]:text-gray-700 group-hover:dark:text-gray-300 group-data-[state=open]:dark:text-gray-300'
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='min-w-40'>
        <NavLink
          preventScrollReset
          to={{ pathname: `expenses/${expenseId}/edit`, search: location.search }}>
          <DropdownMenuItem>{t('common.edit')}</DropdownMenuItem>
        </NavLink>

        <NavLink
          preventScrollReset
          to={{ pathname: `expenses/${expenseId}/delete`, search: location.search }}>
          <DropdownMenuItem className='text-red-600 dark:text-red-500'>{t('common.delete')}</DropdownMenuItem>
        </NavLink>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
