import { db } from '../db/index.js';
import { operationals } from '../db/schema.js';
import { eq, like, and, sql, desc, or, gte, lte } from 'drizzle-orm';

export class OperationalsRepository {
    async createOperational(data) {
        const [newOp] = await db
            .insert(operationals)
            .values({
                code: data.code,
                title: data.title,
                amount: String(data.amount),
                date: data.date,
                paymentProof: data.paymentProof,
                notes: data.notes,
            })
            .returning();

        return newOp;
    }

    async findAllOperationals({ search, startDate, endDate, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    like(operationals.code, `%${search}%`),
                    like(operationals.title, `%${search}%`)
                )
            );
        }

        if (startDate) {
            conditions.push(gte(operationals.date, new Date(startDate)));
        }

        if (endDate) {
            conditions.push(lte(operationals.date, new Date(endDate)));
        }

        const whereClause = conditions.length ? and(...conditions) : undefined;

        const data = await db
            .select()
            .from(operationals)
            .where(whereClause)
            .orderBy(desc(operationals.date))
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db
            .select({ count: sql`count(*)` })
            .from(operationals)
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

    async findOperationalById(id) {
        const result = await db
            .select()
            .from(operationals)
            .where(eq(operationals.id, id))
            .limit(1);
        return result[0] || null;
    }

    async updateOperational(id, data) {
        const updatePayload = {
            ...data,
            ...(data.amount !== undefined && { amount: String(data.amount) }),
            updatedAt: new Date(),
        };

        const [updatedOp] = await db
            .update(operationals)
            .set(updatePayload)
            .where(eq(operationals.id, id))
            .returning();

        return updatedOp;
    }
}