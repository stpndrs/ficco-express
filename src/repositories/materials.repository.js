import { db } from '../db/index.js';
import { materials } from '../db/schema.js';
import { eq, like, and, sql, desc, or, gte, lte } from 'drizzle-orm';

export class MaterialsRepository {
    async createMaterial(companyId, materialData) {
        const [newMaterial] = await db
            .insert(materials)
            .values({
                companyId: companyId,
                code: materialData.code,
                name: materialData.name,
                type: materialData.type,
                description: materialData.description,
                stock: materialData.stock ?? 0,
            })
            .returning();

        return newMaterial;
    }

    async findAllMaterials({ search, type, startDate, endDate, page = 1, limit = 10, companyId }) {
        const offset = (page - 1) * limit;
        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    like(materials.code, `%${search}%`),
                    like(materials.name, `%${search}%`)
                )
            );
        }

        if (type) {
            conditions.push(eq(materials.type, type));
        }

        if (startDate) {
            conditions.push(gte(materials.createdAt, new Date(startDate)));
        }

        if (endDate) {
            conditions.push(lte(materials.createdAt, new Date(endDate)));
        }

        console.log(companyId)

        conditions.push(eq(materials.companyId, companyId))

        const whereClause = conditions.length ? and(...conditions) : undefined;

        const data = await db
            .select()
            .from(materials)
            .where(whereClause)
            .orderBy(desc(materials.createdAt))
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db
            .select({ count: sql`count(*)` })
            .from(materials)
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

    async findMaterialById(id) {
        const result = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
        return result[0] || null;
    }

    async updateMaterial(id, materialData) {
        const [updatedMaterial] = await db
            .update(materials)
            .set({
                ...materialData,
                updatedAt: new Date(),
            })
            .where(eq(materials.id, id))
            .returning();

        return updatedMaterial;
    }

    async toggleMaterialStatus(id, isActive) {
        const [updatedMaterial] = await db
            .update(materials)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(materials.id, id))
            .returning();

        return updatedMaterial;
    }
}