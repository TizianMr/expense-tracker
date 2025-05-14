import { NavLink, useLocation } from '@remix-run/react';
import { RiQuestionLine, RiAddLine, RiBarChartFill } from '@remixicon/react';
import { Legend, Icon, Button } from '@tremor/react';

import BudgetInfo from './budget-info';
import LoadingSpinner from '~/components/ui/loading-spinner';
import Pagination from '~/components/ui/pagination';
import { Tooltip } from '~/components/ui/tooltip';
import { useDelayedNavigationLoading } from '~/customHooks/useDelayedNavigationLoading';
import { useDelayedQueryParamLoading } from '~/customHooks/useDelayedQueryParamLoading';
import { BudgetWithUsage } from '~/db/budget.server';
import { ListResult } from '~/interfaces';

type Props = {
  budgets: ListResult<BudgetWithUsage>;
};

const Budgets = ({ budgets }: Props) => {
  const location = useLocation();
  const isDataLoading = useDelayedQueryParamLoading('budget');
  const loading = useDelayedNavigationLoading('budgets');
  const budgetDialogIsLoading = useDelayedNavigationLoading('dashboard', 'budgets/create');

  return (
    <>
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <h1 className='text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'>
            Budgets
          </h1>
          <Tooltip
            className='w-[20rem]'
            content={
              <Legend
                categories={[
                  'No worries! You are well within your budget.',
                  "Heads up! You're nearing your budget limit.",
                  "Alert! You've nearly maxed out your budget.",
                ]}
                className='tooltip-legend-white'
                colors={['emerald', 'orange', 'red']}
              />
            }
            showArrow={false}>
            <Icon
              icon={RiQuestionLine}
              size='sm'
            />
          </Tooltip>
        </div>

        <NavLink
          preventScrollReset
          to={{ pathname: 'budgets/create', search: location.search }}>
          <Button
            icon={RiAddLine}
            loading={budgetDialogIsLoading}>
            Create budget
          </Button>
        </NavLink>
      </div>
      <div className='flex flex-col mx-auto h-full w-full mt-6'>
        <div className='flex flex-col flex-grow justify-center lg:justify-start lg:space-y-6'>
          {isDataLoading || loading ? (
            <div className='flex h-full w-full items-center justify-center'>
              <LoadingSpinner />
            </div>
          ) : budgets.items.length ? (
            budgets.items.map(budget => (
              <BudgetInfo
                id={budget.id}
                key={budget.id}
                title={budget.title}
                totalAmount={budget.amount}
                usedAmount={budget.totalUsedBudget}
              />
            ))
          ) : (
            <div className='text-center'>
              <RiBarChartFill
                aria-hidden={true}
                className='mx-auto h-7 w-7 text-tremor-content-subtle dark:text-dark-tremor-content-subtle'
              />
              <p className='mt-2 text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong'>
                No data to show
              </p>
              <p className='text-tremor-default text-tremor-content dark:text-dark-tremor-content'>
                Get started by creating your first budget
              </p>
            </div>
          )}
        </div>
        <div className='w-full'>
          <Pagination
            paginationState={{ totalItems: budgets.totalItems, page: budgets.page, pageSize: budgets.pageSize }}
            searchParamKey='budget'
          />
        </div>
      </div>
    </>
  );
};

export default Budgets;
