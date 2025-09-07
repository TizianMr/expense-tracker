import { RiFileDownloadLine } from '@remixicon/react';
import { Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown';

export const ExportDropdown = () => {
  const { t } = useTranslation();

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
        <DropdownMenuItem>{t('ExportDropdown.exportAsJson')}</DropdownMenuItem>
        <DropdownMenuItem>{t('ExportDropdown.exportAsXlsx')}</DropdownMenuItem>
        <DropdownMenuItem>{t('ExportDropdown.exportAsCsv')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
