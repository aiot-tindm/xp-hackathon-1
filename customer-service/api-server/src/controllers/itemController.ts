import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../models/database';
import logger from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

// Validation middleware
export const validateCreateItem = [
  body('sku').isString().isLength({ min: 1, max: 100 }).withMessage('SKU is required and must be 1-100 characters'),
  body('name').isString().notEmpty().withMessage('Item name is required'),
  body('salePrice').isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('brandId').optional().isInt({ min: 1 }).withMessage('Brand ID must be a positive integer'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
];

export const validateUpdateItem = [
  body('name').optional().isString().notEmpty().withMessage('Item name cannot be empty'),
  body('salePrice').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('brandId').optional().isInt({ min: 1 }).withMessage('Brand ID must be a positive integer'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Get all items with pagination and filtering
export const getItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, brandId, categoryId, search, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    if (brandId) where.brandId = Number(brandId);
    if (categoryId) where.categoryId = Number(categoryId);
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
                  { name: { contains: search as string } },
          { sku: { contains: search as string } },
      ];
    }

    // Get items and count
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          brand: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.item.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single item by ID
export const getItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await prisma.item.findUnique({
      where: { id: Number(id) },
      include: {
        brand: true,
        category: true,
        orderItems: {
          include: {
            order: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!item) {
      throw new CustomError('Item not found', 404);
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// Create new item
export const createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array()?.[0]?.msg || 'Validation error', 400);
    }

    const itemData = req.body;

    // Check if SKU already exists
    const existingItem = await prisma.item.findUnique({
      where: { sku: itemData.sku },
    });

    if (existingItem) {
      throw new CustomError('Item with this SKU already exists', 400);
    }

    // Check if brand exists (if provided)
    if (itemData.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: itemData.brandId },
      });
      if (!brand) {
        throw new CustomError('Brand not found', 404);
      }
    }

    // Check if category exists (if provided)
    if (itemData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: itemData.categoryId },
      });
      if (!category) {
        throw new CustomError('Category not found', 404);
      }
    }

    const item = await prisma.item.create({
      data: itemData,
      include: {
        brand: true,
        category: true,
      },
    });

    logger.info(`Item created: ${item.sku}`);

    res.status(201).json({
      success: true,
      data: item,
      message: 'Item created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update item
export const updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array()?.[0]?.msg || 'Validation error', 400);
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem) {
      throw new CustomError('Item not found', 404);
    }

    // Check if brand exists (if being updated)
    if (updateData.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: updateData.brandId },
      });
      if (!brand) {
        throw new CustomError('Brand not found', 404);
      }
    }

    // Check if category exists (if being updated)
    if (updateData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updateData.categoryId },
      });
      if (!category) {
        throw new CustomError('Category not found', 404);
      }
    }

    const item = await prisma.item.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        brand: true,
        category: true,
      },
    });

    logger.info(`Item updated: ${item.sku}`);

    res.json({
      success: true,
      data: item,
      message: 'Item updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete item
export const deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!existingItem) {
      throw new CustomError('Item not found', 404);
    }

    // Check if item has related orders
    if (existingItem._count.orderItems > 0) {
      throw new CustomError('Cannot delete item with existing orders', 400);
    }

    await prisma.item.delete({
      where: { id: Number(id) },
    });

    logger.info(`Item deleted: ${existingItem.sku}`);

    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get item statistics
export const getItemStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const [item, totalOrders, totalSold, totalRevenue] = await Promise.all([
      prisma.item.findUnique({ 
        where: { id: Number(id) },
        include: {
          brand: true,
          category: true,
        },
      }),
      prisma.orderItem.aggregate({
        where: { itemId: Number(id) },
        _count: { id: true },
      }),
      prisma.orderItem.aggregate({
        where: { itemId: Number(id) },
        _sum: { quantity: true },
      }),
      prisma.orderItem.aggregate({
        where: { itemId: Number(id) },
        _sum: { 
          pricePerUnit: true,
        },
      }),
    ]);

    if (!item) {
      throw new CustomError('Item not found', 404);
    }

    const stats = {
      item,
      totalOrders: totalOrders._count.id,
      totalSold: totalSold._sum.quantity || 0,
      totalRevenue: totalRevenue._sum.pricePerUnit || 0,
      currentStock: item.stockQuantity,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemStats,
}; 