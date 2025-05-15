import { useLocation, useNavigate } from '@remix-run/react';

export const useDelayedNavigation = (delayInMs: number = 200) => {
  const navigate = useNavigate();
  const location = useLocation();

  const triggerDelayedNavigation = (to: string) => {
    setTimeout(() => {
      navigate({ pathname: to, search: location.search }, { preventScrollReset: true });
    }, delayInMs);
  };

  return {
    triggerDelayedNavigation,
  };
};
