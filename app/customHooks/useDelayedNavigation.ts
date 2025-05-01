import { useNavigate } from '@remix-run/react';

export const useDelayedNavigation = (delayInMs: number = 200) => {
  const navigate = useNavigate();
  const triggerDelayedNavigation = (to: string) => {
    setTimeout(() => {
      navigate(to, { preventScrollReset: true });
    }, delayInMs); // delay navigation to allow dialog to close with animation
  };

  return {
    triggerDelayedNavigation,
  };
};
