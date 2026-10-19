import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.email().min(3, 'Email must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    companyName: z.string().min(1, 'Company name is required'),
    companyAddress: z.string().optional(),
    ownerName: z.string().min(3, 'Owner name must be at least 3 characters'),
    ownerPhone: z.string().optional(),
    initialCapital: z.number().optional().default(0),
});

export const loginSchema = z.object({
    email: z.email().min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
    email: z.email().min(1, 'Email is required'),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});