import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    toggleUserStatus,
    getProfile,
    updateProfile,
} from '../controllers/users.controller.js';
import {
    createUserSchema,
    updateUserSchema,
    queryUserSchema,
    updateProfileSchema,
} from '../validations/users.validation.js';

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

// Profile Routes
router.get('/profile', getProfile);
router.put('/profile', validateBody(updateProfileSchema), updateProfile);

// User CRUD Routes
router.post('/', validateBody(createUserSchema), createUser);
router.get('/', validateQuery(queryUserSchema), getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', validateBody(updateUserSchema), updateUser);
router.patch('/:id/status', toggleUserStatus);

export default router;