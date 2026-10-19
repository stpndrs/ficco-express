import { UnitsRepository } from "../repositories/units.repository.js";

const unitsRepo = new UnitsRepository();

export const getAllUnits = async (req, res) => {
    try {
        const result = await unitsRepo.findAllUnits();
        return res.status(200).json({
            status: true,
            message: 'Units list fetched successfully',
            data: result,
            meta: null
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: false, message: error.message });
    }
};