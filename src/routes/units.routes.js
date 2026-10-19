import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
    getAllUnits,
} from '../controllers/units.controller.js';

const router = Router();
router.use(authenticate);

// Category Routes
router.get('/', getAllUnits);

export default router;