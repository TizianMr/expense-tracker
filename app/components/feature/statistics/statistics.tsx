import { useSearchParams } from '@remix-run/react';
import { BarChart, DonutChart, List, ListItem, Tab, TabGroup, TabList } from '@tremor/react';
import { getISOWeek, startOfMonth } from 'date-fns';
import qs from 'qs';
import { useTranslation } from 'react-i18next';

import LoadingSpinner from '~/components/ui/loading-spinner';
import { useDelayedQueryParamLoading } from '~/customHooks/useDelayedQueryParamLoading';
import { Statistics as StatisticsType } from '~/db/statistics.server';
import { QueryParams, StatisticPeriod } from '~/interfaces';
import { EXPENSE_CATEGORIES } from '~/utils/constants';
import { cx, formatCurrency } from '~/utils/helpers';

const valueFormatter = (number: number) => formatCurrency(number);

type Props = {
  statistics: StatisticsType;
};

const Statistics = ({ statistics }: Props) => {
  const { t } = useTranslation();
  const dataIsLoading = useDelayedQueryParamLoading('statistics');
  const [searchParams, setSearchParams] = useSearchParams();
  const nestedParams = qs.parse(searchParams.toString()) as QueryParams;

  const categoryColors = statistics.expensesByCategory.categories.map(expense => {
    const category = EXPENSE_CATEGORIES.find(cat => cat.value === expense.category);
    return category ? category.color : 'gray';
  });

  const expensesWithTranslatedPeriod = statistics.expensesByPeriod.map((amount, idx) => ({
    name:
      statistics.period === StatisticPeriod.MONTH
        ? t(`Statistics.barchart.month`, { weeknumber: idx + getISOWeek(startOfMonth(Date.now())) })
        : t(`Statistics.barchart.${statistics.period}.${idx}`),
    amount,
  }));

  const handleTabChange = (idx: number) => {
    const nestedParams = qs.parse(searchParams.toString()) as QueryParams;
    const tabValues = Object.values(StatisticPeriod);

    const updated = {
      ...nestedParams,
      statistics: tabValues[idx],
    };

    setSearchParams(qs.stringify(updated), { preventScrollReset: true });
  };

  return (
    <>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'>
          {t('Statistics.title')}
        </h1>
        <TabGroup
          className='flex justify-end'
          defaultIndex={Object.values(StatisticPeriod).findIndex(period => period === nestedParams.statistics)}
          onIndexChange={handleTabChange}>
          <TabList variant='solid'>
            {Object.values(StatisticPeriod).map(period => (
              <Tab
                key={period}
                value={period}>
                {t(`Statistics.timePeriod.${period}`)}
              </Tab>
            ))}
          </TabList>
        </TabGroup>
      </div>

      {dataIsLoading ? (
        <div className='h-full flex justify-center items-center'>
          <LoadingSpinner />
        </div>
      ) : (
        <div className='flex lg:flex-row flex-col lg:space-x-20 lg:space-y-0 space-y-10 lg:pt-0 pt-4 w-full h-full items-center'>
          <BarChart
            showAnimation
            categories={['amount']}
            className='lg:h-[90%]'
            colors={['emerald']}
            data={expensesWithTranslatedPeriod}
            index='name'
            noDataText={t('Statistics.noData')}
            showLegend={false}
            valueFormatter={valueFormatter}
            yAxisWidth={75}
          />
          <div className='flex flex-col md:w-[40%] self-center'>
            <DonutChart
              category='amount'
              colors={categoryColors}
              data={statistics.expensesByCategory.categories}
              index='category'
              valueFormatter={valueFormatter}
            />
            <p className='mt-8 flex items-center justify-between text-tremor-label text-tremor-content dark:text-dark-tremor-content'>
              <span>{t('Statistics.category')}</span> <span>{t('Statistics.amountAndShare')}</span>
            </p>
            <List className='mt-2'>
              {statistics.expensesByCategory.categories.map((item, idx) => (
                <ListItem
                  className='space-x-6'
                  key={item.category}>
                  <div className='flex items-center space-x-2.5 truncate'>
                    <span
                      aria-hidden={true}
                      className={cx(`bg-${categoryColors[idx]}-500`, 'size-2.5 shrink-0 rounded-sm')}
                    />
                    <span className='truncate dark:text-dark-tremor-content-emphasis'>
                      {t(`common.categories.${item.category.toLowerCase()}`)}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='font-medium tabular-nums text-tremor-content-strong dark:text-dark-tremor-content-strong'>
                      {valueFormatter(item.amount)}
                    </span>
                    <span className='rounded-tremor-small bg-tremor-background-subtle px-1.5 py-0.5 text-tremor-label font-medium tabular-nums text-tremor-content-emphasis dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content-emphasis'>
                      {item.share}%
                    </span>
                  </div>
                </ListItem>
              ))}
            </List>
          </div>
        </div>
      )}
    </>
  );
};

export default Statistics;
