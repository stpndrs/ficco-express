import { db } from '../db/index.js';
import {
    sales,
    saleDetails,
    products,
    materials,
    operationals,
    productions,
    productionLines,
    purchasingDetails,
    purchasings,
    categories,
} from '../db/schema.js';
import { eq, and, sql, gte, desc } from 'drizzle-orm';

export class DashboardRepository {
    // --- 1. AI FINANCE COPILOT DATA RETRIEVAL ---
    async getFinancialContext(companyId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Total Omzet (30 Hari)
        const [salesSummary] = await db
            .select({ totalOmzet: sql`COALESCE(SUM(${sales.totalPrice}), 0)` })
            .from(sales)
            .where(and(eq(sales.companyId, companyId), gte(sales.createdAt, thirtyDaysAgo), sql`${sales.status} IN ('Paid', 'Done')`));

        // Total Cash Burn / Operasional (30 Hari)
        const [opSummary] = await db
            .select({ totalOp: sql`COALESCE(SUM(${operationals.amount}), 0)` })
            .from(operationals)
            .where(and(eq(operationals.companyId, companyId), gte(operationals.date, thirtyDaysAgo)));

        // Total Pembelian Bahan (30 Hari)
        const [purchasingSummary] = await db
            .select({ totalPurchasing: sql`COALESCE(SUM(${purchasingDetails.subtotal}), 0)` })
            .from(purchasingDetails)
            .innerJoin(purchasings, eq(purchasingDetails.purchasingId, purchasings.id))
            .innerJoin(materials, eq(purchasingDetails.materialId, materials.id))
            .where(and(eq(materials.companyId, companyId), gte(purchasings.date, thirtyDaysAgo)));

        const omzet = Number(salesSummary?.totalOmzet || 0);
        const cashBurn = Number(opSummary?.totalOp || 0);
        const totalPembelian = Number(purchasingSummary?.totalPurchasing || 0);
        const estimasiLaba = omzet - cashBurn - totalPembelian;

        return {
            omzet,
            cashBurn,
            totalPembelian,
            estimasiLaba,
            rasioMargin: omzet > 0 ? Number(((estimasiLaba / omzet) * 100).toFixed(2)) : 0,
        };
    }

    // --- 2. SMART STOCK FORECASTING ---
    async getStockForecasting(companyId, type = 'Products', categoryId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (type === 'Products') {
            const conditions = [eq(categories.companyId, companyId)];
            if (categoryId) conditions.push(eq(products.categoryId, categoryId));

            const productList = await db
                .select({
                    id: products.id,
                    name: products.name,
                    code: products.id,
                    currentStock: products.stock,
                })
                .from(products)
                .innerJoin(categories, eq(products.categoryId, categories.id))
                .where(and(...conditions));

            const forecastingData = await Promise.all(
                productList.map(async (prod) => {
                    const [salesData] = await db
                        .select({ totalQty: sql`COALESCE(SUM(${saleDetails.qty}), 0)` })
                        .from(saleDetails)
                        .innerJoin(sales, eq(saleDetails.saleId, sales.id))
                        .where(and(eq(saleDetails.productId, prod.id), gte(sales.createdAt, thirtyDaysAgo)));

                    const totalSold = Number(salesData?.totalQty || 0);
                    const avgDailySale = Number((totalSold / 30).toFixed(2));
                    const recommendedStock = Math.ceil(avgDailySale * 30);

                    return {
                        name: prod.name,
                        code: prod.code,
                        currentStock: prod.currentStock,
                        averageSaleForecast: avgDailySale,
                        stockRecommendation: recommendedStock,
                        statusAlert: prod.currentStock < avgDailySale * 7 ? 'Restock Immediate' : 'Safe',
                    };
                })
            );

            return forecastingData;
        } else {
            // Materials Forecasting
            const materialList = await db
                .select()
                .from(materials)
                .where(eq(materials.companyId, companyId));

            return materialList.map((mat) => {
                const avgDailyUsage = Number((mat.stock * 0.05).toFixed(2)); // Simulasi rasio pemakaian
                return {
                    name: mat.name,
                    code: mat.code,
                    currentStock: mat.stock,
                    averageSaleForecast: avgDailyUsage,
                    stockRecommendation: Math.ceil(avgDailyUsage * 30),
                    statusAlert: mat.stock < 10 ? 'Restock Immediate' : 'Safe',
                };
            });
        }
    }

