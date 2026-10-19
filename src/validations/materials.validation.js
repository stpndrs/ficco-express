import { z } from 'zod';

export const createMaterialSchema = z.object({
    code: z.string().min(1, 'Material code is required'),
    name: z.string().min(1, 'Material name is required'),
    type: z.enum(['baku', 'penolong'], {
        errorMap: () => ({ message: "Type must be either 'baku' or 'penolong'" }),
    }),
    description: z.string().optional().nullable(),
    stock: z.number().int().nonnegative().optional().default(0),
});

export const updateMaterialSchema = createMaterialSchema.partial();

export const queryMaterialSchema = z.object({
    search: z.string().optional(),
    type: z.enum(['baku', 'penolong']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
});