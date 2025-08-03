import { Request, Response, NextFunction } from 'express';
import prisma from '../models/database';
import logger from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

// Sales analytics
export const getSalesAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, platform } = req.query;
    
    const where: any = {};
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate as string);
      if (endDate) where.orderDate.lte = new Date(endDate as string);
    }
    if (platform) where.platform = platform;

    const [totalSales, totalOrders, avgOrderValue, platformStats] = await Promise.all([
      // Total sales amount
      prisma.orderItem.aggregate({
        where: {
          order: where,
        },
        _sum: {
          pricePerUnit: true,
        },
      }),
      // Total orders
      prisma.order.count({ where }),
      // Average order value
      prisma.orderItem.aggregate({
        where: {
          order: where,
        },
        _avg: {
          pricePerUnit: true,
        },
      }),
      // Sales by platform
      prisma.order.groupBy({
        by: ['platform'],
        where,
        _sum: {
          id: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const analytics = {
      totalSales: totalSales._sum.pricePerUnit || 0,
      totalOrders,
      avgOrderValue: avgOrderValue._avg.pricePerUnit || 0,
      platformStats: platformStats.map((stat: any) => ({
        platform: stat.platform,
        orders: stat._count.id,
        totalSales: stat._sum.id,
      })),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

// Inventory analytics
export const getInventoryAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalItems, totalStock, lowStockItems, activeItems] = await Promise.all([
      // Total items
      prisma.item.count(),
      // Total stock
      prisma.item.aggregate({
        _sum: {
          stockQuantity: true,
        },
      }),
      // Low stock items (stock < 10)
      prisma.item.findMany({
        where: {
          stockQuantity: { lt: 10 },
          isActive: true,
        },
        include: {
          brand: true,
          category: true,
        },
      }),
      // Active items
      prisma.item.findMany({
        where: {
          isActive: true,
        },
        include: {
          brand: true,
          category: true,
        },
      }),
    ]);

    const analytics = {
      totalItems,
      totalStock: totalStock._sum.stockQuantity || 0,
      lowStockItems: lowStockItems.length,
      activeItems: activeItems.length,
      lowStockDetails: lowStockItems.map((item: any) => ({
        sku: item.sku,
        name: item.name,
        stockQuantity: item.stockQuantity,
        brand: item.brand?.name,
        category: item.category?.name,
      })),
      activeItemsDetails: activeItems.map((item: any) => ({
        sku: item.sku,
        name: item.name,
        stockQuantity: item.stockQuantity,
        brand: item.brand?.name,
        category: item.category?.name,
      })),
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};


// Revenue analytics
export const getRevenueAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period = 'month' } = req.query;
    
    let groupBy: any = {};
    if (period === 'day') {
      groupBy = { orderDate: true };
    } else if (period === 'week') {
      // Group by week
      groupBy = { orderDate: true };
    } else {
      // Group by month
      groupBy = { orderDate: true };
    }

    const revenueData = await prisma.order.groupBy({
      by: ['orderDate'],
      _sum: {
        id: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
      take: 12,
    });

    const analytics = {
      period,
      revenueData: revenueData.map((item: any) => ({
        date: item.orderDate,
        revenue: item._sum.id || 0,
      })),
      totalRevenue: revenueData.reduce((sum: any, item: any) => sum + (item._sum.id || 0), 0),
      avgRevenue: revenueData.length > 0 
        ? revenueData.reduce((sum: any, item: any) => sum + (item._sum.id || 0), 0) / revenueData.length 
        : 0,
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getSalesAnalytics,
  getInventoryAnalytics,
  getRevenueAnalytics,
}; 