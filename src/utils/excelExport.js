import * as XLSX from 'xlsx';
import { logger } from './logger';

export const exportToExcel = (data, fileName) => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-size columns loosely based on Arabic character widths
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(
        key.length + 5,
        ...data.map(row => String(row[key] || '').length + 5)
      )
    }));
    ws['!cols'] = colWidths;

    // Right to Left direction
    if (!ws['!views']) ws['!views'] = [];
    ws['!views'].push({ rightToLeft: true });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "البيانات");

    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } catch (error) {
    logger.error('Error exporting to Excel:', error);
    throw error;
  }
};
