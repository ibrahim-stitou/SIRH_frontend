import {
  CustomTableBulkAction,
  CustomTableColumn
} from '@/components/custom/data-table/types';
import { exportToPDF, exportToExcel } from '@/utils/table-export';
import { FileText, FileSpreadsheet } from 'lucide-react';

/**
 * Create PDF export bulk action
 * @param columns - Table columns configuration
 * @param allData - All table data (for exporting all records)
 * @param filename - Name of the exported file
 */
export const createExportPDFAction = <T extends Record<string, any>>(
  columns: CustomTableColumn<T>[],
  allData: T[],
  filename: string = 'export'
): CustomTableBulkAction<T> => ({
  label: 'Export PDF',
  icon: <FileText className='h-4 w-4' />,
  className: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200',
  action: (_selected: T[], _refresh: () => void) => {
    // Export all data from the table (visible in current state)
    exportToPDF(allData, columns, filename);
  },
  disabled: (_selected: T[]) => false // Always enabled
});

/**
 * Create Excel export bulk action
 * @param columns - Table columns configuration
 * @param allData - All table data (for exporting all records)
 * @param filename - Name of the exported file
 */
export const createExportExcelAction = <T extends Record<string, any>>(
  columns: CustomTableColumn<T>[],
  allData: T[],
  filename: string = 'export'
): CustomTableBulkAction<T> => ({
  label: 'Export Excel',
  icon: <FileSpreadsheet className='h-4 w-4' />,
  className: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
  action: (_selected: T[], _refresh: () => void) => {
    // Export all data from the table (visible in current state)
    exportToExcel(allData, columns, filename);
  },
  disabled: (_selected: T[]) => false // Always enabled
});
