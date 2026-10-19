import { MaterialsRepository } from '../repositories/materials.repository.js';

const materialsRepo = new MaterialsRepository();

export const createMaterial = async (req, res) => {
    try {
        const companyId = req.companyId; // Ambil otomatis dari middleware
        const material = await materialsRepo.createMaterial(companyId, req.body);

        return res.status(201).json({
            status: true,
            message: 'Material created successfully',
            data: material,
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getAllMaterials = async (req, res) => {
    try {
        const companyId = req.companyId;
        const result = await materialsRepo.findAllMaterials({ ...req.query, companyId });

        return res.status(200).json({
            status: true,
            message: 'Materials list fetched successfully',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getMaterialById = async (req, res) => {
    try {
        const { id } = req.params;
        const material = await materialsRepo.findMaterialById(id);

        if (!material) {
            return res.status(404).json({ status: false, message: 'Material not found' });
        }

        return res.status(200).json({
            status: true,
            message: 'Material detail fetched successfully',
            data: material,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const existingMaterial = await materialsRepo.findMaterialById(id);

        if (!existingMaterial) {
            return res.status(404).json({ status: false, message: 'Material not found' });
        }

        const updated = await materialsRepo.updateMaterial(id, req.body);
        return res.status(200).json({
            status: true,
            message: 'Material updated successfully',
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};
export const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const existingMaterial = await materialsRepo.findMaterialById(id);
        if (!existingMaterial) {
            return res.status(404).json({ status: false, message: 'Material not found' });
        }

        const updated = await materialsRepo.toggleMaterialStatus(id, isActive);
        return res.status(200).json({
            status: true,
            message: `Material status updated to ${isActive ? 'active' : 'inactive'}`,
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};