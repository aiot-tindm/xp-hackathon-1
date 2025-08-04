import { Request, Response, NextFunction } from 'express';
import prisma from '../models/database';
import logger from '../utils/logger';
import { 
  SegmentationConfig, 
  getSegmentationConfig, 
} from '../config/customerSegmentationConfig';
import { calculateCLV } from '../utils/clvCalculator';

// Type definitions for Prisma objects
interface OrderItem {
  id: number;
  orderId: number;
  itemId: number;
  quantity: number;
  pricePerUnit: any; // Decimal type from Prisma
  discountAmount: any; // Decimal type from Prisma
  createdAt: Date;
  updatedAt: Date;
  item: {
    id: number;
    sku: string;
    name: string;
    costPrice: any; // Decimal type from Prisma
    salePrice: any; // Decimal type from Prisma
    stockQuantity: number;
    brandId?: number;
    categoryId?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    category?: {
      id: number;
      name: string;
    };
    brand?: {
      id: number;
      name: string;
    };
  };
}

interface Order {
  id: number;
  orderCode: string;
  customerId: number;
  shippingLocation?: string;
  platform: string;
  orderDate: Date;
  status: string;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: number;
    name: string;
    email: string;
    phoneNumber?: string;
    createdAt: Date;
    loyalCustomer?: {
      loyaltySegment: string;
      totalOrders: number;
    };
  };
  orderItems: OrderItem[];
}

interface Item {
  id: number;
  sku: string;
  name: string;
  costPrice: any; // Decimal type from Prisma
  salePrice: any; // Decimal type from Prisma
  stockQuantity: number;
  brandId?: number;
  categoryId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: number;
    name: string;
  };
  brand?: {
    id: number;
    name: string;
  };
}

// Types for customer analytics
interface CustomerSegment {
  count: number;
  percentage: number;
  totalValue: number;
  avgOrderValue: number;
  avgOrders: number;
}

interface CustomerSegments {
  whale: CustomerSegment;
  vip: CustomerSegment;
  regular: CustomerSegment;
  new: CustomerSegment;
  churn: CustomerSegment;
}

interface CustomerBehavior {
  purchasePatterns: {
    categoryPreference: Array<{
      category: string;
      percentage: number;
      totalSpent: number;
      avgOrderValue: number;
    }>;
    brandLoyalty: {
      avgBrandsPerCustomer: number;
      topBrands: string[];
      loyaltyScore: number;
    };
    seasonalTrends: {
      peakMonths: string[];
      lowMonths: string[];
      seasonalityScore: number;
    };
  };
  engagementMetrics: {
    responseToPromotions: number;
    crossSellingSuccess: number;
    returnRate: number;
    satisfactionScore: number;
  };
}

// Helper function to calculate customer segment with dynamic config
const calculateCustomerSegment = async (
  totalSpent: number,
  totalOrders: number,
  avgOrderValue: number,
  daysSinceLastOrder: number,
  config: SegmentationConfig
): Promise<string> => {
  // Check for churn first
  if (daysSinceLastOrder > config.churn.maxDaysSinceLastOrder) {
    return 'churn';
  }
  
  // Check for whale customers
  if (totalSpent >= config.whale.minTotalSpent && 
      totalOrders >= config.whale.minOrders && 
      avgOrderValue >= config.whale.minAvgOrderValue) {
    return 'whale';
  }
  
  // Check for VIP customers
  if (totalSpent >= config.vip.minTotalSpent && 
      totalSpent <= config.vip.maxTotalSpent && 
      totalOrders >= config.vip.minOrders && 
      avgOrderValue >= config.vip.minAvgOrderValue) {
    return 'vip';
  }
  
  // Check for regular customers
  if (totalSpent >= config.regular.minTotalSpent && 
      totalSpent < config.regular.maxTotalSpent && 
      totalOrders >= config.regular.minOrders) {
    return 'regular';
  }
  
  // Default to new customers
  return 'new';
};

// Helper function to calculate RFM score
import { getRFMConfig } from '../config/rfmConfig';
import {
  calculateRFMScore,
  calculateRFMSegment,
  generateRFMInsights,
  generateRFMRecommendations,
  type RFMData
} from '../utils/rfmCalculator';


