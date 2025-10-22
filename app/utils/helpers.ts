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

export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
