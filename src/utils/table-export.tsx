import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CustomTableColumn } from '@/components/custom/data-table/types';
import { toast } from 'sonner';

/**
 * Helper function to extract text from React elements
 */
const extractTextFromReactElement = (element: any): string => {
  if (element === null || element === undefined) return '';

  // If it's a string or number, return it directly
  if (typeof element === 'string' || typeof element === 'number') {
    return String(element);
  }

  // If it's a boolean, convert to string
  if (typeof element === 'boolean') {
    return element ? 'Oui' : 'Non';
  }

  // If it's an array, process each element
  if (Array.isArray(element)) {
    return element.map(extractTextFromReactElement).join(', ');
  }

  // If it's a React element with props.children
  if (element.props && element.props.children) {
    return extractTextFromReactElement(element.props.children);
  }

  // If it's an object with meaningful properties
  if (typeof element === 'object') {
    if ('name' in element) return String(element.name);
    if ('label' in element) return String(element.label);
    if ('text' in element) return String(element.text);
    if ('value' in element) return String(element.value);
  }

  return '';
};

/**
 * Helper function to get cell value (handles both rendered and non-rendered columns)
 */
const getCellValue = <T extends Record<string, any>>(
  row: T,
  col: CustomTableColumn<T>
): string => {
  // If column has a render function, call it and extract text
  if (col.render) {
    try {
      const rendered = col.render(row[col.data as keyof T], row, () => {});
      return extractTextFromReactElement(rendered);
    } catch (error) {
      // If render fails, fall back to raw value
      console.warn(`Failed to render column ${String(col.data)}:`, error);
    }
  }

  // Get raw value
  const value = row[col.data as keyof T];

  // Handle different value types
  if (value === null || value === undefined) return '';

  // Check for boolean type
  if (value === true || value === false) return value ? 'Oui' : 'Non';

  // Check for primitive types
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  // Handle objects
  if (typeof value === 'object') {
    // Try to extract meaningful value from objects
    if ('name' in value && value.name) return String(value.name);
    if ('label' in value && value.label) return String(value.label);
    if ('text' in value && value.text) return String(value.text);
    if ('value' in value && value.value) return String(value.value);

    // Handle dates - check if it looks like a date string
    const dateValue = value as any;
    if (dateValue && typeof dateValue === 'object' && dateValue.toLocaleDateString) {
      return dateValue.toLocaleDateString('fr-FR');
    }

    // Try to parse as date string
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return new Date(value).toLocaleDateString('fr-FR');
    }

    return JSON.stringify(value);
  }

  return String(value);
};

/**
 * Export table data to PDF
 * @param data - Array of data to export
 * @param columns - Table columns configuration
 * @param filename - Name of the PDF file (without extension)
 */
export const exportToPDF = <T extends Record<string, any>>(
  data: T[],
  columns: CustomTableColumn<T>[],
  filename: string = 'export'
) => {
  // Create a new PDF document
  const doc = new jsPDF();

  // Prepare headers - filter only visible columns
  const headers = columns
    .filter((col) => col.label && col.data !== 'actions') // Exclude actions column
    .map((col) => col.label);

  // Prepare body data
  const body = data.map((row) =>
    columns
      .filter((col) => col.label && col.data !== 'actions')
      .map((col) => getCellValue(row, col))
  );

  // Add title
  doc.setFontSize(16);
  doc.text(`Export - ${filename}`, 14, 15);

  // Add table
  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 25,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 25 },
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
  toast.success(`PDF exporté avec succès: ${filename}.pdf`);
};

/**
 * Export table data to Excel
 * @param data - Array of data to export
 * @param columns - Table columns configuration
 * @param filename - Name of the Excel file (without extension)
 */
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  columns: CustomTableColumn<T>[],
  filename: string = 'export'
) => {
  // Prepare headers
  const headers = columns
    .filter((col) => col.label && col.data !== 'actions')
    .map((col) => col.label);

  // Prepare data rows
  const rows = data.map((row) =>
    columns
      .filter((col) => col.label && col.data !== 'actions')
      .map((col) => getCellValue(row, col))
  );

  // Combine headers and rows
  const worksheetData = [headers, ...rows];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  worksheet['!cols'] = columns
    .filter((col) => col.label && col.data !== 'actions')
    .map((col) => ({
      wch: col.width ? col.width / 10 : 15, // Convert pixels to character width
    }));

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Save the Excel file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
  toast.success(`Excel exporté avec succès: ${filename}.xlsx`);
};



