import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { formatDate, formatDateTime } from './formatters';

export const exportToExcel = (data, columns, filename = 'export') => {
    const formattedData = data.map(row => {
        const formattedRow = {};
        columns.forEach(column => {
            const value = row[column.field];
            if (column.type === 'date') {
                formattedRow[column.header] = formatDate(value);
            } else if (column.type === 'datetime') {
                formattedRow[column.header] = formatDateTime(value);
            } else {
                formattedRow[column.header] = value;
            }
        });
        return formattedRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}_${formatDate(new Date())}.xlsx`);
};

export const exportToCsv = (data, columns, filename = 'export') => {
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(row => 
        columns.map(col => {
            const value = row[col.field];
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
            }
            return value;
        }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}_${formatDate(new Date())}.csv`);
};