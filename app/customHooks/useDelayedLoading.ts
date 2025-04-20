import { useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';

export const useDelayedLoading = (delayInMs: number = 250) => {
  const { state } = useNavigation();
  const [isLoadingLongerThanDelay, setIsLoadingLongerThanDeplay] = useState(false);

  // set loading to true if the data is loading for more than sepcified delayInMs
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (state === 'loading') {
      timer = setTimeout(() => {
        setIsLoadingLongerThanDeplay(true);
      }, delayInMs);
    } else {
      if (timer) {
        clearTimeout(timer);
      }
      setIsLoadingLongerThanDeplay(false);
    }

    return () => clearTimeout(timer);
  }, [delayInMs, state]);

  return {
    isLoadingLongerThanDelay,
  };
};
