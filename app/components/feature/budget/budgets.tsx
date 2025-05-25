import { RiQuestionLine, RiAddLine, RiBarChartFill } from '@remixicon/react';
import { Legend, Icon, Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import BudgetInfo from './budget-info';
import CustomNavLink from '~/components/ui/custom-navlink';
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
  const { t } = useTranslation();
  const isDataLoading = useDelayedQueryParamLoading('budget');
  const loading = useDelayedNavigationLoading('budgets');
  const budgetDialogIsLoading = useDelayedNavigationLoading('dashboard', 'budgets/create');

  return (
    <>
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <h1 className='text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'>
            {t('Budgets.title')}
          </h1>
          <Tooltip
            className='w-[24rem] dark:bg-gray-900'
            content={
              <Legend
                categories={[t('Budgets.legend.green'), t('Budgets.legend.yellow'), t('Budgets.legend.red')]}
                className='light:tooltip-legend-white'
                colors={['emerald', 'yellow', 'red']}
              />
            }
            showArrow={false}>
            <Icon
              icon={RiQuestionLine}
              size='sm'
            />
          </Tooltip>
        </div>

        <CustomNavLink to='budgets/create'>
          <Button
            icon={RiAddLine}
            loading={budgetDialogIsLoading}>
            {t('Budgets.create')}
          </Button>
        </CustomNavLink>
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
                {t('Budgets.noData')}
              </p>
              <p className='text-tremor-default text-tremor-content dark:text-dark-tremor-content'>
                {t('Budgets.noDataSubtext')}
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
