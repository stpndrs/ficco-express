import { DashboardRepository } from '../repositories/dashboard.repository.js';

const dashboardRepo = new DashboardRepository();

// 1. AI Finance Copilot Chat API
export const aiFinanceCopilot = async (req, res) => {
    try {
        const { question } = req.body;
        const companyId = req.companyId;

        const fin = await dashboardRepo.getFinancialContext(companyId);

        // AI Engine / Rule-based Prompting tanpa halusinasi
        let aiResponse = `Berdasarkan data keuangan riil 30 hari terakhir:\n` +
            `- Omzet: Rp ${fin.omzet.toLocaleString('id-ID')}\n` +
            `- Biaya Operasional (Cash Burn): Rp ${fin.cashBurn.toLocaleString('id-ID')}\n` +
            `- Total Pembelian Bahan: Rp ${fin.totalPembelian.toLocaleString('id-ID')}\n` +
            `- Estimasi Laba Bersih: Rp ${fin.estimasiLaba.toLocaleString('id-ID')} (Margin: ${fin.rasioMargin}%).\n\n`;

        if (question.toLowerCase().includes('laba') || question.toLowerCase().includes('omzet')) {
            aiResponse += `Saran Bisnis: Performa penjualan Anda menunjukkan omzet Rp ${fin.omzet.toLocaleString('id-ID')}. Untuk meningkatkan margin, pertimbangkan efisiensi biaya operasional.`;
        } else if (question.toLowerCase().includes('cash burn') || question.toLowerCase().includes('biaya')) {
            aiResponse += `Saran Bisnis: Cash burn bulan ini sebesar Rp ${fin.cashBurn.toLocaleString('id-ID')}. Disarankan membatasi pengeluaran operasional yang belum mendesak.`;
        } else {
            aiResponse += `Saran Bisnis: Pertahankan arus kas positif dan pantau perputaran stok secara berkala.`;
        }

        return res.status(200).json({
            status: true,
            message: 'AI Copilot response generated',
            data: {
                question,
                answer: aiResponse,
                dataSourceCitation: 'Tabel Sales, Operationals, dan PurchasingDetails',
                financialMetrics: fin,
            },
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

// 2. Smart Stock Forecasting
export const getStockForecasting = async (req, res) => {
    try {
        const { type, categoryId } = req.query;
        const data = await dashboardRepo.getStockForecasting(req.companyId, type, categoryId);

        return res.status(200).json({
            status: true,
            message: 'Stock forecasting fetched successfully',
            data,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

// 3. Cost & Margin Simulator
export const simulateCostAndMargin = async (req, res) => {
    try {
        const { materialId, priceIncreasePercentage, productPriceAdjustmentPercentage } = req.body;
        const simulation = await dashboardRepo.simulateCostAndMargin(
            req.companyId,
            materialId,
            priceIncreasePercentage,
            productPriceAdjustmentPercentage
        );

        if (!simulation) {
            return res.status(404).json({ status: false, message: 'Material tidak ditemukan' });
        }

        return res.status(200).json({
            status: true,
            message: 'Cost & margin simulation completed',
            data: simulation,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

// 4. Production & Waste Analysis
export const getProductionWasteAnalysis = async (req, res) => {
    try {
        const data = await dashboardRepo.getProductionWasteAnalysis(req.companyId);

        return res.status(200).json({
            status: true,
            message: 'Production waste analysis fetched successfully',
            data,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

// 5. Product Trend & Basket Analysis
export const getProductTrendAndBasket = async (req, res) => {
    try {
        const data = await dashboardRepo.getProductTrendAndBasket(req.companyId);

        return res.status(200).json({
            status: true,
            message: 'Product trend and basket analysis fetched successfully',
            data,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};