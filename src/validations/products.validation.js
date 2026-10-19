import { z } from 'zod';

export const createCategorySchema = z.object({
    code: z.string().min(1, 'Category code is required'),
    name: z.string().min(1, 'Category name is required'),
});

export const createProductSchema = z.object({
    categoryId: z.string().uuid('Invalid category ID format').optional().nullable(),
    name: z.string().min(1, 'Product name is required'),
    price: z.coerce.number().nonnegative('Price must be greater than or equal to 0'),
    unitId: z.string().uuid('Invalid unit ID format').optional().nullable(),
    stock: z.coerce.number().int().nonnegative().optional().default(0),
    isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional().default(true),
    notes: z.string().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial().extend({
    images: z.any().optional().nullable(),
});

export const queryProductSchema = z.object({
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    isActive: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
});