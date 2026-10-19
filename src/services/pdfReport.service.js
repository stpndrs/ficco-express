import PDFDocument from 'pdfkit';

export class PDFReportService {
    static generatePDF(title, companyName, periode, rows, res) {
        const doc = new PDFDocument({ margin: 30 });
        doc.pipe(res);

        // Title
        doc.fontSize(18).fillColor('#1F4E79').text(title.toUpperCase(), { align: 'left' });
        doc.fontSize(10).fillColor('#555555').text(`${companyName} | Periode: ${periode}`);
        doc.moveDown();

        // Table Header
        doc.fontSize(10).fillColor('#1F4E79').text('Keterangan', 30, doc.y, { width: 220 });
        doc.text('Jumlah (Rp)', 250, doc.y - 12, { width: 100, align: 'right' });
        doc.text('Jenis', 360, doc.y - 12, { width: 60 });
        doc.text('Catatan', 430, doc.y - 12, { width: 150 });
        doc.moveDown(0.5);

        doc.moveTo(30, doc.y).lineTo(570, doc.y).stroke('#1F4E79');
        doc.moveDown(0.5);

        // Rows
        rows.forEach((item) => {
            const y = doc.y;
            doc.fontSize(9).fillColor('#000000').text(item.keterangan, 30, y, { width: 220 });
            doc.text(
                item.jumlah < 0 ? `(Rp ${Math.abs(item.jumlah).toLocaleString('id-ID')})` : `Rp ${item.jumlah.toLocaleString('id-ID')}`,
                250,
                y,
                { width: 100, align: 'right' }
            );
            doc.text(item.jenis, 360, y, { width: 60 });
            doc.text(item.catatan || '', 430, y, { width: 150 });
            doc.moveDown(0.5);
        });

        doc.end();
    }
}