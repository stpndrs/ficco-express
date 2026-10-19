import { db } from '../db/index.js';
import { products, categories, units } from '../db/schema.js';
import { eq, like, and, sql, desc, or } from 'drizzle-orm';

export class ProductsRepository {
    // Category Methods
    async findAllCategories(companyId) {
        return await db.select().from(categories).where(eq(categories.companyId, companyId)).orderBy(categories.name);
    }

    async createCategory(companyId, categoryData) {
        const [newCategory] = await db
            .insert(categories)
            .values({
                companyId, // ERD update: FK company_id
                code: categoryData.code,
                name: categoryData.name,
            })
            .returning();

        return newCategory;
    }

    // Product Methods

    async findAllProducts({ search, categoryId, isActive, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    like(products.name, `%${search}%`)
                )
            );
        }

        if (categoryId) {
            conditions.push(eq(products.categoryId, categoryId));
        }

        if (isActive !== undefined) {
            conditions.push(eq(products.isActive, isActive));
        }

        const whereClause = conditions.length ? and(...conditions) : undefined;

        const data = await db.query.products.findMany({
            where: whereClause,
            with: {
                category: true,
                unit: true,
            },
            orderBy: [desc(products.createdAt)],
            limit,
            offset,
        });

        const [{ count }] = await db
            .select({ count: sql`count(*)` })
            .from(products)
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

    async findProductById(id) {
        return await db.query.products.findFirst({
            where: eq(products.id, id),
            with: {
                category: true,
                unit: true,
            },
        });
    }

    async createProduct(productData) {
        const [newProduct] = await db
            .insert(products)
            .values({
                companyId: productData.companyId,
                categoryId: productData.categoryId || null,
                unitId: productData.unitId || null,
                name: productData.name,
                price: productData.price,
                stock: productData.stock || 0,
                images: productData.images || null,
                notes: productData.notes || null,
                isActive: productData.isActive ?? true,
            })
            .returning();

        return newProduct;
    };

    async updateProduct(id, productData) {
        const updatePayload = {
            ...productData,
            ...(productData.price !== undefined && { price: String(productData.price) }),
            updatedAt: new Date(),
        };

        const [updatedProduct] = await db
            .update(products)
            .set(updatePayload)
            .where(eq(products.id, id))
            .returning();

        return updatedProduct;
    };

    async toggleProductStatus(id, isActive) {
        const [updatedProduct] = await db
            .update(products)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(products.id, id))
            .returning();

        return updatedProduct;
    }
}