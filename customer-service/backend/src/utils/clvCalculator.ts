import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CLVData {
  customerId: number;
  customerName: string;
  currentCLV: number;
  predictedCLV: number;
  churnRisk: number;
  nextPurchaseDate: Date | null;
  recommendedActions: string[];
  purchaseFrequency: number;
  avgOrderValue: number;
  customerLifespan: number;
  acquisitionCost: number;
  retentionRate: number;
  recommendations?: {
    products: any[];
    promotions: any[];
    strategies: any[];
  } | null;
}

export interface PredictionRequest {
  customerIds: number[];
  predictionType: 'clv' | 'churn' | 'purchase' | 'all';
  months: number;
}

export interface PredictionResponse {
  predictions: CLVData[];
  overallMetrics: {
    totalPredictedRevenue: number;
    avgChurnRisk: number;
    avgRetentionRate: number;
    totalCustomers: number;
    highValueCustomers: number;
    atRiskCustomers: number;
  };
}

/**
 * Calculate Customer Lifetime Value using the formula:
 * CLV = Average Order Value × Purchase Frequency × Customer Lifespan
 */
export const calculateCLV = async (customerId: number): Promise<{
  currentCLV: number;
  predictedCLV: number;
  purchaseFrequency: number;
  avgOrderValue: number;
  customerLifespan: number;
}> => {
  // Get customer's order history
  const orders = await prisma.order.findMany({
    where: { customerId },
    include: {
      orderItems: {
        include: {
          item: true
        }
      }
    },
    orderBy: { orderDate: 'asc' }
  });

  if (orders.length === 0) {
    return {
      currentCLV: 0,
      predictedCLV: 0,
      purchaseFrequency: 0,
      avgOrderValue: 0,
      customerLifespan: 0
    };
  }

  // Calculate average order value
  const totalSpent = orders.reduce((sum, order) => {
    const orderTotal = order.orderItems.reduce((itemSum, item) => {
      return itemSum + (Number(item.pricePerUnit) * item.quantity);
    }, 0);
    return sum + orderTotal;
  }, 0);
  
  const avgOrderValue = totalSpent / orders.length;

  // Calculate purchase frequency (orders per month)
  const firstOrder = orders[0];
  const lastOrder = orders[orders.length - 1];
  
  if (!firstOrder || !lastOrder) {
    return {
      currentCLV: 0,
      predictedCLV: 0,
      purchaseFrequency: 0,
      avgOrderValue: 0,
      customerLifespan: 0
    };
  }
  
  const monthsSinceFirstOrder = Math.max(1, 
    (lastOrder.orderDate.getTime() - firstOrder.orderDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const purchaseFrequency = orders.length / monthsSinceFirstOrder;

  // Calculate customer lifespan (months)
  // Based on industry standards and customer behavior patterns
  const customerLifespan = calculateCustomerLifespan(orders, purchaseFrequency);

  // Calculate current CLV
  const currentCLV = avgOrderValue * purchaseFrequency * customerLifespan;

  // Calculate predicted CLV (with growth factor)
  const growthFactor = calculateGrowthFactor(orders);
  const predictedCLV = currentCLV * growthFactor;

  return {
    currentCLV: Math.round(currentCLV),
    predictedCLV: Math.round(predictedCLV),
    purchaseFrequency: Math.round(purchaseFrequency * 100) / 100,
    avgOrderValue: Math.round(avgOrderValue),
    customerLifespan: Math.round(customerLifespan)
  };
};

/**
 * Calculate customer lifespan based on purchase patterns
 */
const calculateCustomerLifespan = (orders: any[], purchaseFrequency: number): number => {
  if (orders.length < 2) return 12; // Default 12 months for new customers

  // Calculate time between orders
  const timeBetweenOrders = [];
  for (let i = 1; i < orders.length; i++) {
    const days = (orders[i].orderDate.getTime() - orders[i-1].orderDate.getTime()) / (1000 * 60 * 60 * 24);
    timeBetweenOrders.push(days);
  }

  const avgTimeBetweenOrders = timeBetweenOrders.reduce((sum, days) => sum + days, 0) / timeBetweenOrders.length;
  
  // Calculate churn probability based on recent activity
  const recentOrders = orders.filter(order => {
    const daysSinceLastOrder = (new Date().getTime() - order.orderDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastOrder <= 90; // Last 90 days
  });

  const churnProbability = 1 - (recentOrders.length / orders.length);
  
  // Lifespan calculation: Higher frequency = longer lifespan, Higher churn = shorter lifespan
  const baseLifespan = 24; // Base 24 months
  const frequencyFactor = Math.min(2, purchaseFrequency); // Cap at 2x
  const churnFactor = 1 - (churnProbability * 0.5); // Reduce by up to 50% for high churn
  
  return Math.round(baseLifespan * frequencyFactor * churnFactor);
};

/**
 * Calculate growth factor based on order trends
 */
const calculateGrowthFactor = (orders: any[]): number => {
  if (orders.length < 3) return 1.1; // Default 10% growth for new customers

  // Calculate order value trend
  const orderValues = orders.map(order => {
    return order.orderItems.reduce((sum: number, item: any) => {
      return sum + (Number(item.pricePerUnit) * item.quantity);
    }, 0);
  });

  // Calculate trend (simple linear regression)
  const n = orderValues.length;
  const sumX = (n * (n + 1)) / 2;
  const sumY = orderValues.reduce((sum, value) => sum + value, 0);
  const sumXY = orderValues.reduce((sum, value, index) => sum + (value * (index + 1)), 0);
  const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgValue = sumY / n;

  // Growth factor based on trend
  const trendGrowth = slope > 0 ? 1 + (slope / avgValue) : 1;
  
  // Cap growth between 0.8 and 1.5
  return Math.max(0.8, Math.min(1.5, trendGrowth));
};

/**
 * Calculate churn risk using machine learning approach
 */
export const calculateChurnRisk = async (customerId: number): Promise<number> => {
  const orders = await prisma.order.findMany({
    where: { customerId },
    orderBy: { orderDate: 'desc' }
  });

  if (orders.length === 0) return 0.5; // 50% risk for customers with no orders

  // Features for churn prediction
  const features = await calculateChurnFeatures(customerId, orders);
  
  // Churn risk calculation using weighted features
  const weights = {
    recency: 0.3,
    frequency: 0.25,
    monetary: 0.2,
    orderValueTrend: 0.15,
    categoryDiversity: 0.1
  };

  const churnRisk = 
    (features.recencyScore * weights.recency) +
    (features.frequencyScore * weights.frequency) +
    (features.monetaryScore * weights.monetary) +
    (features.orderValueTrend * weights.orderValueTrend) +
    (features.categoryDiversity * weights.categoryDiversity);

  return Math.max(0, Math.min(1, churnRisk));
};

/**
 * Calculate churn prediction features
 */
const calculateChurnFeatures = async (customerId: number, orders: any[]): Promise<{
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  orderValueTrend: number;
  categoryDiversity: number;
}> => {
  // Recency score (days since last order)
  const daysSinceLastOrder = (new Date().getTime() - orders[0].orderDate.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.min(1, daysSinceLastOrder / 365); // Normalize to 0-1

  // Frequency score (orders per month)
  const monthsSinceFirstOrder = Math.max(1, 
    (new Date().getTime() - orders[orders.length - 1].orderDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const frequency = orders.length / monthsSinceFirstOrder;
  const frequencyScore = Math.max(0, 1 - (frequency / 2)); // Higher frequency = lower churn risk

  // Monetary score (average order value)
  const totalSpent = orders.reduce((sum: number, order: any) => {
    return sum + order.orderItems.reduce((itemSum: number, item: any) => {
      return itemSum + (Number(item.pricePerUnit) * item.quantity);
    }, 0);
  }, 0);
  const avgOrderValue = totalSpent / orders.length;
  const monetaryScore = Math.max(0, 1 - (avgOrderValue / 10000)); // Higher value = lower churn risk

  // Order value trend
  const orderValues = orders.slice(0, 3).map(order => {
    return order.orderItems.reduce((sum: number, item: any) => {
      return sum + (Number(item.pricePerUnit) * item.quantity);
    }, 0);
  });
  const trend = orderValues.length > 1 ? 
    (orderValues[0] - orderValues[orderValues.length - 1]) / orderValues[orderValues.length - 1] : 0;
  const orderValueTrend = trend < 0 ? Math.abs(trend) : 0; // Negative trend increases churn risk

  // Category diversity
  const categories = new Set();
  orders.forEach(order => {
    order.orderItems.forEach((item: any) => {
      if (item.item.categoryId) categories.add(item.item.categoryId);
    });
  });
  const categoryDiversity = Math.max(0, 1 - (categories.size / 5)); // More categories = lower churn risk

  return {
    recencyScore,
    frequencyScore,
    monetaryScore,
    orderValueTrend,
    categoryDiversity
  };
};

/**
 * Predict next purchase date
 */
export const predictNextPurchaseDate = async (customerId: number): Promise<Date | null> => {
  const orders = await prisma.order.findMany({
    where: { customerId },
    orderBy: { orderDate: 'desc' }
  });

  if (orders.length < 2) return null;

  // Calculate average time between orders
  const timeBetweenOrders = [];
  for (let i = 0; i < orders.length - 1; i++) {
    const currentOrder = orders[i];
    const nextOrder = orders[i + 1];
    if (currentOrder && nextOrder) {
      const days = (currentOrder.orderDate.getTime() - nextOrder.orderDate.getTime()) / (1000 * 60 * 60 * 24);
      timeBetweenOrders.push(days);
    }
  }

  const avgDaysBetweenOrders = timeBetweenOrders.reduce((sum, days) => sum + days, 0) / timeBetweenOrders.length;
  const lastOrderDate = orders[0]?.orderDate;
  
  if (!lastOrderDate) return null;
  
  const nextPurchaseDate = new Date(lastOrderDate.getTime() + (avgDaysBetweenOrders * 24 * 60 * 60 * 1000));
  
  // Don't predict more than 1 year in the future
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  
  return nextPurchaseDate > maxDate ? null : nextPurchaseDate;
};

/**
 * Generate recommended actions based on customer data
 */
export const generateRecommendedActions = async (customerId: number, churnRisk: number, clv: number): Promise<string[]> => {
  const actions = [];

  // High churn risk actions
  if (churnRisk > 0.7) {
    actions.push('retention_campaign', 'loyalty_program', 'discount_offer');
  } else if (churnRisk > 0.4) {
    actions.push('engagement_campaign', 'personalized_offers');
  }

  // High CLV actions
  if (clv > 50000) {
    actions.push('vip_treatment', 'exclusive_offers', 'premium_support');
  } else if (clv > 20000) {
    actions.push('cross_selling', 'upselling_opportunities');
  }

  // Default actions
  if (actions.length === 0) {
    actions.push('regular_engagement', 'product_recommendations');
  }

  return actions.slice(0, 3); // Return top 3 actions
};

/**
 * Calculate retention rate for a customer
 */
export const calculateRetentionRate = async (customerId: number): Promise<number> => {
  const orders = await prisma.order.findMany({
    where: { customerId },
    orderBy: { orderDate: 'asc' }
  });

  if (orders.length < 2) return 0.6; // Default 60% for new customers

  // Calculate retention based on repeat purchases
  const firstOrder = orders[0];
  const lastOrder = orders[orders.length - 1];
  
  if (!firstOrder || !lastOrder) return 0.6;
  
  const totalDays = (lastOrder.orderDate.getTime() - firstOrder.orderDate.getTime()) / (1000 * 60 * 60 * 24);
  const expectedPurchases = Math.ceil(totalDays / 30); // Assume monthly purchases
  const actualPurchases = orders.length;
  
  return Math.min(1, actualPurchases / expectedPurchases);
}; 