import { db } from '../db/index.js';
import { products, categories, units, saleDetails, sales, productions } from '../db/schema.js';
import { eq, like, and, sql, desc, gte } from 'drizzle-orm';

export class InventoryRepository {
    // Helper to determine stock status label
    getStockStatusLabel(stock) {
        if (stock <= 0) return 'Habis';
        if (stock <= 10) return 'Sedikit';
        return 'Banyak';
    }

    // Calculate AI restock prediction based on average daily sales in the last 30 days
    async calculateRestockPrediction(productId, currentStock) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [salesSummary] = await db
            .select({
                totalQtySold: sql`COALESCE(SUM(${saleDetails.qty}), 0)`,
            })
            .from(saleDetails)
            .innerJoin(sales, eq(saleDetails.saleId, sales.id))
            .where(
                and(
                    eq(saleDetails.productId, productId),
                    gte(sales.createdAt, thirtyDaysAgo),
                    sql`${sales.status} != 'Cancel'`
                )
            );

        const totalSold = Number(salesSummary?.totalQtySold || 0);
        const avgDailySales = totalSold / 30;

        if (avgDailySales === 0) {
            return {
                estimatedDaysRemaining: null,
                recommendedRestockQty: 0,
                message: 'Tidak ada aktivitas penjualan dalam 30 hari terakhir.',
            };
        }

        const estimatedDaysRemaining = Math.floor(currentStock / avgDailySales);
        const targetStockFor30Days = Math.ceil(avgDailySales * 30);
        const recommendedRestockQty = Math.max(0, targetStockFor30Days - currentStock);

        return {
            avgDailySales: Number(avgDailySales.toFixed(2)),
            estimatedDaysRemaining,
            recommendedRestockQty,
            message: estimatedDaysRemaining <= 7
                ? `Stok diperkirakan habis dalam ${estimatedDaysRemaining} hari. Segera lakukan produksi/restock.`
                : `Stok aman untuk ${estimatedDaysRemaining} hari ke depan.`,
        };
    }

    async findAll({ search, categoryId, stockStatus, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const conditions = [];

        if (search) {
            conditions.push(like(products.name, `%${search}%`));
        }

        if (categoryId) {
            conditions.push(eq(products.categoryId, categoryId));
        }

        if (stockStatus === 'Habis') {
            conditions.push(sql`${products.stock} <= 0`);
        } else if (stockStatus === 'Sedikit') {
            conditions.push(sql`${products.stock} > 0 AND ${products.stock} <= 10`);
        } else if (stockStatus === 'Banyak') {
            conditions.push(sql`${products.stock} > 10`);
        }

        const whereClause = conditions.length ? and(...conditions) : undefined;

        const dataList = await db.query.products.findMany({
            where: whereClause,
            with: {
                category: true,
                unit: true,
            },
            orderBy: [desc(products.createdAt)],
            limit,
            offset,
        });

        const items = dataList.map((item) => ({
            ...item,
            stockStatus: this.getStockStatusLabel(item.stock),
        }));

        const [{ count }] = await db
            .select({ count: sql`count(*)` })
            .from(products)
            .where(whereClause);

        return {
            data: items,
            meta: {
                total: Number(count),
                page,
                limit,
                totalPages: Math.ceil(Number(count) / limit),
            },
        };
    }

    async findDetail(id) {
        const product = await db.query.products.findFirst({
            where: eq(products.id, id),
            with: {
                category: true,
                unit: true,
            },
        });

        if (!product) return null;

        // Retrieve production history for this product (via unit match or related records)
        const recentProductions = await db.query.productions.findMany({
            where: product.unitId ? eq(productions.unitId, product.unitId) : undefined,
            orderBy: [desc(productions.date)],
            limit: 5,
        });

        // Calculate AI Restock Prediction
        const aiPrediction = await this.calculateRestockPrediction(product.id, product.stock);

        return {
            ...product,
            stockStatus: this.getStockStatusLabel(product.stock),
            productionHistory: recentProductions,
            aiRestockPrediction: aiPrediction,
        };
    }
}