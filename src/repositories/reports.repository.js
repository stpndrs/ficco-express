import { db } from '../db/index.js';
import { sales, purchasings, purchasingDetails, operationals, products, companies, materials, categories } from '../db/schema.js';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export class ReportsRepository {
    // Helper rentang tanggal berdasarkan bulan & tahun (Aman untuk bulan 1/Januari s/d 12/Desember)
    getDateRange(month, year) {
        const now = new Date();
        const parsedMonth = (month !== undefined && month !== null && month !== '') ? Number(month) : null;
        const selectedMonth = parsedMonth !== null ? parsedMonth - 1 : now.getMonth();
        const selectedYear = year ? Number(year) : now.getFullYear();

        const start = new Date(selectedYear, selectedMonth, 1, 0, 0, 0);
        const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

        return { start, end, monthName: start.toLocaleString('id-ID', { month: 'long' }), year: selectedYear };
    }

    // --- 1. LAPORAN LABA RUGI ---
    async getIncomeStatement(companyId, month, year) {
        const { start, end, monthName, year: selectedYear } = this.getDateRange(month, year);

        // Ambil Info Company
        const company = await db.query.companies.findFirst({ where: eq(companies.id, companyId) });

        // Pendapatan Penjualan Barang (Penjualan status Paid / Done Case-Insensitive)
        const [salesSummary] = await db
            .select({ total: sql`COALESCE(SUM(${sales.totalPrice}), 0)` })
            .from(sales)
            .where(
                and(
                    eq(sales.companyId, companyId),
                    gte(sales.createdAt, start),
                    lte(sales.createdAt, end),
                    sql`${sales.status} IN ('paid')`
                )
            );

        const totalPendapatan = Number(salesSummary?.total || 0);

        // HPP (Harga Pokok Barang Terjual)
        const inventoryData = await this.getInventoryReport(companyId, month, year);
        const hpp = inventoryData.summary.hpp;

        const labaKotor = totalPendapatan - hpp;

        // Biaya Operasional dari tabel operationals
        const opList = await db
            .select({
                title: operationals.title,
                amount: operationals.amount,
            })
            .from(operationals)
            .where(
                and(
                    eq(operationals.companyId, companyId),
                    gte(operationals.date, start),
                    lte(operationals.date, end)
                )
            );

        const totalBiayaOperasional = opList.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const labaBersih = labaKotor - totalBiayaOperasional;

        return {
            companyName: company?.name || 'UMKM',
            periode: `${monthName} ${selectedYear}`,
            data: [
                { keterangan: 'Pendapatan penjualan barang', jumlah: totalPendapatan, jenis: 'Input', catatan: 'Penjualan barang dagang selama bulan berjalan' },
                { keterangan: 'Total pendapatan', jumlah: totalPendapatan, jenis: 'Rumus', catatan: '' },
                { keterangan: 'Harga pokok barang terjual', jumlah: hpp, jenis: 'Rumus', catatan: 'Terhubung ke laporan persediaan' },
                { keterangan: 'Laba kotor', jumlah: labaKotor, jenis: 'Rumus', catatan: 'Total pendapatan dikurangi harga pokok barang terjual' },
                ...opList.map((op) => ({ keterangan: op.title, jumlah: Number(op.amount), jenis: 'Input', catatan: '' })),
                { keterangan: 'Total biaya operasional', jumlah: totalBiayaOperasional, jenis: 'Rumus', catatan: '' },
                { keterangan: 'LABA BERSIH', jumlah: labaBersih, jenis: 'Rumus', catatan: 'Belum memperhitungkan pajak penghasilan' },
            ],
            summary: {
                totalPendapatan,
                hpp,
                labaKotor,
                totalBiayaOperasional,
                labaBersih,
            },
        };
    }

    // --- 2. LAPORAN PERSEDIAAN BARANG ---
    async getInventoryReport(companyId, month, year) {
        const { start, end, monthName, year: selectedYear } = this.getDateRange(month, year);
        const company = await db.query.companies.findFirst({ where: eq(companies.id, companyId) });

        // Pembelian Barang Dagang
        const [purchasingSummary] = await db
            .select({ total: sql`COALESCE(SUM(${purchasingDetails.subtotal}), 0)` })
            .from(purchasingDetails)
            .innerJoin(purchasings, eq(purchasingDetails.purchasingId, purchasings.id))
            .innerJoin(materials, eq(purchasingDetails.materialId, materials.id))
            .where(
                and(
                    eq(materials.companyId, companyId),
                    gte(purchasings.date, start),
                    lte(purchasings.date, end)
                )
            );

        const persediaanAwal = 0;
        const pembelianBarang = Number(purchasingSummary?.total || 0);
        const barangTersediaUntukDijual = persediaanAwal + pembelianBarang;

        // Hanya hitung persediaan jika terdapat transaksi/pembelian pada rentang periode yang dipilih
        let persediaanAkhir = 0;
        if (pembelianBarang > 0) {
            const [stockSummary] = await db
                .select({ totalValue: sql`COALESCE(SUM(${products.stock} * ${products.price}), 0)` })
                .from(products)
                .innerJoin(categories, eq(products.categoryId, categories.id))
                .where(eq(categories.companyId, companyId));

            persediaanAkhir = Number(stockSummary?.totalValue || 0);
        }

        const hpp = barangTersediaUntukDijual - persediaanAkhir;

        return {
            companyName: company?.name || 'UMKM',
            periode: `${monthName} ${selectedYear}`,
            data: [
                { keterangan: 'Persediaan awal', jumlah: persediaanAwal, jenis: 'Input', catatan: 'Nilai stok pada awal periode' },
                { keterangan: 'Pembelian barang dagang', jumlah: pembelianBarang, jenis: 'Input', catatan: 'Pembelian selama periode, diasumsikan belum termasuk utang akhir' },
                { keterangan: 'Barang tersedia untuk dijual', jumlah: barangTersediaUntukDijual, jenis: 'Rumus', catatan: '' },
                { keterangan: 'Persediaan akhir', jumlah: persediaanAkhir, jenis: 'Input', catatan: 'Hasil stok opname akhir periode' },
                { keterangan: 'HARGA POKOK BARANG TERJUAL', jumlah: hpp, jenis: 'Rumus', catatan: 'Persediaan awal + pembelian - persediaan akhir' },
            ],
            summary: {
                persediaanAwal,
                pembelianBarang,
                barangTersediaUntukDijual,
                persediaanAkhir,
                hpp,
            },
        };
    }

    // --- 3. LAPORAN ARUS KAS ---
    async getCashFlowReport(companyId, month, year) {
        const { start, end, monthName, year: selectedYear } = this.getDateRange(month, year);
        const company = await db.query.companies.findFirst({ where: eq(companies.id, companyId) });

        const saldoKasAwal = Number(company?.initialCapital || 0);

        // Penerimaan Tunai dari Penjualan
        const [penerimaanSummary] = await db
            .select({ total: sql`COALESCE(SUM(${sales.totalPrice}), 0)` })
            .from(sales)
            .where(
                and(
                    eq(sales.companyId, companyId),
                    gte(sales.createdAt, start),
                    lte(sales.createdAt, end),
                    sql`${sales.paymentMethod} IN ('cash', 'transfer')`,
                    sql`${sales.status} IN ('paid')`
                )
            );

        const penerimaanPenjualan = Number(penerimaanSummary?.total || 0);

        // Pembayaran Biaya Operasional
        const [operasionalSummary] = await db
            .select({ total: sql`COALESCE(SUM(${operationals.amount}), 0)` })
            .from(operationals)
            .where(
                and(
                    eq(operationals.companyId, companyId),
                    gte(operationals.date, start),
                    lte(operationals.date, end)
                )
            );

        const pembayaranBiayaOperasional = Number(operasionalSummary?.total || 0);

        const arusKasBersih = penerimaanPenjualan - pembayaranBiayaOperasional;
        const saldoKasAkhir = saldoKasAwal + arusKasBersih;

        return {
            companyName: company?.name || 'UMKM',
            periode: `${monthName} ${selectedYear}`,
            data: [
                { keterangan: 'Saldo kas awal', jumlah: saldoKasAwal, jenis: 'Input', catatan: 'Saldo kas dan bank awal periode' },
                { keterangan: 'Penerimaan dari penjualan barang', jumlah: penerimaanPenjualan, jenis: 'Input', catatan: 'Penerimaan transfer dari pelanggan' },
                { keterangan: 'Pembayaran biaya operasional', jumlah: -pembayaranBiayaOperasional, jenis: 'Input', catatan: 'Total pembayaran biaya operasional bulan ini' },
                { keterangan: 'ARUS KAS BERSIH PERIODE', jumlah: arusKasBersih, jenis: 'Rumus', catatan: 'Arus kas operasi dan investasi sederhana' },
                { keterangan: 'SALDO KAS AKHIR', jumlah: saldoKasAkhir, jenis: 'Rumus', catatan: 'Terhubung ke Neraca' },
            ],
            summary: {
                saldoKasAwal,
                penerimaanPenjualan,
                pembayaranBiayaOperasional,
                arusKasBersih,
                saldoKasAkhir,
            },
        };
    }

    // --- 4. LAPORAN NERACA ---
    async getBalanceSheetReport(companyId, month, year) {
        const { monthName, year: selectedYear } = this.getDateRange(month, year);
        const company = await db.query.companies.findFirst({ where: eq(companies.id, companyId) });

        const cashFlow = await this.getCashFlowReport(companyId, month, year);
        const inventory = await this.getInventoryReport(companyId, month, year);
        const income = await this.getIncomeStatement(companyId, month, year);

        const kasDanBank = cashFlow.summary.saldoKasAkhir;
        const persediaanAkhir = inventory.summary.persediaanAkhir;
        const totalAset = kasDanBank + persediaanAkhir;

        const utangPemasok = 0;
        const totalLiabilitas = utangPemasok;

        const modalAwal = Number(company?.initialCapital || 0);
        const labaBersih = income.summary.labaBersih;
        const totalEkuitas = modalAwal + labaBersih;

        const totalLiabilitasDanEkuitas = totalLiabilitas + totalEkuitas;
        const selisih = totalAset - totalLiabilitasDanEkuitas;

        return {
            companyName: company?.name || 'UMKM',
            periode: `30 ${monthName} ${selectedYear}`,
            data: {
                aset: [
                    { keterangan: 'Kas dan bank', jumlah: kasDanBank, jenis: 'Rumus', catatan: 'Saldo kas akhir dari laporan arus kas' },
                    { keterangan: 'Persediaan akhir', jumlah: persediaanAkhir, jenis: 'Rumus', catatan: 'Nilai stok akhir' },
                    { keterangan: 'TOTAL ASET', jumlah: totalAset, jenis: 'Rumus', catatan: '' },
                ],
                liabilitas: [
                    { keterangan: 'Utang kepada pemasok', jumlah: utangPemasok, jenis: 'Input', catatan: 'Sisa utang pembelian barang' },
                    { keterangan: 'TOTAL LIABILITAS', jumlah: totalLiabilitas, jenis: 'Rumus', catatan: '' },
                ],
                ekuitas: [
                    { keterangan: 'Modal awal dan setoran pemilik', jumlah: modalAwal, jenis: 'Input', catatan: 'Modal awal termasuk saldo kas awal' },
                    { keterangan: 'Laba bersih periode berjalan', jumlah: labaBersih, jenis: 'Rumus', catatan: 'Terhubung ke laporan laba rugi' },
                    { keterangan: 'TOTAL EKUITAS', jumlah: totalEkuitas, jenis: 'Rumus', catatan: '' },
                ],
                summary: {
                    totalAset,
                    totalLiabilitas,
                    totalEkuitas,
                    totalLiabilitasDanEkuitas,
                    selisih,
                },
            },
        };
    }
}