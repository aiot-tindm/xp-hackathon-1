import { Router } from 'express';
import aiRoutes from './aiRoutes';
import analyticsRoutes from './analyticsRoutes';
import customerAnalyticsRoutes from './customerAnalyticsRoutes';
import importRoutes from './importRoutes';
import itemRoutes from './itemRoutes';
import orderRoutes from './orderRoutes';
import brandRoutes from './brandRoutes';
import categoryRoutes from './categoryRoutes';
import customerRoutes from './customerRoutes';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Items
 *     description: Product inventory management
 *   - name: Orders
 *     description: Sales order management
 *   - name: Brands
 *     description: Brand management
 *   - name: Categories
 *     description: Category management
 *   - name: Customers
 *     description: Customer management
 *   - name: Customer Analytics
 *     description: Advanced customer analytics and insights
 *   - name: Analytics
 *     description: General business analytics
 *   - name: Import
 *     description: Data import functionality
 */

// Core Business Routes
router.use('/items', itemRoutes);
router.use('/orders', orderRoutes);
router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);

// AI and Analytics routes
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/analytics/customers', customerAnalyticsRoutes);
router.use('/import', importRoutes);

export default router; 