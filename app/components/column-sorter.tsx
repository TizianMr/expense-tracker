import { IconButton } from '@chakra-ui/react';
import { Link, useSearchParams } from '@remix-run/react';
import { BsChevronExpand } from 'react-icons/bs';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

import { ITableHeader, SortDirection } from '../interfaces/index';

type Props = {
  column: ITableHeader;
};

export const ColumnSorter = ({ column }: Props) => {
  const [searchParams] = useSearchParams();

  const sortBy = searchParams.get('sortBy');
  const sorted = sortBy === column.title.toLowerCase();
  const sortDirection = searchParams.get('sortDirection') as SortDirection | null;

  const sortingQuery = new URLSearchParams(searchParams);
  sortingQuery.set('sortBy', column.title.toLowerCase());
  sortingQuery.set(
    'sortDirection',
    (sortDirection !== SortDirection.ASC ? SortDirection.ASC : SortDirection.DESC).toString(),
  );

  if (!column.isSortable) {
    return null;
  }

  return (
    <Link to={`?${sortingQuery.toString()}`}>
      <IconButton
        aria-label='Sort'
        rounded='full'
        size='xs'
        variant='ghost'
        color={sorted ? 'primary' : 'gray'}>
        <ColumnSorterIcon
          sorted={sorted}
          sortDirection={sortDirection}
        />
      </IconButton>
    </Link>
  );
};

const ColumnSorterIcon = ({ sortDirection, sorted }: { sortDirection: SortDirection | null; sorted: boolean }) => {
  if (!sorted) return <BsChevronExpand />;
  if (sortDirection === SortDirection.ASC) return <HiChevronDown />;
  if (sortDirection === SortDirection.DESC) return <HiChevronUp />;
  return <BsChevronExpand />;
};
