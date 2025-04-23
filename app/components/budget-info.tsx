import { NavLink } from '@remix-run/react';
import { Button, ProgressCircle } from '@tremor/react';

import { formatCurrency } from '~/utils/helpers';

type Props = {
  totalAmount: number;
  usedAmount: number;
  title: string;
  id: string;
};

const BudgetInfo = ({ totalAmount, usedAmount, title, id }: Props) => {
  const usedBudgetInPercentage = (100 * usedAmount) / totalAmount;
  const color = usedBudgetInPercentage >= 90 ? 'red' : usedBudgetInPercentage <= 60 ? 'emerald' : 'yellow';

  return (
    <div>
      <NavLink to={`budgets/${id}`}>
        <div className='flex justify-start space-x-5 items-center hover:hover:bg-gray-100 p-2 rounded-lg'>
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
              <Button variant='light'>Edit</Button>
              <NavLink to={`budgets/${id}/delete`}>
                <Button
                  color='red'
                  variant='light'>
                  Delete
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </NavLink>
    </div>
  );
};

export default BudgetInfo;
