import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
    createMaterial,
    getAllMaterials,
    getMaterialById,
    updateMaterial,
    toggleStatus,
} from '../controllers/materials.controller.js';
import {
    createMaterialSchema,
    updateMaterialSchema,
    queryMaterialSchema,
} from '../validations/materials.validation.js';

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

router.post('/', validateBody(createMaterialSchema), createMaterial);
router.get('/', validateQuery(queryMaterialSchema), getAllMaterials);
router.get('/:id', getMaterialById);
router.put('/:id', validateBody(updateMaterialSchema), updateMaterial);
router.patch('/:id/status', toggleStatus);

export default router;