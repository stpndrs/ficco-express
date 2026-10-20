import { Router } from 'express';
import { getGeneratedCode } from '../controllers/code.controller.js';

const router = Router();

router.get('/generate', getGeneratedCode);

export default router;