// Customer analytics
export const getCustomerAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { 
      days, 
      start, 
      end, 
      category, 
      limit = 10,
      segment,
      order_count_gte,
      order_count_lte,
      total_spent_gte,
      total_spent_lte,
      avg_order_value_gte,
      avg_order_value_lte,
      daysSinceLastOrder_gte,
      daysSinceLastOrder_lte,
      previousLastOrder_gte,
      previousLastOrder_lte
    } = req.query;

    // Build date filter - default to all data if no date parameters provided
    let dateFilter: any = {};
    if (start && end) {
      dateFilter = {
        orderDate: {
          gte: new Date(start as string),
          lte: new Date(end as string)
        }
      };
    } else if (days) {
      // Only apply days filter if explicitly provided
      const daysAgo = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
      dateFilter = {
        orderDate: { gte: daysAgo }
      };
    }
    // If no date parameters, dateFilter remains empty object (no date filtering)

    // Build category filter
    let categoryFilter: any = {};
    if (category) {
      categoryFilter = {
        orderItems: {
          some: {
            item: {
              category: {
                name: category as string
              }
            }
          }
        }
      };
    }

    // Get segmentation configuration (using default for this API)
    const segmentationConfig = await getSegmentationConfig();

    // Get customer data with detailed information
    const customerData = await prisma.order.findMany({
      where: {
        ...dateFilter,
        ...categoryFilter
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            item: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    logger.info(`Found ${customerData.length} orders`);

    // Group by customer and calculate metrics
    const customerMetrics = new Map();

    customerData.forEach((order: any) => {
      const customerId = order.customerId;
      if (!customerMetrics.has(customerId)) {
        customerMetrics.set(customerId, {
          customer: order.customer,
          totalSpent: 0,
          totalOrders: 0,
          totalItems: 0,
          lastOrderDate: order.orderDate,
          previousLastOrder: null,
          categories: new Map(),
          orderDates: []
        });
      }

      const metrics = customerMetrics.get(customerId);
      metrics.totalOrders++;
      metrics.orderDates.push(order.orderDate);
      
      // Update last order date and previous last order
      if (order.orderDate > metrics.lastOrderDate) {
        metrics.previousLastOrder = metrics.lastOrderDate;
        metrics.lastOrderDate = order.orderDate;
      } else if (metrics.previousLastOrder === null || order.orderDate > metrics.previousLastOrder) {
        metrics.previousLastOrder = order.orderDate;
      }

      order.orderItems.forEach((item: any) => {
        const itemValue = Number(item.pricePerUnit) * item.quantity;
        metrics.totalSpent += itemValue;
        metrics.totalItems += item.quantity;

        const categoryName = item.item.category?.name || 'Unknown';
        if (!metrics.categories.has(categoryName)) {
          metrics.categories.set(categoryName, {
            orders: 0,
            spent: 0,
            items: 0
          });
        }
        const catMetrics = metrics.categories.get(categoryName);
        catMetrics.orders++;
        catMetrics.spent += itemValue;
        catMetrics.items += item.quantity;
      });
    });

    // Calculate segments and prepare customer details
    const customers = await Promise.all(Array.from(customerMetrics.entries()).map(async ([customerId, metrics]: [number, any]) => {
      const avgOrderValue = metrics.totalSpent / metrics.totalOrders;
      const daysSinceLastOrder = Math.floor((Date.now() - metrics.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate segment using configuration
      const customerSegment = await calculateCustomerSegment(
        metrics.totalSpent, 
        metrics.totalOrders, 
        avgOrderValue, 
        daysSinceLastOrder, 
        segmentationConfig
      );

      // Get top 5 categories
      const topCategories = Array.from(metrics.categories.entries())
        .sort((a: any, b: any) => b[1].spent - a[1].spent)
        .slice(0, 5)
        .map((entry: any) => entry[0]);

      // Convert categories map to object
      const categoryBreakdown: any = {};
      metrics.categories.forEach((value: any, key: string) => {
        categoryBreakdown[key] = value;
      });

      // Calculate CLV for this customer
      const clvData = await calculateCLV(customerId);

      return {
        id: metrics.customer.id,
        name: metrics.customer.name,
        email: metrics.customer.email,
        totalSpent: metrics.totalSpent,
        totalOrders: metrics.totalOrders,
        totalItems: metrics.totalItems,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        lastOrderDate: metrics.lastOrderDate,
        previousLastOrder: metrics.previousLastOrder,
        daysSinceLastOrder,
        segment: customerSegment,
        topCategories,
        categoryBreakdown,
        clv: clvData.currentCLV,
        clvRank: 0 // Will be calculated after sorting
      };
    }));

    // Apply filters
    let filteredCustomers = customers;

    // Filter by segment
    if (segment) {
      filteredCustomers = filteredCustomers.filter((c: any) => c.segment === segment);
    }

    // Filter by order count
    if (order_count_gte) {
      filteredCustomers = filteredCustomers.filter((c: any) => c.totalOrders >= Number(order_count_gte));
    }
    if (order_count_lte) {
      filteredCustomers = filteredCustomers.filter((c: any) => c.totalOrders <= Number(order_count_lte));
    }

    // Filter by total spent
    if (total_spent_gte) {
      filteredCustomers = filteredCustomers.filter((c: any) => c.totalSpent >= Number(total_spent_gte));
    }
    if (total_spent_lte) {
      filteredCustomers = filteredCustomers.filter((c: any) => c.totalSpent <= Number(total_spent_lte));
    }

    // Filter by average order value
    if (avg_order_value_gte) {
      filteredCustomers = filteredCustomers.filter((c: any) => c.avgOrderValue >= Number(avg_order_value_gte));
    }
    if (avg_order_value_lte) {
      filteredCustomers = filteredCustomers.filter((c: any) => c.avgOrderValue <= Number(avg_order_value_lte));
    }

    // Filter by days since last order
    if (daysSinceLastOrder_gte) {
      filteredCustomers = filteredCustomers.filter((c: any) => c.daysSinceLastOrder >= Number(daysSinceLastOrder_gte));
    }
    if (daysSinceLastOrder_lte) {
      filteredCustomers = filteredCustomers.filter((c: any) => c.daysSinceLastOrder <= Number(daysSinceLastOrder_lte));
    }

    // Filter by previous last order date
    if (previousLastOrder_gte) {
      const previousLastOrderGteDate = new Date(previousLastOrder_gte as string);
      filteredCustomers = filteredCustomers.filter((c: any) => 
        c.previousLastOrder && c.previousLastOrder >= previousLastOrderGteDate);
    }
    if (previousLastOrder_lte) {
      const previousLastOrderLteDate = new Date(previousLastOrder_lte as string);
      filteredCustomers = filteredCustomers.filter((c: any) => 
        c.previousLastOrder && c.previousLastOrder <= previousLastOrderLteDate);
    }

    // Sort by total spent and take top customers
    const topCustomers = filteredCustomers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, Number(limit))
      .map((customer, index) => ({
        ...customer,
        clvRank: index + 1
      }));

    // Calculate summary
    const segments = filteredCustomers.reduce((acc: any, customer: any) => {
      acc[customer.segment] = (acc[customer.segment] || 0) + 1;
      return acc;
    }, {});

    const summary = {
      totalCustomers: filteredCustomers.length,
      newCustomers: filteredCustomers.filter((c: any) => c.segment === 'new').length,
      segments: {
        whale: segments.whale || 0,
        vip: segments.vip || 0,
        regular: segments.regular || 0,
        new: segments.new || 0,
        churn: segments.churn || 0
      }
    };

    res.json({
      success: true,
      data: {
        summary,
        customers: topCustomers
      }
    });
  } catch (error) {
    logger.error('Error in customer analytics:', error);
    next(error);
  }
};

// 2. Individual Customer Analysis
export const getIndividualCustomerAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { days } = req.query;

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
      return;
    }

    // Build date filter - default to all data if no days parameter provided
    let dateFilter: any = {};
    if (days) {
      const daysAgo = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
      dateFilter = { orderDate: { gte: daysAgo } };
    }

    const segmentationConfig = await getSegmentationConfig();

    // Get customer information
    const customer = await prisma.customer.findUnique({
      where: { id: Number(customerId) },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        createdAt: true
      }
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
      return;
    }

    // Get customer orders with items
    const orders = await prisma.order.findMany({
      where: {
        customerId: Number(customerId),
        ...dateFilter
      },
      include: {
        orderItems: {
          include: {
            item: {
              include: {
                category: true,
                brand: true
              }
            }
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    });

    if (orders.length === 0) {
      res.json({
        success: true,
        data: {
          customer,
                analysis: {
        totalOrders: 0,
        totalSpent: 0,
        totalItems: 0,
        avgOrderValue: 0,
        lastOrderDate: null,
        daysSinceLastOrder: 0,
        segment: 'new',
        categoryBreakdown: {},
        brandBreakdown: {},
        monthlyTrends: {}
      }
        }
      });
      return;
    }

    // Calculate basic metrics
    let totalSpent = 0;
    let totalItems = 0;
    const categoryBreakdown = new Map();
    const brandBreakdown = new Map();
    const monthlyTrends = new Map();

    orders.forEach((order: any) => {
      const month = order.orderDate.toISOString().slice(0, 7); // YYYY-MM
      
      if (!monthlyTrends.has(month)) {
        monthlyTrends.set(month, { orders: 0, spent: 0, items: 0 });
      }
      const monthData = monthlyTrends.get(month);
      monthData.orders++;

      order.orderItems.forEach((item: any) => {
        const itemValue = Number(item.pricePerUnit) * item.quantity;
        totalSpent += itemValue;
        totalItems += item.quantity;
        monthData.spent += itemValue;
        monthData.items += item.quantity;

        // Category breakdown
        const categoryName = item.item.category?.name || 'Unknown';
        if (!categoryBreakdown.has(categoryName)) {
          categoryBreakdown.set(categoryName, { spent: 0, orders: 0, items: 0 });
        }
        const catData = categoryBreakdown.get(categoryName);
        catData.spent += itemValue;
        catData.items += item.quantity;

        // Brand breakdown
        const brandName = item.item.brand?.name || 'Unknown';
        if (!brandBreakdown.has(brandName)) {
          brandBreakdown.set(brandName, { spent: 0, orders: 0, items: 0 });
        }
        const brandData = brandBreakdown.get(brandName);
        brandData.spent += itemValue;
        brandData.items += item.quantity;
      });
    });

    // Update category and brand order counts
    orders.forEach((order: any) => {
      const orderCategories = new Set<string>();
      const orderBrands = new Set<string>();
      
      order.orderItems.forEach((item: any) => {
        orderCategories.add(item.item.category?.name || 'Unknown');
        orderBrands.add(item.item.brand?.name || 'Unknown');
      });

      orderCategories.forEach((category: string) => {
        const catData = categoryBreakdown.get(category);
        if (catData) catData.orders++;
      });

      orderBrands.forEach((brand: string) => {
        const brandData = brandBreakdown.get(brand);
        if (brandData) brandData.orders++;
      });
    });

    const totalOrders = orders.length;
    const avgOrderValue = totalSpent / totalOrders;
    const lastOrderDate = orders[0]?.orderDate || new Date();
    const daysSinceLastOrder = Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate segment
    const segment = await calculateCustomerSegment(totalSpent, totalOrders, avgOrderValue, daysSinceLastOrder, segmentationConfig);

    // Convert maps to objects
    const categoryBreakdownObj: any = {};
    categoryBreakdown.forEach((value, key) => {
      categoryBreakdownObj[key] = value;
    });

    const brandBreakdownObj: any = {};
    brandBreakdown.forEach((value, key) => {
      brandBreakdownObj[key] = value;
    });

    const monthlyTrendsObj: any = {};
    monthlyTrends.forEach((value, key) => {
      monthlyTrendsObj[key] = value;
    });

    res.json({
      success: true,
      data: {
        customer,
        analysis: {
          totalOrders,
          totalSpent,
          totalItems,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          lastOrderDate,
          daysSinceLastOrder,
          segment,
          categoryBreakdown: categoryBreakdownObj,
          brandBreakdown: brandBreakdownObj,
          monthlyTrends: monthlyTrendsObj
        }
      }
    });
  } catch (error) {
    logger.error('Error in individual customer analysis:', error);
    next(error);
  }
};



// 3. Customer Lifetime Value Analysis
import { 
  predictNextPurchaseDate, 
  generateRecommendedActions, 
  calculateRetentionRate,
  type CLVData,
  type PredictionRequest,
  type PredictionResponse
} from '../utils/clvCalculator';
import { getRecommendationConfig } from '../config/recommendationConfig';
import {
  collaborativeFiltering,
  contentBasedFiltering,
  popularityBasedFiltering,
  generatePromotions,
  generateStrategies,
  analyzeCustomerPreferences,
  type ProductRecommendation,
  type PromotionRecommendation,
  type StrategyRecommendation
} from '../utils/recommendationEngine';

export const getCustomerPredictions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { 
      customerIds, 
      predictionType = 'all', 
      months = 12,
      includeRecommendations = true
    } = req.body as PredictionRequest & {
      includeRecommendations?: boolean;
    };

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Customer IDs array is required'
      });
      return;
    }

    // Get recommendation configuration
    const recommendationConfig = await getRecommendationConfig('default');

    logger.info(`Generating predictions for ${customerIds.length} customers with type: ${predictionType}`);

    const predictions: CLVData[] = [];
    let totalPredictedRevenue = 0;
    let totalChurnRisk = 0;
    let totalRetentionRate = 0;
    let highValueCustomers = 0;
    let atRiskCustomers = 0;

    const segmentationConfig = await getSegmentationConfig();
    // Process each customer
    for (const customerId of customerIds) {
      try {
        // Get customer info
        const customer = await prisma.customer.findUnique({
          where: { id: customerId }
        });

        if (!customer) {
          logger.warn(`Customer ${customerId} not found, skipping...`);
          continue;
        }

        // Calculate CLV
        const clvData = await calculateCLV(customerId);
        
        // Predict next purchase date
        const nextPurchaseDate = await predictNextPurchaseDate(customerId);
        
        // Calculate churn risk using simple method for predictions API
        const daysSinceLastOrder = Math.floor((Date.now() - (nextPurchaseDate?.getTime() || Date.now())) / (1000 * 60 * 60 * 24));
        const totalOrders = clvData.purchaseFrequency * clvData.customerLifespan;
        const churnRisk = calculateSimpleChurnRisk(daysSinceLastOrder, totalOrders);
        
        // Generate recommended actions
        const recommendedActions = await generateRecommendedActions(customerId, churnRisk, clvData.predictedCLV);
        
        // Calculate retention rate
        const retentionRate = await calculateRetentionRate(customerId);

        // Calculate acquisition cost (estimated based on segment)
        const acquisitionCost = estimateAcquisitionCost(clvData.predictedCLV);

        // Calculate customer segment
        const customerSegment = await calculateCustomerSegment(
          clvData.currentCLV,
          clvData.purchaseFrequency * clvData.customerLifespan,
          clvData.avgOrderValue,
          Math.floor((Date.now() - (nextPurchaseDate?.getTime() || Date.now())) / (1000 * 60 * 60 * 24)),
          segmentationConfig
        );

        // Generate recommendations if requested
        let recommendations = null;
        if (includeRecommendations) {
          const preferences = await analyzeCustomerPreferences(customerId);
          
          // Generate product recommendations using multiple algorithms
          const collaborativeProducts = await collaborativeFiltering(customerId, recommendationConfig);
          const contentBasedProducts = await contentBasedFiltering(customerId, recommendationConfig);
          const popularProducts = await popularityBasedFiltering(recommendationConfig);
          
          // Combine and rank recommendations
          const allProducts = [...collaborativeProducts, ...contentBasedProducts, ...popularProducts];
          const rankedProducts = rankRecommendations(allProducts, recommendationConfig);
          
          // Generate promotions and strategies
          const promotions = await generatePromotions(customerId, customerSegment, recommendationConfig);
          const strategies = await generateStrategies(customerId, customerSegment, preferences, recommendationConfig);
          
          recommendations = {
            products: rankedProducts.slice(0, recommendationConfig.limits.products),
            promotions,
            strategies
          };
        }

        const prediction: CLVData = {
          customerId,
          customerName: customer.name,
          currentCLV: clvData.currentCLV,
          predictedCLV: clvData.predictedCLV,
          churnRisk,
          nextPurchaseDate,
          recommendedActions,
          purchaseFrequency: clvData.purchaseFrequency,
          avgOrderValue: clvData.avgOrderValue,
          customerLifespan: clvData.customerLifespan,
          acquisitionCost,
          retentionRate,
          recommendations
        };

        predictions.push(prediction);

        // Update overall metrics
        totalPredictedRevenue += clvData.predictedCLV;
        totalChurnRisk += churnRisk;
        totalRetentionRate += retentionRate;

        if (clvData.predictedCLV > 50000) highValueCustomers++;
        if (churnRisk > 0.7) atRiskCustomers++;

      } catch (error) {
        logger.error(`Error processing customer ${customerId}:`, error);
        continue;
      }
    }

    // Calculate overall metrics
    const overallMetrics = {
      totalPredictedRevenue: Math.round(totalPredictedRevenue),
      avgChurnRisk: predictions.length > 0 ? Math.round((totalChurnRisk / predictions.length) * 100) / 100 : 0,
      avgRetentionRate: predictions.length > 0 ? Math.round((totalRetentionRate / predictions.length) * 100) / 100 : 0,
      totalCustomers: predictions.length,
      highValueCustomers,
      atRiskCustomers
    };

    logger.info(`Predictions completed. Processed ${predictions.length} customers`);

    res.json({
      success: true,
      data: {
        predictions,
        overallMetrics
      }
    });

  } catch (error) {
    logger.error('Error in customer predictions:', error);
    next(error);
  }
};

