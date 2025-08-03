import { Router } from 'express';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemStats,
  validateCreateItem,
  validateUpdateItem,
} from '../controllers/itemController';

const router = Router();

// GET /api/items - Get all items
router.get('/', getItems);

// GET /api/items/:id - Get single item
router.get('/:id', getItem);

// GET /api/items/:id/stats - Get item statistics
router.get('/:id/stats', getItemStats);

// POST /api/items - Create new item
router.post('/', validateCreateItem, createItem);

// PUT /api/items/:id - Update item
router.put('/:id', validateUpdateItem, updateItem);

// DELETE /api/items/:id - Delete item
router.delete('/:id', deleteItem);

export default router; 