import { db } from '../db/index.js';
import { users, companies, usersCompanies } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export class AuthRepository {
    async findUserByUsername(username) {
        const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
        return result[0] || null;
    }
    
    async findUserByEmail(email) {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0] || null;
    }

    async findUserById(id) {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0] || null;
    }

    async createUserWithCompany(userData, companyData) {
        return await db.transaction(async (tx) => {
            const [newUser] = await tx.insert(users).values(userData).returning();
            const [newCompany] = await tx.insert(companies).values(companyData).returning();

            await tx.insert(usersCompanies).values({
                userId: newUser.id,
                companyId: newCompany.id,
            });

            return { user: newUser, company: newCompany };
        });
    }

    async updatePassword(userId, hashedPassword) {
        const [updatedUser] = await db
            .update(users)
            .set({ password: hashedPassword, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();
        return updatedUser;
    }
}