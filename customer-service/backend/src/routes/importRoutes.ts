import { Router } from 'express';
import multer from 'multer';
import { ImportController } from '../controllers/importController';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// CSV Import Routes (New Schema)
router.post('/brands', upload.single('csv'), ImportController.importBrands);
router.post('/categories', upload.single('csv'), ImportController.importCategories);
router.post('/customers', upload.single('csv'), ImportController.importCustomers);
router.post('/items', upload.single('csv'), ImportController.importItems);
router.post('/orders', upload.single('csv'), ImportController.importOrders);
router.post('/order-items', upload.single('csv'), ImportController.importOrderItems);

// Import all data in sequence (accepts multiple CSV files)
router.post('/all', upload.fields([
  { name: 'brands', maxCount: 1 },
  { name: 'categories', maxCount: 1 },
  { name: 'customers', maxCount: 1 },
  { name: 'items', maxCount: 1 },
  { name: 'orders', maxCount: 1 },
  { name: 'order_items', maxCount: 1 }
]), ImportController.importAllData);

export default router; 