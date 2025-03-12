import { saveAs } from 'file-saver';
import { formatDate, formatNumber } from './formatters';

export const exportToExcel = async (data) => {
    const XLSX = await import('xlsx');
    
    const worksheet = XLSX.utils.json_to_sheet(data.map(entry => ({
        'Date': formatDate(entry.entry_date),
        'Company': entry.company,
        'Brand': entry.brand,
        'Publication': entry.publication,
        'Title': entry.title,
        'Media Type': entry.media_type,
        'Sentiment': entry.sentiment,
        'Circulation': formatNumber(entry.circulation),
        'Audience Reach': formatNumber(entry.audience_reach),
        'Media Value': formatNumber(entry.advert_spend)
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Media Entries');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `media_entries_${formatDate(new Date())}.xlsx`);
};