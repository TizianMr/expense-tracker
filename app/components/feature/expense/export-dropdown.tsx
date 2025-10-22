import { RiFileDownloadLine } from '@remixicon/react';
import { Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown';
import { useExportData } from '~/customHooks/useExportData';

type Props = {
  isDisabled: boolean;
};

export const ExportDropdown = ({ isDisabled }: Props) => {
  const { t } = useTranslation();
  const { handleExportAsCsv, handleExportAsJson, handleExportAsXlsx } = useExportData();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        disabled={isDisabled}>
        <Button
          icon={RiFileDownloadLine}
          {...(isDisabled && { tooltip: t('ExportDropdown.noData') })}
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
