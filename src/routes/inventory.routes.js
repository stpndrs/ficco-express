import { Router } from 'express';
import { getAllInventory, getInventoryDetail } from '../controllers/inventory.controller.js';
import { queryInventorySchema } from '../validations/inventory.validation.js';
import { authenticate } from '../middlewares/auth.middleware.js';

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

router.get('/', validateQuery(queryInventorySchema), getAllInventory);
router.get('/:id', getInventoryDetail);

export default router;