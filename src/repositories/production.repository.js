import { db } from '../db/index.js';
import { productions, productionLines, units, materials } from '../db/schema.js';
import { eq, ilike, or, and, sql, desc } from 'drizzle-orm';

export class ProductionRepository {
    async findAll({ page = 1, limit = 10, search, date, companyId }) {
        const offset = (page - 1) * limit;
        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    ilike(productions.code, `%${search}%`),
                    ilike(productions.notes, `%${search}%`)
                )
            );
        }

        if (date) {
            conditions.push(sql`DATE(${productions.date}) = DATE(${date})`);
        }

        conditions.push(eq(productions.companyId, companyId))

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const data = await db
            .select({
                id: productions.id,
                code: productions.code,
                date: productions.date,
                qtyResult: productions.qtyResult,
                notes: productions.notes,
                description: productions.description,
                createdAt: productions.createdAt,
                updatedAt: productions.updatedAt,
                unit: {
                    id: units.id,
                    name: units.name,
                },
            })
            .from(productions)
            .leftJoin(units, eq(productions.unitId, units.id))
            .where(whereClause)
            .orderBy(desc(productions.createdAt))
            .limit(limit)
            .offset(offset);

        const [totalCount] = await db
            .select({ count: sql`count(*)` })
            .from(productions)
            .where(whereClause);

        const total = Number(totalCount?.count || 0);

        return {
            data,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id) {
        const result = await db
            .select({
                id: productions.id,
                code: productions.code,
                date: productions.date,
                qtyResult: productions.qtyResult,
                notes: productions.notes,
                description: productions.description,
                unitId: productions.unitId,
                createdAt: productions.createdAt,
                updatedAt: productions.updatedAt,
                unit: {
                    id: units.id,
                    name: units.name,
                },
            })
            .from(productions)
            .leftJoin(units, eq(productions.unitId, units.id))
            .where(eq(productions.id, id))
            .limit(1);

        if (!result[0]) return null;

        const lines = await db
            .select({
                id: productionLines.id,
                materialId: productionLines.materialId,
                qty: productionLines.qty,
                description: productionLines.description,
                material: {
                    id: materials.id,
                    name: materials.name,
                    code: materials.code,
                },
            })
            .from(productionLines)
            .leftJoin(materials, eq(productionLines.materialId, materials.id))
            .where(eq(productionLines.productionId, id));

        return {
            ...result[0],
            lines,
        };
    }

    async create(data, companyId) {
        return await db.transaction(async (tx) => {
            const code = data.code || `BATCH-${Date.now().toString().slice(-6)}`;
            console.log(companyId)

            const [newProduction] = await tx
                .insert(productions)
                .values({
                    companyId: companyId,
                    code,
                    date: new Date(data.date),
                    notes: data.notes,
                    description: data.description,
                    qtyResult: data.qtyResult,
                    productId: data.productId,
                    unitId: data.unitId,
                })
                .returning();

            if (data.lines && data.lines.length > 0) {
                const linesToInsert = data.lines.map((line) => ({
                    productionId: newProduction.id,
                    materialId: line.materialId,
                    qty: line.qty,
                    description: line.description,
                }));

                await tx.insert(productionLines).values(linesToInsert);
            }

            return newProduction;
        });
    }

    async update(id, data) {
        return await db.transaction(async (tx) => {
            const updatePayload = {};
            if (data.date) updatePayload.date = new Date(data.date);
            if (data.notes !== undefined) updatePayload.notes = data.notes;
            if (data.description !== undefined) updatePayload.description = data.description;
            if (data.qtyResult !== undefined) updatePayload.qtyResult = data.qtyResult;
            if (data.unitId !== undefined) updatePayload.unitId = data.unitId;
            updatePayload.updatedAt = new Date();

            const [updatedRecord] = await tx
                .update(productions)
                .set(updatePayload)
                .where(eq(productions.id, id))
                .returning();

            if (data.lines && data.lines.length > 0) {
                await tx.delete(productionLines).where(eq(productionLines.productionId, id));

                const linesToInsert = data.lines.map((line) => ({
                    productionId: id,
                    materialId: line.materialId,
                    qty: line.qty,
                    description: line.description,
                }));

                await tx.insert(productionLines).values(linesToInsert);
            }

            return updatedRecord || null;
        });
    }

    async delete(id) {
        const [deletedRecord] = await db
            .delete(productions)
            .where(eq(productions.id, id))
            .returning();

        return deletedRecord || null;
    }
}