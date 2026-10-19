import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
    getAllProductions,
    getProductionById,
    createProduction,
    updateProduction,
    deleteProduction,
} from '../controllers/production.controller.js';
import {
    createProductionSchema,
    updateProductionSchema,
} from '../validations/production.validation.js';

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    req.body = result.data;
    next();
};

const router = Router();
router.use(authenticate);

router.get('/', getAllProductions);
router.get('/:id', getProductionById);
router.post('/', validate(createProductionSchema), createProduction);
router.put('/:id', validate(updateProductionSchema), updateProduction);

export default router;