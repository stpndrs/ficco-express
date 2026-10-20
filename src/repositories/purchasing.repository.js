import { db } from '../db/index.js';
import { purchasings, purchasingDetails, materials, suppliers } from '../db/schema.js';
import { eq, like, and, gte, lte, sql, desc } from 'drizzle-orm';

export class PurchasingRepository {
    async createSupplier(companyId, supplierData) {
        const [newSupplier] = await db.insert(suppliers).values({
            companyId: companyId,
            name: supplierData.name,
            phone: supplierData.phone,
            address: supplierData.address,
        }).returning();

        return newSupplier;
    }

    async findAllSupplier(companyId) {
        return await db.select().from(suppliers).where(eq(suppliers.companyId, companyId)).orderBy(suppliers.name);
    }

    async createPurchasing(purchasingData, items) {
        return await db.transaction(async (tx) => {
            const [newPurchasing] = await tx.insert(purchasings).values({
                code: purchasingData.code,
                supplierId: purchasingData.supplierId,
                date: purchasingData.date,
                paymentProof: purchasingData.paymentProof,
            }).returning();

            for (const item of items) {
                const subtotal = (item.unitPrice * item.qty) + (item.tax || 0);

                await tx.insert(purchasingDetails).values({
                    purchasingId: newPurchasing.id,
                    materialId: item.materialId,
                    qty: item.qty,
                    unitPrice: String(item.unitPrice),
                    tax: String(item.tax || 0),
                    subtotal: String(subtotal),
                    notes: item.notes,
                });

                // Tambah stok bahan baku (material)
                await tx
                    .update(materials)
                    .set({
                        stock: sql`${materials.stock} + ${item.qty}`,
                        updatedAt: new Date(),
                    })
                    .where(eq(materials.id, item.materialId));
            }

            return newPurchasing;
        });
    }

    async findAll({ search, supplierId, startDate, endDate, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const conditions = [];

        if (search) {
            conditions.push(like(purchasings.code, `%${search}%`));
        }
        if (supplierId) {
            conditions.push(eq(purchasings.supplierId, supplierId));
        }
        if (startDate) {
            conditions.push(gte(purchasings.date, new Date(startDate)));
        }
        if (endDate) {
            conditions.push(lte(purchasings.date, new Date(endDate)));
        }

        const whereClause = conditions.length ? and(...conditions) : undefined;

        const data = await db
            .select()
            .from(purchasings)
            .where(whereClause)
            .orderBy(desc(purchasings.createdAt))
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db
            .select({ count: sql`count(*)` })
            .from(purchasings)
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
        return await db.query.purchasings.findFirst({
            where: eq(purchasings.id, id),
            with: {
                supplier: true,
                purchasingDetails: {
                    with: {
                        material: true,
                    },
                },
            },
        });
    }
}