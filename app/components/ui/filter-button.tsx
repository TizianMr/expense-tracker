import { RiCheckLine, RiFilterLine, RiResetLeftLine } from '@remixicon/react';
import { Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { EXPENSE_CATEGORIES } from '~/utils/constants';

const FilterButton = () => {
  const { t } = useTranslation();

  return (
    <div className='flex justify-center'>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='light'>
            <RiFilterLine
              aria-hidden='true'
              className='size-3.5 text-gray-900 dark:text-gray-50 opacity-30'
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-4'>
          <form>
            {EXPENSE_CATEGORIES.map(item => (
              <div
                className='flex items-center mb-4'
                key={item.value}>
                <input
                  className='w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-emerald-500 dark:focus:ring-emerald-500 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                  id={item.value}
                  type='checkbox'
                  value=''
                />
                <label
                  className='ms-2 text-sm font-medium text-gray-900 dark:text-gray-300'
                  htmlFor={item.value}>
                  {t(item.labelKey)}
                </label>
              </div>
            ))}
            <div className='flex gap-2'>
              <Button
                className='flex-1'
                loading={false}
                variant='secondary'
                onClick={() => {}}>
                <RiResetLeftLine className='size-3.5' />
              </Button>
              <Button
                className='flex-1'
                loading={false}
                variant='primary'
                onClick={() => {}}>
                <RiCheckLine className='size-3.5' />
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterButton;
