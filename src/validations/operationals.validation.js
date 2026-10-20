import { z } from 'zod';

export const createOperationalSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    title: z.string().min(1, 'Title is required'),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    date: z.string().or(z.date()).transform((val) => new Date(val)),
    notes: z.string().optional().nullable(),
});

export const updateOperationalSchema = createOperationalSchema.partial();

export const queryOperationalSchema = z.object({
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
});