import { RiFileDownloadLine } from '@remixicon/react';
import { Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';
import { utils, write } from 'xlsx';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown';
import { ExpenseWithBudget } from '~/db/expense.server';
import { DATE_OPTIONS, EXPENSE_CATEGORIES } from '~/utils/constants';
import { convertJSONToCSV, formatCurrency } from '~/utils/helpers';

// TODO: Toast message when nothing to export
export const ExportDropdown = () => {
  const { t } = useTranslation();

  const handleExportAsJson = async () => {
    const res = await fetch('/api/export');
    const expenses: ExpenseWithBudget[] = await res.json();

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
    const expenses: ExpenseWithBudget[] = await res.json();

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

  const handleExportAsXlsx = async () => {
    const res = await fetch('/api/export');
    const expenses: ExpenseWithBudget[] = await res.json();

    const data = [
      [
        t('ExpenseTable.headers.title'),
        t('ExpenseTable.headers.amount'),
        t('ExpenseTable.headers.date'),
        t('ExpenseTable.headers.category'),
        t('ExpenseTable.headers.budget'),
      ],
      ...expenses.map(exp => [
        exp.title,
        formatCurrency(exp.amount),
        new Date(exp.expenseDate).toLocaleDateString('en-US', DATE_OPTIONS),
        t(`${EXPENSE_CATEGORIES.find(cat => cat.value === exp.category)?.labelKey}`, { defaultValue: '-' }),
        exp.budget?.title ?? '-',
      ]),
    ];

    const worksheet = utils.aoa_to_sheet(data);

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Expenses');
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'expenses.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        <DropdownMenuItem
          onSelect={e => {
            e.preventDefault();
            handleExportAsXlsx();
          }}>
          {t('ExportDropdown.exportAsXlsx')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
