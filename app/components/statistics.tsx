import { useSearchParams } from '@remix-run/react';
import { BarChart, DonutChart, List, ListItem, Tab, TabGroup, TabList } from '@tremor/react';
import qs from 'qs';

import { QueryParams, StatisticPeriod } from '~/interfaces';
import { cx, formatCurrency } from '~/utils/helpers';

const chartdata = [
  { name: 'Monday', Amount: 2488 },
  { name: 'Tuesday', Amount: 1445 },
  { name: 'Wednesday', Amount: 743 },
  { name: 'Thursday', Amount: 281 },
  { name: 'Friday', Amount: 251 },
  { name: 'Saturday', Amount: 232 },
  { name: 'Sunday', Amount: 98 },
];

const data = [
  { name: 'Food', amount: 6730, share: '32.1%', color: 'bg-cyan-500' },
  { name: 'Transport', amount: 4120, share: '19.6%', color: 'bg-blue-500' },
  { name: 'Shopping', amount: 3920, share: '18.6%', color: 'bg-indigo-500' },
  { name: 'Other', amount: 3210, share: '15.3%', color: 'bg-violet-500' },
];

const valueFormatter = (number: number) => formatCurrency(number);

const Statistics = () => {
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
          categories={['Amount']}
          className='h-[90%]'
          colors={['blue']}
          data={chartdata}
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
            data={data}
            index='name'
            valueFormatter={valueFormatter}
          />
          <p className='mt-8 flex items-center justify-between text-tremor-label text-tremor-content dark:text-dark-tremor-content'>
            <span>Category</span> <span>Amount / Share</span>
          </p>
          <List className='mt-2'>
            {data.map(item => (
              <ListItem
                className='space-x-6'
                key={item.name}>
                <div className='flex items-center space-x-2.5 truncate'>
                  <span
                    aria-hidden={true}
                    className={cx(item.color, 'size-2.5 shrink-0 rounded-sm')}
                  />
                  <span className='truncate dark:text-dark-tremor-content-emphasis'> {item.name} </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='font-medium tabular-nums text-tremor-content-strong dark:text-dark-tremor-content-strong'>
                    {valueFormatter(item.amount)}
                  </span>
                  <span className='rounded-tremor-small bg-tremor-background-subtle px-1.5 py-0.5 text-tremor-label font-medium tabular-nums text-tremor-content-emphasis dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content-emphasis'>
                    {item.share}
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
