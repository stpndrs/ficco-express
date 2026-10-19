import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
    getIncomeStatement,
    exportIncomeStatementExcel,
    exportIncomeStatementPDF,
    getInventoryReport,
    exportInventoryExcel,
    getCashFlowReport,
    exportCashFlowExcel,
    getBalanceSheetReport,
    exportBalanceSheetExcel,
} from '../controllers/reports.controller.js';
import { reportQuerySchema } from '../validations/reports.validation.js';

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

// 1. Laba Rugi Routes
router.get('/income-statement', validateQuery(reportQuerySchema), getIncomeStatement);
router.get('/income-statement/excel', validateQuery(reportQuerySchema), exportIncomeStatementExcel);
router.get('/income-statement/pdf', validateQuery(reportQuerySchema), exportIncomeStatementPDF);

// 2. Persediaan Routes
router.get('/inventory', validateQuery(reportQuerySchema), getInventoryReport);
router.get('/inventory/excel', validateQuery(reportQuerySchema), exportInventoryExcel);

// 3. Arus Kas Routes
router.get('/cash-flow', validateQuery(reportQuerySchema), getCashFlowReport);
router.get('/cash-flow/excel', validateQuery(reportQuerySchema), exportCashFlowExcel);

// 4. Neraca Routes
router.get('/balance-sheet', validateQuery(reportQuerySchema), getBalanceSheetReport);
router.get('/balance-sheet/excel', validateQuery(reportQuerySchema), exportBalanceSheetExcel);

export default router;