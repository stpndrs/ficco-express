import { z } from 'zod';

// Users Validation
export const createUserSchema = z.object({
    name: z.string().min(1, 'Nama pengguna wajib diisi'),
    username: z.string().min(3, 'Username minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    phone: z.string().optional().nullable(),
    role: z.enum(['Admin', 'Kasir'], {
        errorMap: () => ({ message: "Role harus 'Admin' atau 'Kasir'" }),
    }),
});

export const updateUserSchema = z.object({
    name: z.string().min(1, 'Nama pengguna wajib diisi').optional(),
    username: z.string().min(3, 'Username minimal 3 karakter').optional(),
    email: z.string().email('Format email tidak valid').optional(),
    password: z.string().min(6, 'Password minimal 6 karakter').optional().nullable(),
    phone: z.string().optional().nullable(),
    role: z.enum(['Admin', 'Kasir']).optional(),
    isActive: z.boolean().optional(),
});

export const queryUserSchema = z.object({
    search: z.string().optional(), // Search by Name or Email
    role: z.enum(['Admin', 'Kasir']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
});

// Profile Validation
export const updateProfileSchema = z.object({
    userId: z.string().uuid('Invalid user ID format'),
    companyName: z.string().min(1, 'Nama UMKM wajib diisi').optional(),
    companyAddress: z.string().optional().nullable(),
    ownerName: z.string().optional().nullable(),
    ownerPhone: z.string().optional().nullable(),
    email: z.string().email('Format email tidak valid').optional(),
    password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
    profileImage: z.string().optional().nullable(),
});