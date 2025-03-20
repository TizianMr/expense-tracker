import { IconButton } from '@chakra-ui/react';
import { Link, useSearchParams } from '@remix-run/react';
import { BsChevronExpand } from 'react-icons/bs';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

import { TableHeader, SortDirection } from '../interfaces/index';

type Props = {
  column: TableHeader;
};

export const ColumnSorter = ({ column }: Props) => {
  const [searchParams] = useSearchParams();

  if (!column.isSortable) {
    return null;
  }

  const sortBy = searchParams.get('sortBy');
  const sorted = sortBy === column.id;
  const sortDirection = searchParams.get('sortDirection') as SortDirection | null;

  const sortingQuery = new URLSearchParams(searchParams);
  sortingQuery.set('sortBy', column.id);
  sortingQuery.set(
    'sortDirection',
    (sortDirection !== SortDirection.ASC ? SortDirection.ASC : SortDirection.DESC).toString(),
  );

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
