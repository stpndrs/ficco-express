import { z } from 'zod';

const saleItemSchema = z.object({
    productId: z.string().uuid('Invalid product ID format'),
    qty: z.number().int().positive('Quantity must be greater than 0'),
    price: z.number().positive('Price must be greater than 0'),
});

export const createSaleSchema = z.object({
    status: z.enum(['draft', 'pending', 'paid', 'done']).default('draft'),
    customerName: z.string().min(1, 'Customer name is required'),
    customerPhone: z.string().optional().nullable(),
    paymentMethod: z.enum(['transfer', 'cash']).optional().nullable(),
    paymentProof: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    items: z.array(saleItemSchema).min(1, 'At least one item is required'),
});

export const updateSaleSchema = z.object({
    status: z.enum(['draft', 'pending', 'paid', 'done']).optional(),
    customerName: z.string().min(1, 'Customer name is required').optional(),
    customerPhone: z.string().optional().nullable(),
    paymentMethod: z.enum(['transfer', 'cash']).optional().nullable(),
    paymentProof: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    items: z.array(saleItemSchema).min(1, 'At least one item is required').optional(),
});

export const querySaleSchema = z.object({
    search: z.string().optional(),
    status: z.enum(['draft', 'pending', 'paid', 'done', 'cancel']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
});