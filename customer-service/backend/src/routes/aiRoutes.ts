import { Router } from 'express';
import {
  analyzeCustomers,
  predictSales,
  optimizeInventory,
  recommendProducts,
  chatbot,
} from '../controllers/aiController';

const router = Router();

// POST /api/ai/customers/analysis - Analyze customers
router.post('/customers/analysis', analyzeCustomers);

// POST /api/ai/sales/prediction - Predict sales
router.post('/sales/prediction', predictSales);

// GET /api/ai/inventory/optimize - Optimize inventory
router.get('/inventory/optimize', optimizeInventory);

// GET /api/ai/products/recommend - Recommend products
router.get('/products/recommend', recommendProducts);

// POST /api/ai/chatbot - Chatbot
router.post('/chatbot', chatbot);

export default router; 