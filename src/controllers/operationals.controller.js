import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OperationalsRepository } from '../repositories/operationals.repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const operationalsRepo = new OperationalsRepository();

export const createOperational = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            paymentProof: req.file ? `/uploads/operationals/${req.file.filename}` : null
        };

        const operational = await operationalsRepo.createOperational(payload);
        return res.status(201).json({
            status: true,
            message: 'Operational expense recorded successfully',
            data: operational,
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getAllOperationals = async (req, res) => {
    try {
        const result = await operationalsRepo.findAllOperationals(req.query);
        return res.status(200).json({
            status: true,
            message: 'Operational expenses fetched successfully',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getOperationalById = async (req, res) => {
    try {
        const { id } = req.params;
        const operational = await operationalsRepo.findOperationalById(id);

        if (!operational) {
            return res.status(404).json({ status: false, message: 'Operational expense not found' });
        }

        return res.status(200).json({
            status: true,
            message: 'Operational expense details fetched successfully',
            data: operational,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const updateOperational = async (req, res) => {
    try {
        const { id } = req.params;
        const existingOp = await operationalsRepo.findOperationalById(id);

        if (!existingOp) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ status: false, message: 'Operational expense not found' });
        }

        const payload = { ...req.body };

        if (req.file) {
            payload.paymentProof = `/uploads/operationals/${req.file.filename}`;

            if (existingOp.paymentProof && existingOp.paymentProof.startsWith('/uploads')) {
                const oldPath = path.join(__dirname, '../..', existingOp.paymentProof);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        const updated = await operationalsRepo.updateOperational(id, payload);
        return res.status(200).json({
            status: true,
            message: 'Operational expense updated successfully',
            data: updated,
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(500).json({ status: false, message: error.message });
    }
};