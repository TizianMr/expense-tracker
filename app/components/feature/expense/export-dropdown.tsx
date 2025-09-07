import { Expense } from '@prisma/client';
import { RiFileDownloadLine } from '@remixicon/react';
import { Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown';

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

  return (
    <>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
