import { useNavigate } from '@remix-run/react';

export const useDelayedNavigation = (to: string, delayInMs: number = 200) => {
  const navigate = useNavigate();
  const triggerDelayedNavigation = () => {
    setTimeout(() => {
      navigate(to);
    }, delayInMs); // delay navigation to allow dialog to close with animation
  };

  return {
    triggerDelayedNavigation,
  };
};
