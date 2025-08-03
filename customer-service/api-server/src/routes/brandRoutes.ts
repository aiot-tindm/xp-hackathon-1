import { Router } from 'express';
import {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  validateCreateBrand,
  validateUpdateBrand,
} from '../controllers/brandController';

const router = Router();

// GET /api/brands - Get all brands
router.get('/', getBrands);

// GET /api/brands/:id - Get single brand
router.get('/:id', getBrand);

// POST /api/brands - Create new brand
router.post('/', validateCreateBrand, createBrand);

// PUT /api/brands/:id - Update brand
router.put('/:id', validateUpdateBrand, updateBrand);

// DELETE /api/brands/:id - Delete brand
router.delete('/:id', deleteBrand);

export default router; 