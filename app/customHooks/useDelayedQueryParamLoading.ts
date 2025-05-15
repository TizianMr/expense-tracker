import { useNavigation, useSearchParams } from '@remix-run/react';
import qs from 'qs';
import { useEffect, useState } from 'react';

import { QueryParams } from '~/interfaces';

/**
 * compares the current search params with the search params that are being loaded and returns true if they are different for more than delayInMs
 * @param key - key of the search param object to compare
 * @param delayInMs - [OPTIONAL] delay in milliseconds to set the loading state to true, default is 250ms
 * @returns boolean indicating if the loading state is longer than the delay
 */
export const useDelayedQueryParamLoading = (key: keyof QueryParams, delayInMs: number = 250) => {
  const navigation = useNavigation();
  const [currentParams] = useSearchParams();
  const [isLoadingLongerThanDelay, setIsLoadingLongerThanDeplay] = useState(false);

  // set loading to true if the data is loading for more than sepcified delayInMs
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (navigation.state !== 'loading' || !navigation.location?.search) {
      if (timer) {
        clearTimeout(timer);
      }
      setIsLoadingLongerThanDeplay(false);
      return;
    }

    const desiredSearchParams = qs.parse(navigation.location.search.toString().substring(1)) as QueryParams;
    const currentSearchParams = qs.parse(currentParams.toString()) as QueryParams;

    if (JSON.stringify(desiredSearchParams[key]) !== JSON.stringify(currentSearchParams[key])) {
      timer = setTimeout(() => {
        setIsLoadingLongerThanDeplay(true);
      }, delayInMs);
    }

    return () => clearTimeout(timer);
  }, [currentParams, delayInMs, key, navigation.location?.search, navigation.state]);

  return isLoadingLongerThanDelay;
};
