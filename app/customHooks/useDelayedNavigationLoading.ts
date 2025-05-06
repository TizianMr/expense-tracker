import { useNavigation, useLocation } from '@remix-run/react';
import { useEffect, useState } from 'react';

/**
 * Can be used when navigating between pages.
 * Compares the source pathname with the target pathname. If the navigation state is loading and the pathnames are different for more than delayInMs the hook returns true.
 * @param sourcePathnameKeyword - keyword to look out for in the source pathname. Used to identify when this hook is active.
 * @param targetPathnameKeyword - [OPTIONAL] keyword to look out for in the target pathname. Used to identify when this hook is active.
 * @param delayInMs - [OPTIONAL] delay in milliseconds to set the loading state to true, default is 250ms
 * @returns boolean indicating if the loading state is longer than the delay
 */
export function useDelayedNavigationLoading(
  sourcePathnameKeyword: string,
  targetPathnameKeyword?: string,
  delayInMs: number = 250,
) {
  const navigation = useNavigation();
  const location = useLocation();
  const [isLoadingLongerThanDelay, setIsLoadingLongerThanDeplay] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (navigation.state !== 'loading') {
      if (timer) {
        clearTimeout(timer);
      }
      setIsLoadingLongerThanDeplay(false);
      return;
    }

    const isLoading =
      navigation.state === 'loading' &&
      navigation.location?.pathname !== location.pathname &&
      location.pathname.includes(sourcePathnameKeyword) &&
      (!targetPathnameKeyword || navigation.location?.pathname.includes(targetPathnameKeyword));

    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoadingLongerThanDeplay(true);
      }, delayInMs);
    }

    return () => clearTimeout(timer);
  }, [
    delayInMs,
    sourcePathnameKeyword,
    location.pathname,
    navigation.location?.pathname,
    navigation.state,
    targetPathnameKeyword,
  ]);

  return isLoadingLongerThanDelay;
}
