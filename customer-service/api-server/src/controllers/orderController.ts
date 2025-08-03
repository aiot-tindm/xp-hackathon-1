import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../models/database';
import logger from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

// Validation middleware
export const validateCreateOrder = [
  body('orderCode').isString().notEmpty().withMessage('Order code is required'),
  body('customerId').isInt({ min: 1 }).withMessage('Customer ID is required'),
  body('platform').isString().notEmpty().withMessage('Platform is required'),
  body('status').isString().notEmpty().withMessage('Status is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.itemId').isInt({ min: 1 }).withMessage('Item ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('items.*.pricePerUnit').isFloat({ min: 0 }).withMessage('Price per unit must be positive'),
];

export const validateUpdateOrder = [
  body('orderCode').optional().isString().notEmpty().withMessage('Order code cannot be empty'),
  body('customerId').optional().isInt({ min: 1 }).withMessage('Customer ID must be positive'),
  body('platform').optional().isString().notEmpty().withMessage('Platform cannot be empty'),
  body('status').optional().isString().notEmpty().withMessage('Status cannot be empty'),
];

// Get all orders with pagination
export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, customerId, platform, status, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (customerId) where.customerId = Number(customerId);
    if (platform) where.platform = { contains: platform as string };
    if (status) where.status = { contains: status as string };
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate as string);
      if (endDate) where.orderDate.lte = new Date(endDate as string);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          customer: true,
          orderItems: {
            include: {
              item: true,
            },
          },
        },
        orderBy: { orderDate: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        orders,
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

// Get single order by ID
export const getOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        orderItems: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!order) {
      throw new CustomError('Order not found', 404);
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Create new order
export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array()?.[0]?.msg || 'Validation error', 400);
    }

    const orderData = req.body;

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx: any) => {
      // Check if customer exists
      const customer = await tx.customer.findUnique({
        where: { id: orderData.customerId },
      });

      if (!customer) {
        throw new CustomError('Customer not found', 404);
      }

      // Check if order code already exists
      const existingOrder = await tx.order.findUnique({
        where: { orderCode: orderData.orderCode },
      });

      if (existingOrder) {
        throw new CustomError('Order code already exists', 400);
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderCode: orderData.orderCode,
          customerId: orderData.customerId,
          shippingLocation: orderData.shippingLocation,
          platform: orderData.platform,
          status: orderData.status,
          refundReason: orderData.refundReason,
        },
      });

      // Create order items and update item stock
      const orderItems = [];
      for (const item of orderData.items) {
        // Check if item exists and has sufficient stock
        const dbItem = await tx.item.findUnique({
          where: { id: item.itemId },
        });

        if (!dbItem) {
          throw new CustomError(`Item with ID ${item.itemId} not found`, 404);
        }

        if (!dbItem.isActive) {
          throw new CustomError(`Item ${dbItem.sku} is not active`, 400);
        }

        if (dbItem.stockQuantity < item.quantity) {
          throw new CustomError(`Insufficient stock for item ${dbItem.sku}`, 400);
        }

        // Create order item
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            itemId: item.itemId,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            discountAmount: item.discountAmount || 0,
          },
        });

        // Update item stock
        await tx.item.update({
          where: { id: item.itemId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        orderItems.push(orderItem);
      }

      return { order, orderItems };
    });

    logger.info(`Order created: ${result.order.orderCode} for customer ${result.order.customerId}`);

    res.status(201).json({
      success: true,
      data: result.order,
      message: 'Order created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update order
export const updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(errors.array()?.[0]?.msg || 'Validation error', 400);
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: Number(id) },
    });

    if (!existingOrder) {
      throw new CustomError('Order not found', 404);
    }

    // Check if customer exists (if being updated)
    if (updateData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: updateData.customerId },
      });
      if (!customer) {
        throw new CustomError('Customer not found', 404);
      }
    }

    // Check if order code is unique (if being updated)
    if (updateData.orderCode && updateData.orderCode !== existingOrder.orderCode) {
      const duplicateOrder = await prisma.order.findUnique({
        where: { orderCode: updateData.orderCode },
      });

      if (duplicateOrder) {
        throw new CustomError('Order code already exists', 400);
      }
    }

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        customer: true,
        orderItems: {
          include: {
            item: true,
          },
        },
      },
    });

    logger.info(`Order updated: ${order.orderCode}`);

    res.json({
      success: true,
      data: order,
      message: 'Order updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete order
export const deleteOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        orderItems: true,
      },
    });

    if (!existingOrder) {
      throw new CustomError('Order not found', 404);
    }

    // Use transaction to restore item stock and delete order
    await prisma.$transaction(async (tx: any) => {
      // Restore item stock
      for (const orderItem of existingOrder.orderItems) {
        await tx.item.update({
          where: { id: orderItem.itemId },
          data: {
            stockQuantity: {
              increment: orderItem.quantity,
            },
          },
        });
      }

      // Delete order (orderItems will be deleted automatically due to CASCADE)
      await tx.order.delete({
        where: { id: Number(id) },
      });
    });

    logger.info(`Order deleted: ${existingOrder.orderCode}`);

    res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get order statistics
export const getOrderStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, platform } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate as string);
      if (endDate) where.orderDate.lte = new Date(endDate as string);
    }
    if (platform) where.platform = platform;

    const [totalOrders, totalRevenue, avgOrderValue, platformStats] = await Promise.all([
      // Total orders
      prisma.order.count({ where }),
      // Total revenue
      prisma.orderItem.aggregate({
        where: {
          order: where,
        },
        _sum: {
          pricePerUnit: true,
        },
      }),
      // Average order value
      prisma.orderItem.aggregate({
        where: {
          order: where,
        },
        _avg: {
          pricePerUnit: true,
        },
      }),
      // Orders by platform
      prisma.order.groupBy({
        by: ['platform'],
        where,
        _count: {
          id: true,
        },
      }),
    ]);

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue._sum.pricePerUnit || 0,
      avgOrderValue: avgOrderValue._avg.pricePerUnit || 0,
      platformStats: platformStats.map((stat: any) => ({
        platform: stat.platform,
        orders: stat._count.id,
      })),
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
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
}; 