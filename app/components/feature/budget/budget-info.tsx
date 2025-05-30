import { useLocation, useNavigate } from '@remix-run/react';
import { Button, ProgressCircle } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import { formatCurrency } from '~/utils/helpers';

type Props = {
  totalAmount: number;
  usedAmount: number;
  title: string;
  id: string;
};

const BudgetInfo = ({ totalAmount, usedAmount, title, id }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const usedBudgetInPercentage = (100 * usedAmount) / totalAmount;
  const color = usedBudgetInPercentage >= 90 ? 'red' : usedBudgetInPercentage <= 60 ? 'emerald' : 'yellow';

  const handleRowClick = () => {
    navigate({ pathname: `budgets/${id}`, search: location.search }, { preventScrollReset: true });
  };

  return (
    <div
      className='flex lg:flex-row flex-col text-center lg:text-left justify-start lg:space-x-5 items-center hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg'
      role='button'
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleRowClick();
        }
      }}>
      <ProgressCircle
        color={color}
        size='lg'
        strokeWidth={9}
        value={usedBudgetInPercentage}>
        <span className='text-xs font-medium text-slate-700 dark:text-slate-500'>
          {Math.round(usedBudgetInPercentage)}%
        </span>
      </ProgressCircle>
      <div className='w-full min-w-0'>
        <p className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium lg:truncate max-w-full'>
          {title}
        </p>
        <p className='text-tremor-default text-tremor-content dark:text-dark-tremor-content'>{`${formatCurrency(usedAmount)} of ${formatCurrency(totalAmount)} used`}</p>
        <div className='space-x-2'>
          <Button
            variant='light'
            onClick={e => {
              e.stopPropagation();
              navigate({ pathname: `budgets/${id}/edit`, search: location.search }, { preventScrollReset: true });
            }}>
            {t('common.edit')}
          </Button>
          <Button
            color='red'
            variant='light'
            onClick={e => {
              e.stopPropagation();
              navigate({ pathname: `budgets/${id}/delete`, search: location.search }, { preventScrollReset: true });
            }}>
            {t('common.delete')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BudgetInfo;
