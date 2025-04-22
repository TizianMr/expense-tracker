import { ProgressCircle } from '@tremor/react';

import { formatCurrency } from '~/utils/helpers';

type Props = {
  totalAmount: number;
  remainingAmount: number;
  title: string;
};

const BudgetInfo = ({ totalAmount, remainingAmount, title }: Props) => {
  const usedBudgetInPercentage = (100 * (totalAmount - remainingAmount)) / totalAmount;
  const color = usedBudgetInPercentage >= 90 ? 'red' : usedBudgetInPercentage <= 60 ? 'emerald' : 'yellow';

  return (
    <>
      <div className='space-y-3'>
        <div className='flex justify-start space-x-5 items-center'>
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
            <p className='text-tremor-default text-tremor-content dark:text-dark-tremor-content'>{`${formatCurrency(totalAmount - remainingAmount)} of ${formatCurrency(totalAmount)} used`}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BudgetInfo;
