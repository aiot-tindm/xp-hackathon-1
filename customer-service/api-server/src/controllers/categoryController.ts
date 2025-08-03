import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../models/database';
import logger from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

// Validation middleware
export const validateCreateCategory = [
  body('name').isString().notEmpty().withMessage('Category name is required'),
];

export const validateUpdateCategory = [
  body('name').isString().notEmpty().withMessage('Category name cannot be empty'),
];

// Get all categories with pagination
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.name = { contains: search as string };
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        categories,
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

// Get single category by ID
export const getCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!category) {
      throw new CustomError('Category not found', 404);
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Create new category
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array()?.[0]?.msg || 'Validation error', 400);
    }

    const categoryData = req.body;

    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: categoryData.name },
    });

    if (existingCategory) {
      throw new CustomError('Category with this name already exists', 400);
    }

    const category = await prisma.category.create({
      data: categoryData,
    });

    logger.info(`Category created: ${category.name}`);

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update category
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array()?.[0]?.msg || 'Validation error', 400);
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCategory) {
      throw new CustomError('Category not found', 404);
    }

    // Check if name is unique (if being updated)
    if (updateData.name && updateData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findUnique({
        where: { name: updateData.name },
      });

      if (duplicateCategory) {
        throw new CustomError('Category name already exists', 400);
      }
    }

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: updateData,
    });

    logger.info(`Category updated: ${category.name}`);

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!existingCategory) {
      throw new CustomError('Category not found', 404);
    }

    // Check if category has related items
    if (existingCategory._count.items > 0) {
      throw new CustomError('Cannot delete category with existing items', 400);
    }

    await prisma.category.delete({
      where: { id: Number(id) },
    });

    logger.info(`Category deleted: ${existingCategory.name}`);

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
}; 