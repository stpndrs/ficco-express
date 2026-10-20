import { db } from '../db/index.js';
import { categories, materials, operationals, productions, purchasings, sales } from '../db/schema.js';
import { eq, like, and, sql, desc, or, gte, lte } from 'drizzle-orm';

export class CodeRepository {
    // Operational Code
    async generateOperationalCode(companyId) {
        const [lastOp] = await db
            .select({ code: operationals.code })
            .from(operationals)
            .where(eq(operationals.companyId, companyId))
            .orderBy(desc(operationals.createdAt))
            .limit(1);

        if (!lastOp || !lastOp.code.startsWith('OP')) {
            return 'OP0001';
        }

        const currentNum = parseInt(lastOp.code.replace('OP', ''), 10);
        const nextNum = isNaN(currentNum) ? 1 : currentNum + 1;
        return `OP${String(nextNum).padStart(4, '0')}`;
    }

    // Purchasing Code
    async generatePurchasingCode() {
        const [lastPurchasing] = await db
            .select({ code: purchasings.code })
            .from(purchasings)
            .orderBy(desc(purchasings.createdAt))
            .limit(1);

        if (!lastPurchasing || !lastPurchasing.code.startsWith('PO')) {
            return 'PO0001';
        }

        const currentNum = parseInt(lastPurchasing.code.replace('PO', ''), 10);
        const nextNum = isNaN(currentNum) ? 1 : currentNum + 1;
        return `PO${String(nextNum).padStart(4, '0')}`;
    }

    // Sale Code
    async generateSaleCode(companyId) {
        const [lastSale] = await db
            .select({ code: sales.code })
            .from(sales)
            .where(eq(sales.companyId, companyId))
            .orderBy(desc(sales.createdAt))
            .limit(1);

        if (!lastSale || !lastSale.code.startsWith('SE')) {
            return 'SE0001';
        }

        const currentNum = parseInt(lastSale.code.replace('SE', ''), 10);
        const nextNum = isNaN(currentNum) ? 1 : currentNum + 1;
        return `SE${String(nextNum).padStart(4, '0')}`;
    }

    // Production Code
    async generateProductionCode(companyId) {
        const [lastProduction] = await db
            .select({ code: productions.code })
            .from(productions)
            .where(eq(productions.companyId, companyId))
            .orderBy(desc(productions.createdAt))
            .limit(1);

        if (!lastProduction || !lastProduction.code.startsWith('PR')) {
            return 'PR0001';
        }

        const currentNum = parseInt(lastProduction.code.replace('PR', ''), 10);
        const nextNum = isNaN(currentNum) ? 1 : currentNum + 1;
        return `PR${String(nextNum).padStart(4, '0')}`;
    }

    // Material Code
    async generateMaterialCode(companyId) {
        const [lastMaterial] = await db
            .select({ code: materials.code })
            .from(materials)
            .where(eq(materials.companyId, companyId))
            .orderBy(desc(materials.createdAt))
            .limit(1);

        if (!lastMaterial || !lastMaterial.code.startsWith('MA')) {
            return 'MA0001';
        }

        const currentNum = parseInt(lastMaterial.code.replace('MA', ''), 10);
        const nextNum = isNaN(currentNum) ? 1 : currentNum + 1;
        return `MA${String(nextNum).padStart(4, '0')}`;
    }

    // Category Code
    async generateCategoryCode(companyId) {
        const [lastSale] = await db
            .select({ code: categories.code })
            .from(categories)
            .where(eq(categories.companyId, companyId))
            .orderBy(desc(categories.createdAt))
            .limit(1);

        if (!lastSale || !lastSale.code.startsWith('CA')) {
            return 'CA0001';
        }

        const currentNum = parseInt(lastSale.code.replace('CA', ''), 10);
        const nextNum = isNaN(currentNum) ? 1 : currentNum + 1;
        return `CA${String(nextNum).padStart(4, '0')}`;
    }
}