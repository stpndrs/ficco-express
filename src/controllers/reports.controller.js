import { ReportsRepository } from '../repositories/reports.repository.js';
import { ExcelReportService } from '../services/excelReport.service.js';
import { PDFReportService } from '../services/pdfReport.service.js';

const reportsRepo = new ReportsRepository();

export const getIncomeStatement = async (req, res) => {
    try {
        const { month, year } = req.query;
        const companyId = req.companyId;

        const report = await reportsRepo.getIncomeStatement(companyId, month, year);
        return res.status(200).json({ status: true, message: 'Laporan Laba Rugi berhasil diambil', data: report });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const exportIncomeStatementExcel = async (req, res) => {
    try {
        const { month, year } = req.query;
        const companyId = req.companyId;

        const report = await reportsRepo.getIncomeStatement(companyId, month, year);
        const workbook = ExcelReportService.createStyledWorkbook(
            'LAPORAN LABA RUGI',
            report.companyName,
            report.periode,
            ['Keterangan', 'Jumlah (Rp)', 'Jenis', 'Catatan'],
            report.data
        );

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Laba_Rugi_${report.periode}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const exportIncomeStatementPDF = async (req, res) => {
    try {
        const { month, year } = req.query;
        const companyId = req.companyId;

        const report = await reportsRepo.getIncomeStatement(companyId, month, year);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Laba_Rugi_${report.periode}.pdf`);

        PDFReportService.generatePDF('Laporan Laba Rugi', report.companyName, report.periode, report.data, res);
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

// --- Inventory Report ---
export const getInventoryReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        const report = await reportsRepo.getInventoryReport(req.companyId, month, year);
        return res.status(200).json({ status: true, message: 'Laporan Persediaan berhasil diambil', data: report });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const exportInventoryExcel = async (req, res) => {
    try {
        const { month, year } = req.query;
        const report = await reportsRepo.getInventoryReport(req.companyId, month, year);
        const workbook = ExcelReportService.createStyledWorkbook(
            'LAPORAN PERSEDIAAN BARANG',
            report.companyName,
            report.periode,
            ['Keterangan', 'Jumlah (Rp)', 'Jenis', 'Catatan'],
            report.data
        );

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Persediaan_${report.periode}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

// --- Cash Flow Report ---
export const getCashFlowReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        const report = await reportsRepo.getCashFlowReport(req.companyId, month, year);
        return res.status(200).json({ status: true, message: 'Laporan Arus Kas berhasil diambil', data: report });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const exportCashFlowExcel = async (req, res) => {
    try {
        const { month, year } = req.query;
        const report = await reportsRepo.getCashFlowReport(req.companyId, month, year);
        const workbook = ExcelReportService.createStyledWorkbook(
            'LAPORAN ARUS KAS',
            report.companyName,
            report.periode,
            ['Keterangan', 'Jumlah (Rp)', 'Jenis', 'Catatan'],
            report.data
        );

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Arus_Kas_${report.periode}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

// --- Balance Sheet Report ---
export const getBalanceSheetReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        const report = await reportsRepo.getBalanceSheetReport(req.companyId, month, year);
        return res.status(200).json({ status: true, message: 'Laporan Neraca berhasil diambil', data: report });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const exportBalanceSheetExcel = async (req, res) => {
    try {
        const { month, year } = req.query;
        const report = await reportsRepo.getBalanceSheetReport(req.companyId, month, year);

        // Flatten Neraca data for Excel
        const rows = [
            ...report.data.aset,
            ...report.data.liabilitas,
            ...report.data.ekuitas,
        ];

        const workbook = ExcelReportService.createStyledWorkbook(
            'LAPORAN POSISI KEUANGAN (NERACA)',
            report.companyName,
            report.periode,
            ['Keterangan', 'Jumlah (Rp)', 'Jenis', 'Catatan'],
            rows
        );

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Neraca_${report.periode}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};