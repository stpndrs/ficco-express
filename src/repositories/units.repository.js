import { db } from '../db/index.js';
import { units } from '../db/schema.js';
import { eq, like, and, sql, desc, or } from 'drizzle-orm';

export class UnitsRepository {
    // Category Methods
    async findAllUnits() {
        return await db.select().from(units).orderBy(units.createdAt);
    }
}