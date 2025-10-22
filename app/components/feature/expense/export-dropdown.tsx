import { RiFileDownloadLine } from '@remixicon/react';
import { Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown';
import { useExportData } from '~/customHooks/useExportData';

// TODO: Toast message when nothing to export
export const ExportDropdown = () => {
  const { t } = useTranslation();
  const { handleExportAsCsv, handleExportAsJson, handleExportAsXlsx } = useExportData();

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
