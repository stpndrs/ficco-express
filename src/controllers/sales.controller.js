import { SalesRepository } from '../repositories/sales.repository.js';

const salesRepo = new SalesRepository();

export const createSale = async (req, res) => {
    try {
        const { items, ...saleData } = req.body;
        const companyId = req.companyId; // Ambil otomatis dari middleware

        const result = await salesRepo.createTransaction(companyId, saleData, items);

        return res.status(201).json({
            status: true,
            message: 'Transaction created successfully',
            data: result,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getAllSales = async (req, res) => {
    try {
        const companyId = req.companyId; // Filter otomatis berdasarkan company user yang login
        const result = await salesRepo.findAll({ ...req.query, companyId });

        return res.status(200).json({
            status: true,
            message: 'Sales list fetched successfully',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

export const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await salesRepo.findById(id);

        if (!sale) {
            return res.status(404).json({ status: false, message: 'Transaction not found' });
        }

        return res.status(200).json({
            status: true,
            message: 'Transaction detail fetched successfully',
            data: sale,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const updateSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { items, ...saleData } = req.body;

        const existingSale = await salesRepo.findById(id);
        if (!existingSale) {
            return res.status(404).json({ status: false, message: 'Transaction not found' });
        }

        // Only allow editing if current status is Draft
        if (existingSale.status !== 'draft') {
            return res.status(400).json({
                status: false,
                message: 'Cannot edit transaction. Only transactions with status Draft can be edited.',
            });
        }

        const updated = await salesRepo.updateSale(id, saleData, items);

        return res.status(200).json({
            status: true,
            message: 'Transaction updated successfully',
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const cancelSale = async (req, res) => {
    try {
        const { id } = req.params;

        const existingSale = await salesRepo.findById(id);
        if (!existingSale) {
            return res.status(404).json({ status: false, message: 'Transaction not found' });
        }

        if (existingSale.status === 'Cancel') {
            return res.status(400).json({ status: false, message: 'Transaction is already cancelled' });
        }

        const cancelled = await salesRepo.cancelSale(id);

        return res.status(200).json({
            status: true,
            message: 'Transaction cancelled successfully',
            data: cancelled,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};