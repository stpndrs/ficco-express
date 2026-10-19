import { z } from 'zod';

const productionLineSchema = z.object({
    materialId: z.string().uuid('Invalid material ID format'),
    qty: z.number().int().positive('Quantity must be positive'),
    description: z.string().optional(),
});

export const createProductionSchema = z.object({
    code: z.string().optional(),
    date: z.string().min(1, 'Date is required'),
    notes: z.string().optional(),
    description: z.string().optional(),
    qtyResult: z.number().int().positive('Quantity result must be positive'),
    productId: z.string().uuid('Invalid product ID format').optional().nullable(),
    unitId: z.string().uuid('Invalid unit ID format').optional().nullable(),
    lines: z.array(productionLineSchema).min(1, 'At least one material line is required'),
});

export const updateProductionSchema = z.object({
    date: z.string().optional(),
    notes: z.string().optional(),
    description: z.string().optional(),
    qtyResult: z.number().int().positive().optional(),
    productId: z.string().uuid().optional().nullable(),
    unitId: z.string().uuid().optional().nullable(),
    lines: z.array(productionLineSchema).optional(),
});