/**
 * Estimate acquisition cost based on predicted CLV
 */
const estimateAcquisitionCost = (predictedCLV: number): number => {
  // Industry standard: acquisition cost is typically 5-25% of CLV
  const acquisitionRate = predictedCLV > 50000 ? 0.05 : // 5% for high-value customers
                         predictedCLV > 20000 ? 0.10 : // 10% for medium-value customers
                         0.15; // 15% for low-value customers
  
  return Math.round(predictedCLV * acquisitionRate);
};

/**
 * Rank recommendations based on algorithm weights and confidence scores
 */
const rankRecommendations = (products: ProductRecommendation[], config: any): ProductRecommendation[] => {
  return products
    .map(product => {
      // Calculate weighted score based on algorithm and confidence
      const algorithmWeight = config.algorithmWeights[product.algorithm as keyof typeof config.algorithmWeights] || 0.1;
      const weightedScore = product.confidence * algorithmWeight;
      
      return {
        ...product,
        weightedScore
      };
    })
    .sort((a, b) => (b as any).weightedScore - (a as any).weightedScore)
    .map(product => {
      // Remove weightedScore from final result
      const { weightedScore, ...cleanProduct } = product as any;
      return cleanProduct;
    });
};



// 5. Customer RFM Analysis
export const getCustomerRFMAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { 
      customerId
    } = req.query;

    // Get RFM configuration
    const rfmConfig = await getRFMConfig('default');
    const segmentationConfig = await getSegmentationConfig();

    logger.info(`Performing RFM analysis for ${customerId ? 'specific customer' : 'all customers'}`);

    let whereClause: any = {};
    if (customerId) {
      whereClause.customerId = Number(customerId);
    }

    // Get customer data with orders and customer details
    const customerData = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: true,
        orderItems: {
          include: {
            item: true
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    });

    // Group by customer and calculate RFM metrics
    const customerRFMData = new Map<number, any>();

    customerData.forEach((order: any) => {
      const customerId = order.customerId;
      const orderTotal = order.orderItems.reduce((sum: number, item: any) => {
        return sum + (Number(item.pricePerUnit) * item.quantity);
      }, 0);

      if (!customerRFMData.has(customerId)) {
        customerRFMData.set(customerId, {
          customerId,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          orders: [],
          totalSpent: 0,
          firstOrderDate: order.orderDate,
          lastOrderDate: order.orderDate
        });
      }

      const customerData = customerRFMData.get(customerId);
      customerData.orders.push(order);
      customerData.totalSpent += orderTotal;
      
      if (order.orderDate < customerData.firstOrderDate) {
        customerData.firstOrderDate = order.orderDate;
      }
      if (order.orderDate > customerData.lastOrderDate) {
        customerData.lastOrderDate = order.orderDate;
      }
    });

    const rfmResults: RFMData[] = [];

    // Process each customer sequentially to handle async operations
    for (const [customerId, customerData] of customerRFMData) {
      const totalOrders = customerData.orders.length;
      const totalSpent = customerData.totalSpent;
      const daysSinceLastOrder = Math.floor((Date.now() - customerData.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate RFM scores using configurable thresholds
      const rfmScore = calculateRFMScore(daysSinceLastOrder, totalOrders, totalSpent, rfmConfig);
      
      // Calculate RFM segment
      const rfmSegment = calculateRFMSegment(rfmScore.rfmScore, rfmConfig);
      
      // Calculate business segment (config already loaded above)
      const avgOrderValue = totalSpent / totalOrders;
      const businessSegment = await calculateCustomerSegment(
        totalSpent, 
        totalOrders, 
        avgOrderValue, 
        daysSinceLastOrder, 
        segmentationConfig
      );

      // Generate insights and recommendations
      const insights = generateRFMInsights(
        rfmScore.recencyScore,
        rfmScore.frequencyScore,
        rfmScore.monetaryScore,
        rfmConfig
      );

      const recommendations = generateRFMRecommendations(
        rfmScore.rfmScore,
        rfmSegment,
        rfmScore.recencyScore,
        rfmScore.frequencyScore,
        rfmScore.monetaryScore
      );

      rfmResults.push({
        customerId: customerData.customerId,
        customerName: customerData.customerName,
        customerEmail: customerData.customerEmail,
        recency: daysSinceLastOrder,
        frequency: totalOrders,
        monetary: totalSpent,
        recencyScore: rfmScore.recencyScore,
        frequencyScore: rfmScore.frequencyScore,
        monetaryScore: rfmScore.monetaryScore,
        rfmScore: rfmScore.rfmScore,
        rfmSegment,
        businessSegment,
        insights,
        recommendations,
        lastOrderDate: customerData.lastOrderDate,
        firstOrderDate: customerData.firstOrderDate,
        avgOrderValue
      });
    }

    // Sort by RFM score (highest first)
    rfmResults.sort((a, b) => b.rfmScore - a.rfmScore);

    // Calculate summary statistics
    const totalCustomers = rfmResults.length;
    const avgRFMScore = totalCustomers > 0 ? rfmResults.reduce((sum, customer) => sum + customer.rfmScore, 0) / totalCustomers : 0;
    
    const segmentBreakdown = {
      champions: rfmResults.filter(c => c.rfmSegment === 'champions').length,
      loyal: rfmResults.filter(c => c.rfmSegment === 'loyal').length,
      at_risk: rfmResults.filter(c => c.rfmSegment === 'at_risk').length,
      cant_lose: rfmResults.filter(c => c.rfmSegment === 'cant_lose').length,
      lost: rfmResults.filter(c => c.rfmSegment === 'lost').length
    };

    logger.info(`RFM analysis completed for ${rfmResults.length} customers`);

    res.json({
      success: true,
      data: {
        customers: rfmResults,
        summary: {
          totalCustomers,
          avgRFMScore: Math.round(avgRFMScore * 100) / 100,
          segmentBreakdown,
          config: {
            recencyThresholds: rfmConfig.scoring.recency.thresholds,
            frequencyThresholds: rfmConfig.scoring.frequency.thresholds,
            monetaryThresholds: rfmConfig.scoring.monetary.thresholds
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error in RFM analysis:', error);
    next(error);
  }
};

import { getChurnConfig } from '../config/churnConfig';
import {
  calculateChurnRisk,
  determineRiskLevel,
  generateChurnInsights,
  generateRetentionStrategies,
  calculateEngagementScore,
  calculateTrends,
  calculateSimpleChurnRisk,
  type ChurnData
} from '../utils/churnCalculator';

// 6. Customer Churn Prediction
export const getCustomerChurnPrediction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { 
      days,
      includeAllCustomers = false
    } = req.query;

    // Get churn configuration
    const churnConfig = await getChurnConfig('default');

    logger.info(`Predicting customer churn with days: ${days}, includeAll: ${includeAllCustomers}`);

    // Build where clause based on includeAllCustomers parameter and days filter
    let whereClause: any = {};
    if (!includeAllCustomers && days) {
      const daysAgo = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
      whereClause.orderDate = { lt: daysAgo };
    }

    // Get customer data with orders and customer details
    const customerData = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: true,
        orderItems: {
          include: {
            item: true
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    });

    // Group by customer and calculate churn metrics
    const customerChurnData = new Map<number, any>();

    customerData.forEach((order: any) => {
      const customerId = order.customerId;
      const orderTotal = order.orderItems.reduce((sum: number, item: any) => {
        return sum + (Number(item.pricePerUnit) * item.quantity);
      }, 0);

      if (!customerChurnData.has(customerId)) {
        customerChurnData.set(customerId, {
          customerId,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          orders: [],
          totalSpent: 0,
          firstOrderDate: order.orderDate,
          lastOrderDate: order.orderDate
        });
      }

      const customerData = customerChurnData.get(customerId);
      customerData.orders.push(order);
      customerData.totalSpent += orderTotal;
      
      if (order.orderDate < customerData.firstOrderDate) {
        customerData.firstOrderDate = order.orderDate;
      }
      if (order.orderDate > customerData.lastOrderDate) {
        customerData.lastOrderDate = order.orderDate;
      }
    });

    const churnResults: ChurnData[] = [];

    customerChurnData.forEach((customerData: any) => {
      const totalOrders = customerData.orders.length;
      const totalSpent = customerData.totalSpent;
      const avgOrderValue = totalSpent / totalOrders;
      const daysSinceLastOrder = Math.floor((Date.now() - customerData.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate engagement score
      const engagementScore = calculateEngagementScore(totalOrders, totalSpent, daysSinceLastOrder, avgOrderValue);

      // Calculate churn risk using configurable algorithm
      const { churnRisk, factors: churnFactors } = calculateChurnRisk(
        daysSinceLastOrder,
        totalOrders,
        totalSpent,
        engagementScore,
        churnConfig
      );

      // Determine risk level
      const riskLevel = determineRiskLevel(churnRisk, churnConfig);

      // Generate insights
      const insights = generateChurnInsights(
        churnRisk,
        churnFactors,
        totalSpent,
        avgOrderValue,
        churnConfig
      );

      // Generate retention strategies
      const retentionStrategies = generateRetentionStrategies(
        riskLevel,
        churnFactors,
        churnConfig
      );

      // Calculate trends
      const { orderDecline, valueDecline } = calculateTrends(customerData.orders);

      churnResults.push({
        customerId: customerData.customerId,
        customerName: customerData.customerName,
        customerEmail: customerData.customerEmail,
        daysSinceLastOrder,
        totalOrders,
        totalSpent,
        avgOrderValue,
        churnRisk,
        riskLevel,
        churnFactors,
        insights,
        retentionStrategies,
        lastOrderDate: customerData.lastOrderDate,
        firstOrderDate: customerData.firstOrderDate,
        orderDecline,
        valueDecline,
        engagementScore
      });
    });

    // Sort by churn risk (highest first)
    churnResults.sort((a, b) => b.churnRisk - a.churnRisk);

    // Calculate summary statistics
    const totalAnalyzed = churnResults.length;
    const highRisk = churnResults.filter(c => c.riskLevel === 'high').length;
    const mediumRisk = churnResults.filter(c => c.riskLevel === 'medium').length;
    const lowRisk = churnResults.filter(c => c.riskLevel === 'low').length;

    const totalRevenueAtRisk = churnResults
      .filter(c => c.riskLevel === 'high')
      .reduce((sum, c) => sum + c.insights.estimatedRevenueLoss, 0);

    const avgChurnRisk = totalAnalyzed > 0 ? 
      churnResults.reduce((sum, c) => sum + c.churnRisk, 0) / totalAnalyzed : 0;

    logger.info(`Churn prediction completed. High risk customers: ${highRisk}, Revenue at risk: $${totalRevenueAtRisk}`);

    res.json({
      success: true,
      data: {
        predictions: churnResults,
        summary: {
          totalAnalyzed,
          highRisk,
          mediumRisk,
          lowRisk,
          avgChurnRisk: Math.round(avgChurnRisk * 100) / 100,
          totalRevenueAtRisk: Math.round(totalRevenueAtRisk),
          config: {
            inactivityThresholds: churnConfig.riskFactors.inactivity.thresholds,
            frequencyThresholds: churnConfig.riskFactors.orderFrequency.thresholds,
            valueThresholds: churnConfig.riskFactors.orderValue.thresholds
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error in churn prediction:', error);
    next(error);
  }
};

import { getPotentialCustomersConfig } from '../config/potentialCustomersConfig';
import {
  calculateInterestScore,
  determineInterestLevel,
  generateMarketingInsights,
  generateSalesIntelligence,
  generateInventoryInsights,
  analyzeCustomerOrderHistory,
  type PotentialCustomerData
} from '../utils/potentialCustomersCalculator';

// 7. Potential Customer Suggestions for Specific Products
export const getPotentialCustomersForProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { 
      productIds, 
      categoryIds, 
      limit = 10
    } = req.query;
    
    // Get potential customers configuration
    const config = await getPotentialCustomersConfig('default');
    
    logger.info(`Finding potential customers for products: ${productIds}`);

    // Get customers who have purchased similar products
    const similarProductCustomers = await prisma.order.findMany({
      where: {
        orderItems: {
          some: {
            item: {
              OR: [
                ...(productIds ? [{ id: { in: (productIds as string).split(',').map(Number) } }] : []),
                ...(categoryIds ? [{ categoryId: { in: (categoryIds as string).split(',').map(Number) } }] : [])
              ]
            }
          }
        }
      },
      include: {
        customer: {
          include: {
            loyalCustomer: true
          }
        },
        orderItems: {
          include: {
            item: {
              include: {
                category: true,
                brand: true
              }
            }
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    });

    // Group orders by customer
    const customerOrders = new Map<number, Order[]>();
    similarProductCustomers.forEach((order: Order) => {
      const customerId = order.customerId;
      if (!customerOrders.has(customerId)) {
        customerOrders.set(customerId, []);
      }
      customerOrders.get(customerId)!.push(order);
    });

    // Analyze each customer and calculate comprehensive insights
    const potentialCustomers: PotentialCustomerData[] = [];

    customerOrders.forEach((orders, customerId) => {
      // Analyze customer order history
      const analysis = analyzeCustomerOrderHistory(orders);

      // Calculate interest score using configurable algorithm
      const interestScoreData = calculateInterestScore(analysis, config);
      const interestScore = interestScoreData.totalScore;

      // Determine interest level
      const interestLevel = determineInterestLevel(interestScore, config);

      // Generate marketing insights
      const marketingInsights = generateMarketingInsights(analysis, interestScore, config);

      // Generate sales intelligence
      const salesIntelligence = generateSalesIntelligence(analysis, interestScore, config);

      // Generate inventory insights
      const inventoryInsights = generateInventoryInsights(analysis, interestScore);

      potentialCustomers.push({
        customerId,
        customer: {
          id: analysis.customer.id,
          name: analysis.customer.name,
          email: analysis.customer.email,
          phoneNumber: analysis.customer.phoneNumber
        },
        totalSpent: analysis.totalSpent,
        similarProducts: analysis.similarProducts,
        categories: Array.from(analysis.categories),
        brands: Array.from(analysis.brands),
        lastPurchaseDate: analysis.lastPurchaseDate,
        firstPurchaseDate: analysis.firstPurchaseDate,
        purchaseFrequency: Math.round(analysis.purchaseFrequency * 100) / 100,
        avgOrderValue: Math.round(analysis.avgOrderValue),
        interestScore,
        interestLevel,
        marketingInsights,
        salesIntelligence,
        inventoryInsights,
        demographics: {
          segment: analysis.customer.loyalCustomer?.loyaltySegment || 'New',
          totalOrders: analysis.customer.loyalCustomer?.totalOrders || 0
        }
      });
    });

    // Sort by interest score (highest first) and apply limit
    potentialCustomers.sort((a, b) => b.interestScore - a.interestScore);
    const limitedCustomers = potentialCustomers.slice(0, Number(limit));

    // Calculate summary statistics
    const totalAnalyzed = potentialCustomers.length;
    const avgInterestScore = totalAnalyzed > 0 ? 
      potentialCustomers.reduce((sum, c) => sum + c.interestScore, 0) / totalAnalyzed : 0;
    const highInterestCustomers = potentialCustomers.filter(c => c.interestLevel === 'high').length;
    const mediumInterestCustomers = potentialCustomers.filter(c => c.interestLevel === 'medium').length;
    const lowInterestCustomers = potentialCustomers.filter(c => c.interestLevel === 'low').length;

    const totalPotentialRevenue = limitedCustomers.reduce((sum, c) => sum + c.salesIntelligence.conversionProbability * c.totalSpent, 0);

    logger.info(`Found ${limitedCustomers.length} potential customers with avg interest score: ${avgInterestScore}`);

    res.json({
      success: true,
      data: {
        potentialCustomers: limitedCustomers,
        summary: {
          totalAnalyzed,
          avgInterestScore: Math.round(avgInterestScore * 100) / 100,
          highInterestCustomers,
          mediumInterestCustomers,
          lowInterestCustomers,
          totalPotentialRevenue: Math.round(totalPotentialRevenue),
          config: {
            purchaseFrequencyThresholds: config.scoring.purchaseFrequency.thresholds,
            totalSpentThresholds: config.scoring.totalSpent.thresholds,
            recencyThresholds: config.scoring.recency.thresholds
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error in potential customer suggestions:', error);
    next(error);
  }
};

// 8. New Inventory and Customer Matching
export const getNewInventoryCustomerMatching = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { days } = req.query;
    
    // Build date filter - default to all data if no days parameter provided
    let dateFilter: any = {};
    if (days) {
      const daysAgo = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: daysAgo } };
    }

    logger.info(`Analyzing new inventory and customer matching${days ? ` for last ${days} days` : ' for all time'}`);

    // Get new items added in the specified period
    const newItems = await prisma.item.findMany({
      where: {
        ...dateFilter,
        isActive: true
      },
      include: {
        category: true,
        brand: true
      }
    });

    // Find customers who have purchased similar items
    const customerMatches = [];

    for (const newItem of newItems) {
      // Find customers who bought similar items (same category or brand)
      const similarCustomers = await prisma.order.findMany({
        where: {
          orderItems: {
            some: {
              item: {
                OR: [
                  { categoryId: newItem.categoryId },
                  { brandId: newItem.brandId }
                ]
              }
            }
          }
        },
        include: {
          customer: {
            include: {
              loyalCustomer: true
            }
          },
          orderItems: {
            include: {
              item: {
                include: {
                  category: true,
                  brand: true
                }
              }
            }
          }
        }
      });

      // Analyze customer interest in this new item
      const interestedCustomers = similarCustomers.map((order: Order) => {
        const totalSpent = order.orderItems.reduce((sum: number, item: OrderItem) => sum + (Number(item.pricePerUnit) * item.quantity), 0);
        const similarItems = order.orderItems.filter((item: OrderItem) => 
          item.item.categoryId === newItem.categoryId || item.item.brandId === newItem.brandId
        ).length;

        return {
          customerId: order.customerId,
          customer: {
            id: order.customer.id,
            name: order.customer.name,
            email: order.customer.email,
            phoneNumber: order.customer.phoneNumber
          },
          totalSpent,
          similarItems,
          lastPurchaseDate: order.orderDate,
          segment: order.customer.loyalCustomer?.loyaltySegment || 'New',
          matchReason: newItem.categoryId === order.orderItems[0]?.item.categoryId ? 'Category Match' : 'Brand Match'
        };
      });

      customerMatches.push({
        newItem: {
          id: newItem.id,
          sku: newItem.sku,
          name: newItem.name,
          category: newItem.category?.name,
          brand: newItem.brand?.name,
          stockQuantity: newItem.stockQuantity,
          salePrice: newItem.salePrice
        },
        interestedCustomers: interestedCustomers.slice(0, 10), // Top 10 interested customers
        totalInterestedCustomers: interestedCustomers.length
      });
    }

    // Generate email campaign suggestions
    const emailCampaigns = customerMatches.map(match => ({
      product: match.newItem,
      targetCustomers: match.interestedCustomers.length,
      campaignType: match.interestedCustomers.length > 5 ? 'Bulk Email' : 'Personalized Email',
      suggestedContent: `New ${match.newItem.category} from ${match.newItem.brand}: ${match.newItem.name}`,
      priority: match.interestedCustomers.length > 10 ? 'High' : 'Medium'
    }));

    logger.info(`Analyzed ${newItems.length} new items with ${customerMatches.reduce((sum, m) => sum + m.totalInterestedCustomers, 0)} interested customers`);

    res.json({
      success: true,
      data: {
        newItems: newItems.map((item: Item) => ({
          sku: item.sku,
          name: item.name,
          category: item.category?.name,
          brand: item.brand?.name,
          stockQuantity: item.stockQuantity,
          addedDate: item.createdAt
        })),
        customerMatches,
        emailCampaigns,
        summary: {
          totalNewItems: newItems.length,
          totalInterestedCustomers: customerMatches.reduce((sum, m) => sum + m.totalInterestedCustomers, 0),
          avgCustomersPerItem: customerMatches.reduce((sum, m) => sum + m.totalInterestedCustomers, 0) / newItems.length
        }
      }
    });
  } catch (error) {
    logger.error('Error in new inventory customer matching:', error);
    next(error);
  }
};

// 9. Enhanced Customer Segmentation with Custom Thresholds


export default {
  getIndividualCustomerAnalysis,
  getCustomerPredictions,
  getCustomerRFMAnalysis,
  getCustomerChurnPrediction,
  getPotentialCustomersForProducts,
  getNewInventoryCustomerMatching
}; 