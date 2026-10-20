import { DashboardRepository } from '../repositories/dashboard.repository.js';

const dashboardRepo = new DashboardRepository();

export const aiFinanceCopilot = async (req, res) => {
    try {
        const { question } = req.body;
        const fin = await dashboardRepo.getFinancialContext(req.companyId);

        const answer = `Berdasarkan data keuangan riil 30 hari terakhir:\n` +
            `- Omzet: Rp ${fin.omzet.toLocaleString('id-ID')}\n` +
            `- Cash Burn: Rp ${fin.cashBurn.toLocaleString('id-ID')}\n` +
            `- Estimasi Laba: Rp ${fin.estimasiLaba.toLocaleString('id-ID')} (Margin: ${fin.rasioMargin}%).\n\n` +
            `Saran: Tingkatkan efisiensi persediaan untuk mempertahankan arus kas positif.`;

        return res.status(200).json({
            status: true,
            data: {
                question,
                answer,
                dataSourceCitation: 'Tabel Sales, Operationals, dan PurchasingDetails',
                financialMetrics: fin
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getStockForecasting = async (req, res) => {
    try {
        const { type, categoryId } = req.query;
        const data = await dashboardRepo.getStockForecasting(req.companyId, type, categoryId);
        return res.status(200).json({ status: true, data });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const simulateCostAndMargin = async (req, res) => {
    try {
        const { materialId, priceIncreasePercentage, productPriceAdjustmentPercentage } = req.body;
        const data = await dashboardRepo.simulateCostAndMargin(
            req.companyId, materialId, priceIncreasePercentage, productPriceAdjustmentPercentage
        );
        return res.status(200).json({ status: true, data });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getProductionWasteAnalysis = async (req, res) => {
    try {
        const { month } = req.query;
        const data = await dashboardRepo.getProductionWasteAnalysis(req.companyId, month);
        return res.status(200).json({ status: true, data });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getProductTrendAndBasket = async (req, res) => {
    try {
        const data = await dashboardRepo.getProductTrendAndBasket(req.companyId);
        return res.status(200).json({ status: true, data });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};