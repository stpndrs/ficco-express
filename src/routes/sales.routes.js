import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
    createSale,
    getAllSales,
    getSaleById,
    updateSale,
    cancelSale,
} from '../controllers/sales.controller.js';
import {
    createSaleSchema,
    updateSaleSchema,
    querySaleSchema,
} from '../validations/sales.validation.js';

const validateBody = (schema) => (req, res, next) => {
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

const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation query error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, result.data);
    next();
};

const router = Router();
router.use(authenticate);


router.post('/', validateBody(createSaleSchema), createSale);
router.get('/', validateQuery(querySaleSchema), getAllSales);
router.get('/:id', getSaleById);
router.put('/:id', validateBody(updateSaleSchema), updateSale);
router.patch('/:id/cancel', cancelSale);

export default router;