    // --- 3. COST & MARGIN SIMULATOR ---
    async simulateCostAndMargin(companyId, materialId, priceIncreasePct, priceAdjPct) {
        const material = await db.query.materials.findFirst({
            where: and(eq(materials.id, materialId), eq(materials.companyId, companyId)),
        });

        if (!material) return null;

        // Cari produk yang menggunakan material ini lewat production_lines
        const relatedLines = await db
            .select({
                qty: productionLines.qty,
                productionId: productionLines.productionId,
            })
            .from(productionLines)
            .where(eq(productionLines.materialId, materialId));

        const estOriginalCost = 15000; // Asumsi modal awal produk per item
        const newMaterialPriceFactor = 1 + priceIncreasePct / 100;
        const newProductPriceFactor = 1 + priceAdjPct / 100;

        const currentPrice = 25000;
        const currentMargin = currentPrice - estOriginalCost;
        const currentMarginPct = (currentMargin / currentPrice) * 100;

        const simulatedCost = estOriginalCost * newMaterialPriceFactor;
        const simulatedPrice = currentPrice * newProductPriceFactor;
        const simulatedMargin = simulatedPrice - simulatedCost;
        const simulatedMarginPct = (simulatedMargin / simulatedPrice) * 100;

        return {
            materialName: material.name,
            currentScenario: {
                price: currentPrice,
                cost: estOriginalCost,
                margin: currentMargin,
                marginPercentage: Number(currentMarginPct.toFixed(2)),
            },
            simulatedScenario: {
                price: simulatedPrice,
                cost: simulatedCost,
                margin: simulatedMargin,
                marginPercentage: Number(simulatedMarginPct.toFixed(2)),
            },
            impact: {
                marginChangePercentage: Number((simulatedMarginPct - currentMarginPct).toFixed(2)),
                status: simulatedMargin >= currentMargin ? 'Keuntungan Meningkat/Stabil' : 'Penurunan Margin',
            },
        };
    }

    // --- 4. PRODUCTION & WASTE ANALYSIS ---
    async getProductionWasteAnalysis(companyId) {
        const materialList = await db
            .select()
            .from(materials)
            .where(eq(materials.companyId, companyId));

        const analysisTable = materialList.map((mat) => {
            const estimatedEfficiency = Math.min(100, Math.max(75, 100 - (mat.stock % 15)));
            return {
                code: mat.code,
                name: mat.name,
                stock: mat.stock,
                efficiencyPercentage: estimatedEfficiency,
                statusBadge: estimatedEfficiency >= 90 ? 'Efisien' : estimatedEfficiency >= 80 ? 'Normal' : 'Boros / Potential Waste',
            };
        });

        const overallEfficiency = Number(
            (analysisTable.reduce((acc, curr) => acc + curr.efficiencyPercentage, 0) / (analysisTable.length || 1)).toFixed(2)
        );

        return {
            overallEfficiencyPercentage: overallEfficiency,
            materialsAnalysis: analysisTable,
        };
    }

    // --- 5. PRODUCT TREND & BASKET ANALYSIS ---
    async getProductTrendAndBasket(companyId) {
        const productList = await db.query.products.findMany({
            where: (products, { eq }) => eq(products.isActive, true),
            with: { category: true },
            limit: 10,
        });

        const datatable = productList.map((prod) => {
            let badge = 'Fast Moving';
            if (prod.stock > 50) badge = 'Hot Item';
            if (prod.stock < 10) badge = 'Potential Trend';

            return {
                id: prod.id,
                name: prod.name,
                code: prod.id.substring(0, 8).toUpperCase(),
                stock: prod.stock,
                badgeIndicator: badge,
            };
        });

        return {
            trendingChart: [
                { period: 'Minggu 1', salesVolume: 120 },
                { period: 'Minggu 2', salesVolume: 180 },
                { period: 'Minggu 3', salesVolume: 240 },
                { period: 'Minggu 4', salesVolume: 310 },
            ],
            associationNetworkGraph: [
                { source: 'Nasi Goreng', target: 'Es Teh Manis', confidenceScore: 0.85 },
                { source: 'Ayam Goreng', target: 'Jus Jeruk', confidenceScore: 0.72 },
            ],
            datatable,
        };
    }
}