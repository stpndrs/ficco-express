import { PurchasingRepository } from '../repositories/purchasing.repository.js';

const purchasingRepo = new PurchasingRepository();

export const createSupplier = async (req, res) => {
    try {
        const supplierData = req.body;
        const companyId = req.companyId;
        const result = await purchasingRepo.createSupplier(companyId, supplierData);

        return res.status(201).json({
            status: true,
            message: 'Supplier Pembelian berhasil dibuat',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getAllSuppliers = async (req, res) => {
    try {
        const companyId = req.companyId;
        const supplierList = await purchasingRepo.findAllSupplier(companyId);
        return res.status(200).json({
            status: true,
            message: 'Supplier fetched successfully',
            data: supplierList,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const createPurchasing = async (req, res) => {
    try {
        const { items, ...purchasingData } = req.body;
        const result = await purchasingRepo.createPurchasing(purchasingData, items);

        return res.status(201).json({
            status: true,
            message: 'Transaksi Pembelian berhasil dibuat',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getAllPurchasings = async (req, res) => {
    try {
        const result = await purchasingRepo.findAll(req.query);

        return res.status(200).json({
            status: true,
            message: 'Daftar transaksi pembelian berhasil diambil',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getPurchasingById = async (req, res) => {
    try {
        const { id } = req.params;
        const purchasing = await purchasingRepo.findById(id);

        if (!purchasing) {
            return res.status(404).json({ status: false, message: 'Transaksi tidak ditemukan' });
        }

        return res.status(200).json({
            status: true,
            message: 'Detail transaksi pembelian berhasil diambil',
            data: purchasing,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};