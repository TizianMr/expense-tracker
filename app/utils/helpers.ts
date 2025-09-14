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

// https://dev.to/cybercop/converting-json-to-csv-in-react-a-diy-approach-59lk
export const convertJSONToCSV = (jsonData: Record<string, unknown>[], columnHeaders: string[]): string => {
  const headers = columnHeaders.join(',') + '\n';

  const rows = jsonData
    .map(row => {
      return columnHeaders.map(field => row[field] || '').join(',');
    })
    .join('\n');

  return headers + rows;
};
