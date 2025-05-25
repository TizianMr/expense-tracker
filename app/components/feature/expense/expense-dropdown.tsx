import { RiMoreFill } from '@remixicon/react';
import { Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown';
import CustomNavLink from '~/components/ui/custom-navlink';

type Props = {
  expenseId: string;
};

export const ExpenseDropdown = ({ expenseId }: Props) => {
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
        <CustomNavLink to={`expenses/${expenseId}/edit`}>
          <DropdownMenuItem>{t('common.edit')}</DropdownMenuItem>
        </CustomNavLink>

        <CustomNavLink to={`expenses/${expenseId}/delete`}>
          <DropdownMenuItem className='text-red-600 dark:text-red-500'>{t('common.delete')}</DropdownMenuItem>
        </CustomNavLink>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
