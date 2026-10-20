import { CodeRepository } from '../repositories/code.repository.js';

const codeRepo = new CodeRepository();

export const getGeneratedCode = async (req, res) => {
    try {
        let type = req.query.type
        const companyId = req.companyId;
        let result
        if (type === 'operational') {
            result = await codeRepo.generateOperationalCode(companyId);
        } else if (type === 'purchasing') {
            result = await codeRepo.generatePurchasingCode();
        } else if (type === 'sale') {
            result = await codeRepo.generateSaleCode(companyId)
        } else if (type === 'production') {
            result = await codeRepo.generateProductionCode(companyId)
        } else if (type === 'material') {
            result = await codeRepo.generateMaterialCode(companyId)
        } else if (type === 'category') {
            result = await codeRepo.generateCategoryCode(companyId)
        }

        return res.status(200).json({
            status: true,
            message: 'Code repository fetched successfully',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}