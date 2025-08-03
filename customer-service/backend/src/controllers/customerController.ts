import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../models/database';
import logger from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

// Validation middleware
export const validateCreateCustomer = [
  body('name').isString().notEmpty().withMessage('Customer name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').optional().isString().withMessage('Phone number must be a string'),
];

export const validateUpdateCustomer = [
  body('name').optional().isString().notEmpty().withMessage('Customer name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phoneNumber').optional().isString().withMessage('Phone number must be a string'),
];

// Get all customers with pagination
export const getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          loyalCustomer: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        customers,
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

// Get single customer by ID
export const getCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: {
        loyalCustomer: true,
        orders: {
          take: 10,
          orderBy: { orderDate: 'desc' },
          include: {
            orderItems: {
              include: {
                item: true,
              },
            },
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!customer) {
      throw new CustomError('Customer not found', 404);
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// Create new customer
export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array()?.[0]?.msg || 'Validation error', 400);
    }

    const customerData = req.body;

    // Check if customer email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: customerData.email },
    });

    if (existingCustomer) {
      throw new CustomError('Customer with this email already exists', 400);
    }

    const customer = await prisma.customer.create({
      data: customerData,
    });

    logger.info(`Customer created: ${customer.email}`);

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array()?.[0]?.msg || 'Validation error', 400);
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCustomer) {
      throw new CustomError('Customer not found', 404);
    }

    // Check if email is unique (if being updated)
    if (updateData.email && updateData.email !== existingCustomer.email) {
      const duplicateCustomer = await prisma.customer.findUnique({
        where: { email: updateData.email },
      });

      if (duplicateCustomer) {
        throw new CustomError('Customer email already exists', 400);
      }
    }

    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: updateData,
    });

    logger.info(`Customer updated: ${customer.email}`);

    res.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete customer
export const deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!existingCustomer) {
      throw new CustomError('Customer not found', 404);
    }

    // Check if customer has related orders
    if (existingCustomer._count.orders > 0) {
      throw new CustomError('Cannot delete customer with existing orders', 400);
    }

    await prisma.customer.delete({
      where: { id: Number(id) },
    });

    logger.info(`Customer deleted: ${existingCustomer.email}`);

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
}; 