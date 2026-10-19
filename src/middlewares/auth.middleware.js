import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users, usersCompanies } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: false,
                message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ambil companyId dari tabel users_companies berdasarkan userId
        // const [decoded] = await db.select().from(users).where(eq(users.id, "1e41a3c9-7152-4112-a356-faedbb0394e4")).limit(1)
        const userCompany = await db
            .select({ companyId: usersCompanies.companyId })
            .from(usersCompanies)
            .where(eq(usersCompanies.userId, decoded.id))
            .limit(1);

        if (!userCompany || userCompany.length === 0) {
            return res.status(403).json({
                status: false,
                message: 'Pengguna tidak terhubung dengan perusahaan/UMKM manapun.',
            });
        }

        // Attach user info dan companyId ke object req Express
        req.user = decoded;
        req.companyId = userCompany[0].companyId;

        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            status: false,
            message: 'Token tidak valid atau telah kadaluwarsa.',
        });
    }
};