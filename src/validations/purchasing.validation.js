import { z } from 'zod';

export const createSupplierSchema = z.object({
    name: z.string().min(1, 'Supplier name is required'),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
});

const purchasingItemSchema = z.object({
    materialId: z.string().uuid('Format ID material tidak valid'),
    qty: z.number().int().positive('Jumlah harus lebih dari 0'),
    unitPrice: z.number().positive('Harga satuan harus lebih dari 0'),
    tax: z.number().nonnegative().optional().default(0),
    notes: z.string().optional().nullable(),
});

export const createPurchasingSchema = z.object({
    supplierId: z.string().uuid('Format ID supplier tidak valid').optional().nullable(),
    date: z.string().or(z.date()).transform((val) => new Date(val)),
    paymentProof: z.string().optional().nullable(),
    items: z.array(purchasingItemSchema).min(1, 'Minimal harus ada 1 item pembelian'),
});

export const updatePurchasingSchema = createPurchasingSchema.partial();

export const queryPurchasingSchema = z.object({
    search: z.string().optional(),
    supplierId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
});