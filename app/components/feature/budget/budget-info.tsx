import { useLocation, useNavigate } from '@remix-run/react';
import { Button, ProgressCircle } from '@tremor/react';

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
  const usedBudgetInPercentage = (100 * usedAmount) / totalAmount;
  const color = usedBudgetInPercentage >= 90 ? 'red' : usedBudgetInPercentage <= 60 ? 'emerald' : 'yellow';

  const handleRowClick = () => {
    navigate(`budgets/${id}`, { preventScrollReset: true });
  };

  return (
    <div>
      <div
        className='flex lg:flex-row flex-col text-center lg:text-left justify-start lg:space-x-5 items-center hover:hover:bg-gray-100 p-2 rounded-lg'
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
          <span className='text-xs font-medium text-slate-700'>{Math.round(usedBudgetInPercentage)}%</span>
        </ProgressCircle>
        <div>
          <p className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium'>
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
              Edit
            </Button>
            <Button
              color='red'
              variant='light'
              onClick={e => {
                e.stopPropagation();
                navigate({ pathname: `budgets/${id}/delete`, search: location.search }, { preventScrollReset: true });
              }}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetInfo;
