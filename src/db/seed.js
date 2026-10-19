import { db } from './index.js';
import { users, companies, usersCompanies, categories, units, materials, suppliers } from './schema.js';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('Seeding database...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Seed Company
    const [company] = await db.insert(companies).values([
        {
            name: 'PT Tech Solusindo',
            address: 'Jl. Raya Darmo No. 45, Surabaya',
            ownerName: 'Stevan Andreas',
            ownerPhone: '081234567890',
            initialCapital: '50000000',
        },
    ]).returning();

    // 2. Seed Admin & Staff Users
    const [ownerUser] = await db.insert(users).values([
        {
            name: 'Stevan Owner',
            username: 'owner',
            email: 'owner@example.com',
            password: hashedPassword,
            phone: '081234567890',
            role: 'owner',
            isActive: true,
        },
    ]).returning();

    const [cashierUser] = await db.insert(users).values([
        {
            name: 'Stevan Cashier',
            username: 'cashier',
            email: 'cashier@example.com',
            password: hashedPassword,
            phone: '081234567891',
            role: 'cashier',
            isActive: true,
        },
    ]).returning();

    await db.insert(usersCompanies).values([
        { userId: ownerUser.id, companyId: company.id },
        { userId: cashierUser.id, companyId: company.id },
    ]);

    // 3. Seed Units with companyId
    await db.insert(units).values([
        { companyId: company.id, name: 'Pcs' },
        { companyId: company.id, name: 'Kg' },
        { companyId: company.id, name: 'Box' },
    ]);

    // 4. Seed Categories with companyId
    await db.insert(categories).values([
        { companyId: company.id, code: 'CAT-01', name: 'Electronics' },
        { companyId: company.id, code: 'CAT-02', name: 'Raw Materials' },
    ]);

    // 5. Seed Suppliers with companyId
    await db.insert(suppliers).values([
        { companyId: company.id, name: 'PT Supplier Utama', phone: '081234567890', address: 'Surabaya, Indonesia' },
    ]);

    // 6. Seed Materials with companyId
    await db.insert(materials).values([
        { companyId: company.id, code: 'MAT-01', name: 'Plastic Resin', type: 'baku', description: 'Primary plastic material', stock: 100 },
        { companyId: company.id, code: 'MAT-02', name: 'Packaging Box', type: 'penolong', description: 'Secondary packaging', stock: 500 },
    ]);

    console.log('Seeding completed successfully!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});