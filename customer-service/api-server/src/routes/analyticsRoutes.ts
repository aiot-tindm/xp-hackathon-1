import { Router } from 'express';
import {
  getSalesAnalytics,
  getInventoryAnalytics,
  getRevenueAnalytics,
} from '../controllers/analyticsController';
import customerAnalyticsRouter from './customerAnalyticsRoutes';

const router = Router();

// GET /api/analytics/sales - Get sales analytics
router.get('/sales', getSalesAnalytics);

// GET /api/analytics/inventory - Get inventory analytics
router.get('/inventory', getInventoryAnalytics);


// GET /api/analytics/revenue - Get revenue analytics
router.get('/revenue', getRevenueAnalytics);

// Customer Analytics APIs
router.use('/customers', customerAnalyticsRouter);

export default router; 