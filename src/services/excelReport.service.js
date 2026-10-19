import ExcelJS from 'exceljs';

export class ExcelReportService {
    static createStyledWorkbook(title, companyName, periode, headers, rows) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(title);

        // Title Section
        worksheet.mergeCells('A1:D1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = title.toUpperCase();
        titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } }; // Dark Navy Blue
        titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

        worksheet.getCell('A2').value = `${companyName} | Periode: ${periode}`;
        worksheet.getCell('A2').font = { name: 'Arial', size: 10, italic: true };

        // Header Table
        const headerRow = worksheet.addRow(headers);
        headerRow.height = 25;
        headerRow.eachCell((cell) => {
            cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });

        // Content Rows
        rows.forEach((rowData) => {
            const row = worksheet.addRow([
                rowData.keterangan,
                rowData.jumlah,
                rowData.jenis,
                rowData.catatan,
            ]);

            const isHighlight = ['LABA BERSIH', 'HARGA POKOK BARANG TERJUAL', 'SALDO KAS AKHIR', 'TOTAL ASET', 'SELISIH (harus nol)'].includes(
                rowData.keterangan.toUpperCase()
            );

            row.eachCell((cell, colNumber) => {
                cell.font = { name: 'Arial', size: 10, bold: isHighlight || rowData.jenis === 'Rumus' };

                if (colNumber === 2 && typeof cell.value === 'number') {
                    cell.numFmt = '"Rp "#,##0;("Rp "#,##0);"-"';
                    cell.alignment = { horizontal: 'right' };
                }

                if (isHighlight) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }; // Soft Green Highlight
                    if (colNumber === 2) {
                        cell.font = { color: { argb: 'FF385723' }, bold: true };
                    }
                }
            });
        });

        // Adjust Column Widths
        worksheet.columns = [
            { width: 35 },
            { width: 20 },
            { width: 12 },
            { width: 45 },
        ];

        return workbook;
    }
}