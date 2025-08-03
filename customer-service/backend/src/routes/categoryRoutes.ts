import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  validateCreateCategory,
  validateUpdateCategory,
} from '../controllers/categoryController';

const router = Router();

// GET /api/categories - Get all categories
router.get('/', getCategories);

// GET /api/categories/:id - Get single category
router.get('/:id', getCategory);

// POST /api/categories - Create new category
router.post('/', validateCreateCategory, createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', validateUpdateCategory, updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', deleteCategory);

export default router; 