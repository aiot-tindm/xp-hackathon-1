import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../models/database';
import logger from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

// Validation middleware
export const validateCreateBrand = [
  body('name').isString().notEmpty().withMessage('Brand name is required'),
];

export const validateUpdateBrand = [
  body('name').isString().notEmpty().withMessage('Brand name cannot be empty'),
];

// Get all brands with pagination
export const getBrands = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.name = { contains: search as string };
    }

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
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
      prisma.brand.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        brands,
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

// Get single brand by ID
export const getBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
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

    if (!brand) {
      throw new CustomError('Brand not found', 404);
    }

    res.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};

// Create new brand
export const createBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array()?.[0]?.msg || 'Validation error', 400);
    }

    const brandData = req.body;

    // Check if brand name already exists
    const existingBrand = await prisma.brand.findUnique({
      where: { name: brandData.name },
    });

    if (existingBrand) {
      throw new CustomError('Brand with this name already exists', 400);
    }

    const brand = await prisma.brand.create({
      data: brandData,
    });

    logger.info(`Brand created: ${brand.name}`);

    res.status(201).json({
      success: true,
      data: brand,
      message: 'Brand created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update brand
export const updateBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array()?.[0]?.msg || 'Validation error', 400);
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: Number(id) },
    });

    if (!existingBrand) {
      throw new CustomError('Brand not found', 404);
    }

    // Check if name is unique (if being updated)
    if (updateData.name && updateData.name !== existingBrand.name) {
      const duplicateBrand = await prisma.brand.findUnique({
        where: { name: updateData.name },
      });

      if (duplicateBrand) {
        throw new CustomError('Brand name already exists', 400);
      }
    }

    const brand = await prisma.brand.update({
      where: { id: Number(id) },
      data: updateData,
    });

    logger.info(`Brand updated: ${brand.name}`);

    res.json({
      success: true,
      data: brand,
      message: 'Brand updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete brand
export const deleteBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!existingBrand) {
      throw new CustomError('Brand not found', 404);
    }

    // Check if brand has related items
    if (existingBrand._count.items > 0) {
      throw new CustomError('Cannot delete brand with existing items', 400);
    }

    await prisma.brand.delete({
      where: { id: Number(id) },
    });

    logger.info(`Brand deleted: ${existingBrand.name}`);

    res.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
}; 