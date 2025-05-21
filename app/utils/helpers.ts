import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}

export const getS3ObjectKey = (objUrl: string) => {
  return objUrl.split('/')[objUrl.split('/').length - 1];
};
