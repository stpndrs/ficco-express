import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadReceiptImage } from '../middlewares/uploadOperationalReceipt.middleware.js';
import {
    createOperational,
    getAllOperationals,
    getOperationalById,
    updateOperational,
} from '../controllers/operationals.controller.js';
import {
    createOperationalSchema,
    updateOperationalSchema,
    queryOperationalSchema,
} from '../validations/operationals.validation.js';

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

router.post('/', uploadReceiptImage.single('paymentProof'), validateBody(createOperationalSchema), createOperational);
router.get('/', validateQuery(queryOperationalSchema), getAllOperationals);
router.get('/:id', getOperationalById);
router.put('/:id', uploadReceiptImage.single('paymentProof'), validateBody(updateOperationalSchema), updateOperational);

export default router;