import { z } from 'zod';

export const reportQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});