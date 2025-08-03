import { Router } from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  validateCreateCustomer,
  validateUpdateCustomer,
} from '../controllers/customerController';

const router = Router();

// GET /api/customers - Get all customers
router.get('/', getCustomers);

// GET /api/customers/:id - Get single customer
router.get('/:id', getCustomer);

// POST /api/customers - Create new customer
router.post('/', validateCreateCustomer, createCustomer);

// PUT /api/customers/:id - Update customer
router.put('/:id', validateUpdateCustomer, updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', deleteCustomer);

export default router; 