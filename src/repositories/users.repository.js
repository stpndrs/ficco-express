import { db } from '../db/index.js';
import { users, companies, usersCompanies } from '../db/schema.js';
import { eq, like, and, sql, desc, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export class UsersRepository {
    // --- USER MANAGEMENT ---
    async createUser(data) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const [newUser] = await db
            .insert(users)
            .values({
                name: data.name,
                username: data.username,
                email: data.email,
                password: hashedPassword,
                phone: data.phone,
                role: data.role,
                isActive: true,
            })
            .returning();

        // Link new user to primary company if needed
        const [firstCompany] = await db.select().from(companies).limit(1);
        if (firstCompany) {
            await db.insert(usersCompanies).values({
                userId: newUser.id,
                companyId: firstCompany.id,
            });
        }

        const { password, ...result } = newUser;
        return result;
    }

    async findAllUsers({ search, role, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    like(users.name, `%${search}%`),
                    like(users.email, `%${search}%`),
                    like(users.username, `%${search}%`)
                )
            );
        }

        if (role) {
            conditions.push(eq(users.role, role));
        }

        const whereClause = conditions.length ? and(...conditions) : undefined;

        const data = await db
            .select({
                id: users.id,
                name: users.name,
                username: users.username,
                email: users.email,
                phone: users.phone,
                role: users.role,
                profileImage: users.profileImage,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(whereClause)
            .orderBy(desc(users.createdAt))
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db
            .select({ count: sql`count(*)` })
            .from(users)
            .where(whereClause);

        return {
            data,
            meta: {
                total: Number(count),
                page,
                limit,
                totalPages: Math.ceil(Number(count) / limit),
            },
        };
    }

    async findUserById(id) {
        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                username: users.username,
                email: users.email,
                phone: users.phone,
                role: users.role,
                profileImage: users.profileImage,
                isActive: users.isActive,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        return user || null;
    }

    async updateUser(id, data) {
        const updatePayload = { ...data, updatedAt: new Date() };

        if (data.password) {
            updatePayload.password = await bcrypt.hash(data.password, 10);
        } else {
            delete updatePayload.password;
        }

        const [updatedUser] = await db
            .update(users)
            .set(updatePayload)
            .where(eq(users.id, id))
            .returning();

        const { password, ...result } = updatedUser;
        return result;
    }

    async toggleUserStatus(id, isActive) {
        const [updatedUser] = await db
            .update(users)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();

        const { password, ...result } = updatedUser;
        return result;
    }

    // --- PROFILE MANAGEMENT ---
    async getProfile(userId) {
        const user = await this.findUserById(userId);
        if (!user) return null;

        // Get Company linked to this user
        const userCompany = await db
            .select({
                company: companies,
            })
            .from(usersCompanies)
            .innerJoin(companies, eq(usersCompanies.companyId, companies.id))
            .where(eq(usersCompanies.userId, userId))
            .limit(1);

        const companyData = userCompany[0]?.company || null;

        return {
            user,
            profile: {
                umkmName: companyData?.name || '',
                umkmAddress: companyData?.address || '',
                profileImage: user.profileImage || null,
                ownerName: companyData?.ownerName || '',
                ownerPhone: companyData?.ownerPhone || '',
                modalAwal: companyData?.initialCapital || '0',
            },
        };
    }

    async updateProfile(userId, profileData) {
        return await db.transaction(async (tx) => {
            // 1. Update user details
            const userPayload = { updatedAt: new Date() };
            if (profileData.email) userPayload.email = profileData.email;
            if (profileData.profileImage) userPayload.profileImage = profileData.profileImage;
            if (profileData.password && profileData.password.trim() !== '') {
                userPayload.password = await bcrypt.hash(profileData.password, 10);
            }

            const [updatedUser] = await tx
                .update(users)
                .set(userPayload)
                .where(eq(users.id, userId))
                .returning();

            // 2. Update linked Company/UMKM details
            const userCompany = await tx
                .select()
                .from(usersCompanies)
                .where(eq(usersCompanies.userId, userId))
                .limit(1);

            if (userCompany.length > 0) {
                const companyId = userCompany[0].companyId;
                const companyPayload = { updatedAt: new Date() };
                if (profileData.companyName) companyPayload.name = profileData.companyName;
                if (profileData.companyAddress) companyPayload.address = profileData.companyAddress;
                if (profileData.ownerName) companyPayload.ownerName = profileData.ownerName;
                if (profileData.ownerPhone) companyPayload.ownerPhone = profileData.ownerPhone;

                await tx
                    .update(companies)
                    .set(companyPayload)
                    .where(eq(companies.id, companyId));
            }

            return await this.getProfile(userId);
        });
    }
}