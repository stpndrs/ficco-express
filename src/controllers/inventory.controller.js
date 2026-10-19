import { InventoryRepository } from '../repositories/inventory.repository.js';

const inventoryRepo = new InventoryRepository();

export const getAllInventory = async (req, res) => {
    try {
        const result = await inventoryRepo.findAll(req.query);

        return res.status(200).json({
            status: true,
            message: 'Daftar inventaris berhasil diambil',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getInventoryDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const detail = await inventoryRepo.findDetail(id);

        if (!detail) {
            return res.status(404).json({ status: false, message: 'Data inventaris tidak ditemukan' });
        }

        return res.status(200).json({
            status: true,
            message: 'Detail inventaris berhasil diambil',
            data: detail,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};