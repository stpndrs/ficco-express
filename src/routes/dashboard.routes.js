import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
    aiFinanceCopilot,
    getStockForecasting,
    simulateCostAndMargin,
    getProductionWasteAnalysis,
    getProductTrendAndBasket,
} from '../controllers/dashboard.controller.js';
import {
    aiCopilotSchema,
    stockForecastingSchema,
    marginSimulatorSchema,
} from '../validations/dashboard.validation.js';

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

// 1. AI Copilot
router.post('/ai-copilot', validateBody(aiCopilotSchema), aiFinanceCopilot);

// 2. Smart Stock Forecasting
router.get('/stock-forecasting', validateQuery(stockForecastingSchema), getStockForecasting);

// 3. Cost & Margin Simulator
router.post('/margin-simulator', validateBody(marginSimulatorSchema), simulateCostAndMargin);

// 4. Production & Waste Analysis
router.get('/waste-analysis', getProductionWasteAnalysis);

// 5. Product Trend & Basket Analysis
router.get('/product-trends', getProductTrendAndBasket);

export default router;