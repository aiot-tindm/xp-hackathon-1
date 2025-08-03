import { Router } from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
  validateCreateOrder,
  validateUpdateOrder,
} from '../controllers/orderController';

const router = Router();

// GET /api/orders - Get all orders
router.get('/', getOrders);

// GET /api/orders/stats - Get order statistics
router.get('/stats', getOrderStats);

// GET /api/orders/:id - Get single order
router.get('/:id', getOrder);

// POST /api/orders - Create new order
router.post('/', validateCreateOrder, createOrder);

// PUT /api/orders/:id - Update order
router.put('/:id', validateUpdateOrder, updateOrder);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', deleteOrder);

export default router; 