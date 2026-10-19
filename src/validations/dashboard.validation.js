import { z } from 'zod';

export const aiCopilotSchema = z.object({
    question: z.string().min(1, 'Pertanyaan wajib diisi'),
});

export const stockForecastingSchema = z.object({
    type: z.enum(['Products', 'Materials']).default('Products'),
    categoryId: z.string().uuid().optional(),
});

export const marginSimulatorSchema = z.object({
    materialId: z.string().uuid('ID Material tidak valid'),
    priceIncreasePercentage: z.number().default(0), // Misal +15%
    productPriceAdjustmentPercentage: z.number().default(0), // Misal +5%
});

export const wasteAnalysisSchema = z.object({
    month: z.coerce.number().int().min(1).max(12).optional(),
    year: z.coerce.number().int().min(2020).max(2100).optional(),
});