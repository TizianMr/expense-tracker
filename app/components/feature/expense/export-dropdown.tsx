import { Expense } from '@prisma/client';
import { RiFileDownloadLine } from '@remixicon/react';
import { Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown';
import { convertJSONToCSV } from '~/utils/helpers';

// TODO: Toast message when nothing to export
export const ExportDropdown = () => {
  const { t } = useTranslation();

  const handleExportAsJson = async () => {
    const res = await fetch('/api/export');
    const expenses: Expense[] = await res.json();

    const blob = new Blob(
      [
        JSON.stringify(
          expenses.map(expense => ({
            title: expense.title,
            amount: expense.amount,
            date: expense.createdAt,
            category: expense.category,
          })),
          null,
          2,
        ),
      ],
      {
        type: 'application/json',
      },
    );
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'expenses.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAsCsv = async () => {
    const res = await fetch('/api/export');
    const expenses: Expense[] = await res.json();

    const headers = ['title', 'amount', 'date', 'category'];

    const csvData = convertJSONToCSV(
      expenses.map(expense => ({
        title: expense.title,
        amount: expense.amount,
        date: expense.createdAt,
        category: expense.category,
      })),
      headers,
    );

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          icon={RiFileDownloadLine}
          variant='secondary'
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='min-w-40'>
        <DropdownMenuItem
          onSelect={e => {
            e.preventDefault();
            handleExportAsJson();
          }}>
          {t('ExportDropdown.exportAsJson')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={e => {
            e.preventDefault();
            handleExportAsCsv();
          }}>
          {t('ExportDropdown.exportAsCsv')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
