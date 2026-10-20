import { db } from '../db/index.js';
import { sales, saleDetails, products } from '../db/schema.js';
import { eq, like, and, gte, lte, sql, desc, or } from 'drizzle-orm';

export class SalesRepository {
    async generateCode() {
        const [lastSale] = await db
            .select({ code: sales.code })
            .from(sales)
            .orderBy(desc(sales.createdAt))
            .limit(1);

        if (!lastSale || !lastSale.code.startsWith('SE')) {
            return 'SE0001';
        }

        const currentNum = parseInt(lastSale.code.replace('SE', ''), 10);
        const nextNum = isNaN(currentNum) ? 1 : currentNum + 1;
        return `SE${String(nextNum).padStart(4, '0')}`;
    }

    // Tambahkan companyId pada transaksi pembuatan penjualan
    async createTransaction(companyId, saleData, items) {
        return await db.transaction(async (tx) => {
            const code = await this.generateCode();
            const totalPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);

            const [newSale] = await tx.insert(sales).values({
                companyId, // ERD update: Menyimpan FK company_id
                code,
                status: saleData.status || 'Draft',
                customerName: saleData.customerName,
                customerPhone: saleData.customerPhone,
                paymentMethod: saleData.paymentMethod,
                paymentProof: saleData.paymentProof,
                notes: saleData.notes,
                totalPrice: String(totalPrice),
            }).returning();

            for (const item of items) {
                const subtotal = item.price * item.qty;

                await tx.insert(saleDetails).values({
                    saleId: newSale.id,
                    productId: item.productId,
                    price: String(item.price),
                    qty: item.qty,
                    subtotal: String(subtotal),
                });

                if (saleData.status !== 'Draft') {
                    await tx
                        .update(products)
                        .set({
                            stock: sql`${products.stock} - ${item.qty}`,
                            updatedAt: new Date(),
                        })
                        .where(eq(products.id, item.productId));
                }
            }

            return newSale;
        });
    }

    async updateSale(id, saleData, items) {
        return await db.transaction(async (tx) => {
            // Fetch data penjualan eksis berserta item lama
            const existingSale = await tx.query.sales.findFirst({
                where: eq(sales.id, id),
                with: { saleDetails: true }
            });

            if (!existingSale) return null;

            // Hitung ulang total harga jika items dikirimkan, atau pakai items lama
            let totalPrice = existingSale.totalPrice;
            if (items && items.length > 0) {
                totalPrice = String(items.reduce((acc, item) => acc + (Number(item.price) * Number(item.qty)), 0));
            }

            // 1. Update data header penjualan
            const [updatedSale] = await tx
                .update(sales)
                .set({
                    customerName: saleData.customerName ?? existingSale.customerName,
                    customerPhone: saleData.customerPhone ?? existingSale.customerPhone,
                    paymentMethod: saleData.paymentMethod ?? existingSale.paymentMethod,
                    paymentProof: saleData.paymentProof ?? existingSale.paymentProof,
                    notes: saleData.notes ?? existingSale.notes,
                    status: saleData.status ?? existingSale.status,
                    totalPrice,
                    updatedAt: new Date()
                })
                .where(eq(sales.id, id))
                .returning();

            // 2. Jika ada pembaruan item
            if (items && items.length > 0) {
                // Hapus detail item transaksi lama
                await tx.delete(saleDetails).where(eq(saleDetails.saleId, id));

                // Insert detail item baru
                for (const item of items) {
                    const subtotal = Number(item.price) * Number(item.qty);

                    await tx.insert(saleDetails).values({
                        saleId: id,
                        productId: item.productId,
                        price: String(item.price),
                        qty: Number(item.qty),
                        subtotal: String(subtotal)
                    });

                    // Potong stok produk jika status transaksi berubah menjadi non-draft (e.g. 'Paid')
                    if (saleData.status && saleData.status !== 'draft' && existingSale.status === 'draft') {
                        await tx
                            .update(products)
                            .set({
                                stock: sql`${products.stock} - ${Number(item.qty)}`,
                                updatedAt: new Date()
                            })
                            .where(eq(products.id, item.productId));
                    }
                }
            }

            return updatedSale;
        });
    }

    // Filter query berdasarkan companyId
    async findAll({ companyId, search, status, startDate, endDate, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const conditions = [];

        if (companyId) {
            conditions.push(eq(sales.companyId, companyId));
        }

        if (search) {
            conditions.push(
                or(
                    like(sales.code, `%${search}%`),
                    like(sales.customerName, `%${search}%`)
                )
            );
        }

        if (status) {
            conditions.push(eq(sales.status, status));
        }

        if (startDate) {
            conditions.push(gte(sales.createdAt, new Date(startDate)));
        }

        if (endDate) {
            conditions.push(lte(sales.createdAt, new Date(endDate)));
        }

        const whereClause = conditions.length ? and(...conditions) : undefined;

        const data = await db
            .select()
            .from(sales)
            .where(whereClause)
            .orderBy(desc(sales.createdAt))
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db
            .select({ count: sql`count(*)` })
            .from(sales)
            .where(whereClause);

        return {
            data,
            meta: {
                total: Number(count),
                page,
                limit,
                totalPages: Math.ceil(Number(count) / limit),
            },
        };
    }

    async findById(id) {
        const sale = await db.query.sales.findFirst({
            where: eq(sales.id, id),
            with: {
                saleDetails: {
                    with: {
                        product: true,
                    },
                },
            },
        });

        return sale || null;
    }

    async cancelSale(id) {
        return await db.transaction(async (tx) => {
            const existingSale = await tx.query.sales.findFirst({
                where: eq(sales.id, id),
                with: { saleDetails: true },
            });

            if (!existingSale) return null;

            // Revert product stock if sale was active (not Draft)
            if (existingSale.status !== 'draft' && existingSale.status !== 'cancel') {
                for (const detail of existingSale.saleDetails) {
                    await tx
                        .update(products)
                        .set({
                            stock: sql`${products.stock} + ${detail.qty}`,
                            updatedAt: new Date(),
                        })
                        .where(eq(products.id, detail.productId));
                }
            }

            const [cancelledSale] = await tx
                .update(sales)
                .set({
                    status: 'cancel',
                    updatedAt: new Date(),
                })
                .where(eq(sales.id, id))
                .returning();

            return cancelledSale;
        });
    }
}