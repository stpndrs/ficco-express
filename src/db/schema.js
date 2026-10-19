import { pgTable, uuid, varchar, text, integer, numeric, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Helper for timestamps
const timestamps = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
};

// --- TABLES ---
export const userRoleEnum = pgEnum("user_role", ["owner", "cashier"]);
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }),
    username: varchar('username', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }).unique(),
    password: text('password').notNull(),
    phone: varchar('phone', { length: 50 }),
    role: userRoleEnum('role').default('owner').notNull(),
    profileImage: text('profile_image'),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
});

export const companies = pgTable('companies', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address'),
    ownerName: varchar('owner_name', { length: 255 }),
    ownerPhone: varchar('owner_phone', { length: 50 }),
    initialCapital: numeric('initial_capital', { precision: 15, scale: 2 }).default('0'),
    ...timestamps,
});

export const usersCompanies = pgTable('users_companies', {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
});

export const categories = pgTable('categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps,
});

export const units = pgTable('units', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    ...timestamps,
});

export const suppliers = pgTable('suppliers', {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    address: text('address'),
    ...timestamps,
});

export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    name: varchar('name', { length: 255 }).notNull(),
    price: numeric('price', { precision: 15, scale: 2 }).default('0').notNull(),
    unitId: uuid('unit_id').references(() => units.id, { onDelete: 'set null' }),
    images: text('images'),
    stock: integer('stock').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
});

export const inventories = pgTable('inventories', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
    stock: integer('stock').notNull(),
    date: timestamp('date').notNull(),
    ...timestamps,
});

export const materials = pgTable('materials', {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'baku', 'penolong'
    description: text('description'),
    stock: integer('stock').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
});

export const productions = pgTable('productions', {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
    code: varchar('code', { length: 50 }).notNull().unique(),
    date: timestamp('date').notNull(),
    notes: text('notes'),
    description: text('description'),
    qtyResult: integer('qty_result').notNull(),
    unitId: uuid('unit_id').references(() => units.id, { onDelete: 'set null' }),
    ...timestamps,
});

export const productionLines = pgTable('production_lines', {
    id: uuid('id').defaultRandom().primaryKey(),
    productionId: uuid('production_id').references(() => productions.id, { onDelete: 'cascade' }),
    materialId: uuid('material_id').references(() => materials.id, { onDelete: 'cascade' }),
    qty: integer('qty').notNull(),
    description: text('description'),
    ...timestamps,
});

export const purchasings = pgTable('purchasings', {
    id: uuid('id').defaultRandom().primaryKey(),
    supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
    code: varchar('code', { length: 50 }).notNull().unique(),
    date: timestamp('date').notNull(),
    paymentProof: text('payment_proof'),
    ...timestamps,
});

export const purchasingDetails = pgTable('purchasing_details', {
    id: uuid('id').defaultRandom().primaryKey(),
    purchasingId: uuid('purchasing_id').references(() => purchasings.id, { onDelete: 'cascade' }),
    materialId: uuid('material_id').references(() => materials.id, { onDelete: 'cascade' }),
    notes: text('notes'),
    qty: integer('qty').notNull(),
    tax: numeric('tax', { precision: 15, scale: 2 }).default('0'),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
    unitPrice: numeric('unit_price', { precision: 15, scale: 2 }).notNull(),
    ...timestamps,
});

export const saleStatusEnum = pgEnum('sale_status', ['draft', 'paid', 'cancel', 'pending']);
export const sales = pgTable('sales', {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 50 }).notNull().unique(),
    status: saleStatusEnum('status').default('draft').notNull(),
    customerName: varchar('customer_name', { length: 255 }),
    customerPhone: varchar('customer_phone', { length: 50 }),
    paymentProof: text('payment_proof'),
    paymentMethod: varchar('payment_method', { length: 50 }),
    notes: text('notes'),
    totalPrice: numeric('total_price', { precision: 15, scale: 2 }).notNull(),
    ...timestamps,
});

export const saleDetails = pgTable('sale_details', {
    id: uuid('id').defaultRandom().primaryKey(),
    saleId: uuid('sale_id').references(() => sales.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
    price: numeric('price', { precision: 15, scale: 2 }).notNull(),
    qty: integer('qty').notNull(),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
    ...timestamps,
});

export const operationals = pgTable('operationals', {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 50 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    date: timestamp('date').notNull(),
    paymentProof: text('payment_proof'),
    notes: text('notes'),
    ...timestamps,
});

// --- DRIZZLE RELATIONS ---

export const usersRelations = relations(users, ({ many }) => ({
    usersCompanies: many(usersCompanies),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
    usersCompanies: many(usersCompanies),
    categories: many(categories),
    productions: many(productions),
    suppliers: many(suppliers),
    materials: many(materials),
    sales: many(sales),
    operationals: many(operationals),
}));

export const usersCompaniesRelations = relations(usersCompanies, ({ one }) => ({
    user: one(users, { fields: [usersCompanies.userId], references: [users.id] }),
    company: one(companies, { fields: [usersCompanies.companyId], references: [companies.id] }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    company: one(companies, { fields: [categories.companyId], references: [companies.id] }),
    products: many(products),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
    products: many(products),
    productions: many(productions),
}));

export const productionRelations = relations(productions, ({ one }) => ({
    product: one(products, { fields: [productions.productId], references: [products.id] }),
    company: one(companies, { fields: [productions.companyId], references: [companies.id] }),
    unit: one(units, { fields: [productions.unitId], references: [units.id] }),
}));

export const productRelations = relations(products, ({ one }) => ({
    unit: one(units, { fields: [products.unitId], references: [units.id] }),
    category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
    company: one(companies, { fields: [suppliers.companyId], references: [companies.id] }),
    purchasings: many(purchasings),
}));

export const purchasingRelations = relations(purchasings, ({ one, many }) => ({
    supplier: one(suppliers, { fields: [purchasings.supplierId], references: [suppliers.id] }),
    purchasingDetails: many(purchasingDetails),
}));

export const purchasingDetailsRelations = relations(purchasingDetails, ({ one, many }) => ({
    purchasings: one(purchasings, { fields: [purchasingDetails.purchasingId], references: [purchasings.id] }),
    material: one(materials, { fields: [purchasingDetails.materialId], references: [materials.id] }),
}));

export const materialsRelations = relations(materials, ({ one, many }) => ({
    company: one(companies, { fields: [materials.companyId], references: [companies.id] }),
    productionLines: many(productionLines),
    purchasingDetails: many(purchasingDetails),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
    company: one(companies, { fields: [sales.companyId], references: [companies.id] }),
    saleDetails: many(saleDetails),
}));

export const saleDetailsRelations = relations(saleDetails, ({ one }) => ({
    sale: one(sales, {
        fields: [saleDetails.saleId],
        references: [sales.id],
    }),
    product: one(products, {
        fields: [saleDetails.productId],
        references: [products.id],
    }),
}));

export const operationalsRelations = relations(operationals, ({ one }) => ({
    company: one(companies, { fields: [operationals.companyId], references: [companies.id] }),
}));