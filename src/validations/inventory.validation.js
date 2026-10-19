import { z } from 'zod';

export const queryInventorySchema = z.object({
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    stockStatus: z.enum(['Habis', 'Sedikit', 'Banyak']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
});