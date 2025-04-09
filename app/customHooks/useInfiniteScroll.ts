import { ListCollection, createListCollection } from '@chakra-ui/react';
import { useFetcher, useLocation } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { ListResult } from '~/interfaces';

const SCROLL_TRESHOLD = 80; // px

export const useInfiniteScroll = <T>(
  initialCollection: ListCollection<{
    label: string;
    value: string;
  }>,
  ref: React.RefObject<HTMLDivElement>,
  labelKey: keyof T,
  valueKey: keyof T,
) => {
  const [collection, setCollection] = useState<ListCollection<{ label: string; value: string }>>(initialCollection);
  const [page, setPage] = useState(2);
  const [shouldFetch, setShouldFetch] = useState(true);
  const location = useLocation();
  const fetcher = useFetcher<ListResult<T>>();

  const scrolledToLastPage = fetcher.data && page > Math.ceil(fetcher.data.totalItems / fetcher.data.pageSize);

  // add scroll listeners
  useEffect(() => {
    let refElement: HTMLDivElement | null = null;
    if (ref.current) {
      refElement = ref.current;
    }

    const scrollListener = () => {
      if (!refElement) return;
      // Check if the user scrolled to the bottom of the select content
      setShouldFetch(refElement.scrollHeight - refElement.scrollTop - SCROLL_TRESHOLD < refElement.clientHeight);
    };

    if (refElement) {
      refElement.addEventListener('scroll', scrollListener);
    }

    // Clean up
    return () => {
      if (refElement) {
        refElement.removeEventListener('scroll', scrollListener);
      }
    };
  }, [ref, shouldFetch]);

  useEffect(() => {
    if (!shouldFetch) return;

    if (fetcher.state === 'loading' || scrolledToLastPage) {
      setShouldFetch(false);
      return;
    }

    fetcher.load(`${location.pathname}?page=${page}`);

    setShouldFetch(false);
  }, [fetcher, location.pathname, page, scrolledToLastPage, shouldFetch]);

  useEffect(() => {
    if (scrolledToLastPage) {
      setShouldFetch(false);
      return;
    }

    if (fetcher.data && fetcher.data.items) {
      setCollection(prevCollection =>
        createListCollection({
          items: [
            ...prevCollection.items,
            ...(fetcher.data?.items.map(item => ({ label: String(item[labelKey]), value: String(item[valueKey]) })) ??
              []),
          ],
        }),
      );
      setPage(prevPage => prevPage + 1);
    }
  }, [fetcher.data, scrolledToLastPage, labelKey, valueKey]);

  return collection;
};
