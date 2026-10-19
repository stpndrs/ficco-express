import { ProductionRepository } from '../repositories/production.repository.js';

const productionRepo = new ProductionRepository();

export const getAllProductions = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, date, } = req.query;
        const companyId = req.companyId;
        const result = await productionRepo.findAll({ page, limit, search, date, companyId });

        return res.status(200).json({
            status: true,
            message: 'Productions retrieved successfully',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getProductionById = async (req, res) => {
    try {
        const { id } = req.params;
        const production = await productionRepo.findById(id);

        if (!production) {
            return res.status(404).json({ status: false, message: 'Production record not found' });
        }

        return res.status(200).json({
            status: true,
            message: 'Production record retrieved successfully',
            data: production,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const createProduction = async (req, res) => {
    try {
        const companyId = req.companyId;
        const newProduction = await productionRepo.create(req.body, companyId);

        return res.status(201).json({
            status: true,
            message: 'Production batch logged successfully',
            data: newProduction,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const updateProduction = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await productionRepo.findById(id);

        if (!existing) {
            return res.status(404).json({ status: false, message: 'Production record not found' });
        }

        const updated = await productionRepo.update(id, req.body);

        return res.status(200).json({
            status: true,
            message: 'Production record updated successfully',
            data: updated,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const deleteProduction = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await productionRepo.findById(id);

        if (!existing) {
            return res.status(404).json({ status: false, message: 'Production record not found' });
        }

        await productionRepo.delete(id);

        return res.status(200).json({
            status: true,
            message: 'Production record deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};