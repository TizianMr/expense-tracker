import { t } from 'i18next';
import { utils, write } from 'xlsx';

import { ExpenseWithBudget } from '~/db/expense.server';
import { DATE_OPTIONS, EXPENSE_CATEGORIES } from '~/utils/constants';
import { convertJSONToCSV, downloadFile, formatCurrency } from '~/utils/helpers';

export const useExportData = () => {
  const getExpenses = async (): Promise<ExpenseWithBudget[]> => {
    const res = await fetch('/api/export');
    const expenses: ExpenseWithBudget[] = await res.json();
    return expenses;
  };

  const handleExportAsJson = async () => {
    const expenses = await getExpenses();

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

    downloadFile(blob, 'expenses.json');
  };

  const handleExportAsCsv = async () => {
    const expenses = await getExpenses();

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
    downloadFile(blob, 'expenses.csv');
  };

  const handleExportAsXlsx = async () => {
    const expenses = await getExpenses();

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

    downloadFile(blob, 'expenses.xlsx');
  };

  return { handleExportAsJson, handleExportAsCsv, handleExportAsXlsx };
};
