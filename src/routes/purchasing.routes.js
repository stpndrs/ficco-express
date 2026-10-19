import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
    createPurchasing,
    createSupplier,
    getAllPurchasings,
    getAllSuppliers,
    getPurchasingById,
} from '../controllers/purchasing.controller.js';
import {
    createPurchasingSchema,
    createSupplierSchema,
    queryPurchasingSchema,
} from '../validations/purchasing.validation.js';

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

// Category Routes
router.post('/suppliers', validateBody(createSupplierSchema), createSupplier);
router.get('/suppliers', getAllSuppliers);

router.post('/', validateBody(createPurchasingSchema), createPurchasing);
router.get('/', validateQuery(queryPurchasingSchema), getAllPurchasings);
router.get('/:id', getPurchasingById);

export default router;