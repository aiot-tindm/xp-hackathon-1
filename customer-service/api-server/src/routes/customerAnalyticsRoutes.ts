import { Router } from 'express';
import {
  getIndividualCustomerAnalysis,
  getCustomerPredictions,
  getCustomerRFMAnalysis,
  getCustomerChurnPrediction,
  getPotentialCustomersForProducts,
  getNewInventoryCustomerMatching,
} from '../controllers/customerAnalyticsController';
import { getCustomerAnalytics } from '../controllers/customerAnalyticsController';

const router = Router();

/**
 * @swagger
 * /api/analytics/customers:
 *   get:
 *     summary: Get customer analytics overview
 *     description: Retrieve comprehensive customer analytics including segmentation, filters, and business types
 *     tags: [Customer Analytics]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *           enum: [default, high_value, small_business, high_frequency, electronics, fashion_sports]
 *         description: Business type for segmentation
 *     responses:
 *       200:
 *         description: Customer analytics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerAnalytics'
 */
router.get('/', getCustomerAnalytics);

/**
 * @swagger
 * /api/analytics/customers/predictions:
 *   post:
 *     summary: Get customer predictions and trends
 *     description: Retrieve CLV predictions, churn risk, and product recommendations for customers
 *     tags: [Customer Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of customer IDs to analyze
 *               includeRecommendations:
 *                 type: boolean
 *                 default: true
 *                 description: Include product recommendations
 *     responses:
 *       200:
 *         description: Customer predictions data
 */
router.post('/predictions', getCustomerPredictions);

/**
 * @swagger
 * /api/analytics/customers/rfm:
 *   get:
 *     summary: Get customer RFM analysis
 *     description: Analyze customers using Recency, Frequency, Monetary scoring
 *     tags: [Customer Analytics]
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: Specific customer ID to analyze
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *           enum: [default, high_value, small_business, high_frequency, electronics, fashion_sports]
 *         description: Business type for RFM thresholds
 *     responses:
 *       200:
 *         description: RFM analysis data
 */
router.get('/rfm', getCustomerRFMAnalysis);

/**
 * @swagger
 * /api/analytics/customers/churn-prediction:
 *   get:
 *     summary: Get customer churn prediction
 *     description: Predict which customers are likely to churn
 *     tags: [Customer Analytics]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Days threshold for churn prediction
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *           enum: [default, high_value, small_business, high_frequency, electronics, fashion_sports]
 *         description: Business type for churn thresholds
 *     responses:
 *       200:
 *         description: Churn prediction data
 */
router.get('/churn-prediction', getCustomerChurnPrediction);

/**
 * @swagger
 * /api/analytics/customers/new-inventory-matching:
 *   get:
 *     summary: Get potential customer suggestions for products
 *     description: Find customers interested in specific products or categories
 *     tags: [Customer Analytics]
 *     parameters:
 *       - in: query
 *         name: productIds
 *         schema:
 *           type: string
 *         description: Comma-separated product IDs
 *       - in: query
 *         name: categoryIds
 *         schema:
 *           type: string
 *         description: Comma-separated category IDs
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of customers to return
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *           enum: [default, high_value, small_business, high_frequency, electronics, fashion_sports]
 *         description: Business type for scoring
 *     responses:
 *       200:
 *         description: Potential customer suggestions
 */
router.get('/new-inventory-matching', getPotentialCustomersForProducts);

/**
 * @swagger
 * /api/analytics/customers/{customerId}:
 *   get:
 *     summary: Get individual customer analysis
 *     description: Detailed analysis of a specific customer
 *     tags: [Customer Analytics]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Days for trend analysis
 *     responses:
 *       200:
 *         description: Individual customer analysis data
 *       404:
 *         description: Customer not found
 */
router.get('/:customerId', getIndividualCustomerAnalysis);

export default router; 