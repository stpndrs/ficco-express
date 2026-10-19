import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadProductImage } from '../middlewares/uploadProductImage.middleware.js';
import {
    createCategory,
    getAllCategories,
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    toggleStatus,
} from '../controllers/products.controller.js';
import {
    createCategorySchema,
    createProductSchema,
    updateProductSchema,
    queryProductSchema,
} from '../validations/products.validation.js';

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
router.post('/categories', validateBody(createCategorySchema), createCategory);
router.get('/categories', getAllCategories);

// Product Routes (termasuk uploadProductImage single image 'images')
router.post('/', uploadProductImage.single('images'), validateBody(createProductSchema), createProduct);
router.get('/', validateQuery(queryProductSchema), getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', uploadProductImage.single('images'), validateBody(updateProductSchema), updateProduct);
router.patch('/:id/status', toggleStatus);

export default router;