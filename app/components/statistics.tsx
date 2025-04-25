import { useSearchParams } from '@remix-run/react';
import { BarChart, DonutChart, List, ListItem, Tab, TabGroup, TabList } from '@tremor/react';
import qs from 'qs';

import { Statistics as StatisticsType } from '~/db/statistics.server';
import { QueryParams, StatisticPeriod } from '~/interfaces';
import { cx, formatCurrency } from '~/utils/helpers';

const valueFormatter = (number: number) => formatCurrency(number);

type Props = {
  statistics: StatisticsType;
};

const Statistics = ({ statistics }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleTabChange = (idx: number) => {
    const nestedParams = qs.parse(searchParams.toString()) as QueryParams;
    const tabValues = [StatisticPeriod.WEEK, StatisticPeriod.MONTH, StatisticPeriod.YEAR];
    const updated = {
      ...nestedParams,
      statistics: tabValues[idx],
    };

    setSearchParams(qs.stringify(updated), { preventScrollReset: true });
  };

  return (
    <>
      <div className='flex items-center justify-between pb-6'>
        <h1 className='text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'>
          Statistics
        </h1>
        <TabGroup
          className='flex justify-end'
          onIndexChange={handleTabChange}>
          <TabList variant='solid'>
            <Tab>Week</Tab>
            <Tab>Month</Tab>
            <Tab>Year</Tab>
          </TabList>
        </TabGroup>
      </div>

      <div className='flex space-x-20 w-full h-full items-center'>
        <BarChart
          showAnimation
          categories={['amount']}
          className='h-[90%]'
          colors={['blue']}
          data={statistics.expensesByPeriod}
          index='name'
          noDataText='No expenses to show'
          showLegend={false}
          valueFormatter={valueFormatter}
          yAxisWidth={48}
        />
        <div className='flex flex-col w-[40%] self-center'>
          <DonutChart
            category='amount'
            colors={['cyan', 'blue', 'indigo', 'violet']}
            data={statistics.expensesByCategory.categories}
            index='category'
            valueFormatter={valueFormatter}
          />
          <p className='mt-8 flex items-center justify-between text-tremor-label text-tremor-content dark:text-dark-tremor-content'>
            <span>Category</span> <span>Amount / Share</span>
          </p>
          <List className='mt-2'>
            {statistics.expensesByCategory.categories.map(item => (
              <ListItem
                className='space-x-6'
                key={item.category}>
                <div className='flex items-center space-x-2.5 truncate'>
                  <span
                    aria-hidden={true}
                    className={cx('bg-orange-500', 'size-2.5 shrink-0 rounded-sm')}
                  />
                  <span className='truncate dark:text-dark-tremor-content-emphasis'> {item.category} </span>
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
    </>
  );
};

export default Statistics;
