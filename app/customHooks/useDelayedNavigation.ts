import { useNavigate, useSearchParams } from '@remix-run/react';
import qs from 'qs';

import { QueryParams } from '~/interfaces';

type Options = {
  delayInMs?: number;
  searchParams?: {
    clear: boolean;
    keys?: (keyof QueryParams)[];
  };
};

/**
 * Navigate to a new route after a specified delay.
 *
 * @param options - Optional configuration object.
 * @param options.delayInMs - The delay in milliseconds before navigation occurs. Defaults to 200ms.
 * @param options.searchParams - Optional search parameter handling.
 * @param options.searchParams.clear - If specified as `true`, clear search params on navigate.
 * @param options.searchParams.keys - Optional parameter to define search parameter sections that should be cleared on navigate. If not specified all search params are cleared.
 * @returns `triggerDelayedNavigation` function.
 *
 * @example
 * const { triggerDelayedNavigation } = useDelayedNavigation({ delayInMs: 500 });
 * triggerDelayedNavigation('/dashboard');
 */
export const useDelayedNavigation = (options?: Options) => {
  const { delayInMs = 200, searchParams: searchParamsOpt } = options || {};
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nestedParams = qs.parse(searchParams.toString()) as QueryParams;

  if (searchParamsOpt && searchParamsOpt.clear) {
    if (searchParamsOpt.keys && searchParamsOpt.keys.length > 0) {
      searchParamsOpt.keys.forEach(key => {
        delete nestedParams[key];
      });
    } else {
      Object.keys(nestedParams).forEach(key => {
        delete nestedParams[key as keyof QueryParams];
      });
    }
  }

  const triggerDelayedNavigation = (to: string) => {
    setTimeout(() => {
      navigate({ pathname: to, search: qs.stringify(nestedParams) }, { preventScrollReset: true });
    }, delayInMs);
  };

  return {
    triggerDelayedNavigation,
  };
};
