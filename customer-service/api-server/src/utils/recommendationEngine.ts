import { PrismaClient } from '@prisma/client';
import { RecommendationConfig } from '../config/recommendationConfig';

const prisma = new PrismaClient();

export interface ProductRecommendation {
  sku: string;
  name: string;
  reason: string;
  confidence: number;
  algorithm: string;
  category: string;
  brand: string;
  price: number;
  stockQuantity: number;
}

export interface PromotionRecommendation {
  type: string;
  description: string;
  validUntil: string;
  targetAmount: number;
  discountRate: number;
  segment: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StrategyRecommendation {
  type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: number;
  implementationCost: number;
}

export interface CustomerPreferences {
  categoryPreferences: Map<string, number>;
  brandPreferences: Map<string, number>;
  priceRange: { min: number; max: number; avg: number };
  seasonalPatterns: Map<string, number>;
  purchaseFrequency: number;
  avgOrderValue: number;
}

/**
 * Analyze customer preferences based on purchase history
 */
export const analyzeCustomerPreferences = async (customerId: number): Promise<CustomerPreferences> => {
  const orders = await prisma.order.findMany({
    where: { customerId },
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
    orderBy: { orderDate: 'desc' }
  });

  const categoryPreferences = new Map<string, number>();
  const brandPreferences = new Map<string, number>();
  const seasonalPatterns = new Map<string, number>();
  const prices: number[] = [];

  orders.forEach((order: any) => {
    const month = order.orderDate.getMonth();
    const season = getSeason(month);
    
    order.orderItems.forEach((item: any) => {
      const category = item.item.category?.name || 'Unknown';
      const brand = item.item.brand?.name || 'Unknown';
      const price = Number(item.pricePerUnit);
      
      // Category preferences
      categoryPreferences.set(category, (categoryPreferences.get(category) || 0) + item.quantity);
      
      // Brand preferences
      brandPreferences.set(brand, (brandPreferences.get(brand) || 0) + item.quantity);
      
      // Price analysis
      prices.push(price);
      
      // Seasonal patterns
      seasonalPatterns.set(season, (seasonalPatterns.get(season) || 0) + item.quantity);
    });
  });

  const totalSpent = orders.reduce((sum: number, order: any) => 
    sum + order.orderItems.reduce((orderSum: number, item: any) => 
      orderSum + (Number(item.pricePerUnit) * item.quantity), 0), 0
  );

  return {
    categoryPreferences,
    brandPreferences,
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length
    },
    seasonalPatterns,
    purchaseFrequency: orders.length / Math.max(1, (Date.now() - (orders[orders.length - 1]?.orderDate.getTime() || Date.now())) / (1000 * 60 * 60 * 24 * 30)),
    avgOrderValue: totalSpent / orders.length
  };
};

/**
 * Collaborative filtering algorithm
 */
export const collaborativeFiltering = async (customerId: number, config: RecommendationConfig): Promise<ProductRecommendation[]> => {
  // Find similar customers based on purchase patterns
  const customerPreferences = await analyzeCustomerPreferences(customerId);
  
  // Get all customers with similar preferences
  const similarCustomers = await findSimilarCustomers(customerId, customerPreferences);
  
  // Get products bought by similar customers but not by current customer
  const recommendedProducts = await getProductsFromSimilarCustomers(customerId, similarCustomers);
  
  return recommendedProducts.map((product: any) => ({
    sku: product.sku,
    name: product.name,
    reason: `Popular among customers with similar preferences`,
    confidence: calculateCollaborativeConfidence(product, similarCustomers),
    algorithm: 'collaborative_filtering',
    category: product.category?.name || 'Unknown',
    brand: product.brand?.name || 'Unknown',
    price: Number(product.salePrice),
    stockQuantity: product.stockQuantity
  }));
};

/**
 * Content-based filtering algorithm
 */
export const contentBasedFiltering = async (customerId: number, config: RecommendationConfig): Promise<ProductRecommendation[]> => {
  const preferences = await analyzeCustomerPreferences(customerId);
  
  // Get products in preferred categories
  const topCategories = Array.from(preferences.categoryPreferences.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  const products = await prisma.item.findMany({
    where: {
      category: {
        name: { in: topCategories }
      },
      isActive: true,
      stockQuantity: { gt: 0 },
      salePrice: {
        gte: preferences.priceRange.min * 0.8,
        lte: preferences.priceRange.max * 1.2
      }
    },
    include: {
      category: true,
      brand: true
    },
    take: config.limits.products
  });

  return products.map((product: any) => ({
    sku: product.sku,
    name: product.name,
    reason: `Based on your preference for ${product.category?.name} products`,
    confidence: calculateContentBasedConfidence(product, preferences),
    algorithm: 'content_based',
    category: product.category?.name || 'Unknown',
    brand: product.brand?.name || 'Unknown',
    price: Number(product.salePrice),
    stockQuantity: product.stockQuantity
  }));
};

/**
 * Popularity-based recommendations
 */
export const popularityBasedFiltering = async (config: RecommendationConfig): Promise<ProductRecommendation[]> => {
  // Get most popular products based on sales
  const popularProducts = await prisma.orderItem.groupBy({
    by: ['itemId'],
    _sum: {
      quantity: true
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    },
    take: config.limits.products
  });

  const productIds = popularProducts.map((p: any) => p.itemId);
  const products = await prisma.item.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
      stockQuantity: { gt: 0 }
    },
    include: {
      category: true,
      brand: true
    }
  });

  return products.map((product: any) => ({
    sku: product.sku,
    name: product.name,
    reason: 'Popular among all customers',
    confidence: 0.7, // Base confidence for popular items
    algorithm: 'popularity_based',
    category: product.category?.name || 'Unknown',
    brand: product.brand?.name || 'Unknown',
    price: Number(product.salePrice),
    stockQuantity: product.stockQuantity
  }));
};

/**
 * Generate promotional recommendations
 */
export const generatePromotions = async (
  customerId: number, 
  segment: string, 
  config: RecommendationConfig
): Promise<PromotionRecommendation[]> => {
  const promotions: PromotionRecommendation[] = [];
  
  // Loyalty discount based on segment
  const discountRate = config.discountRates[segment as keyof typeof config.discountRates] || 0.1;
  const targetAmount = config.targetAmounts[segment as keyof typeof config.targetAmounts] || 1000;
  
  promotions.push({
    type: 'loyalty_discount',
    description: `${Math.round(discountRate * 100)}% off on your next purchase`,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    targetAmount,
    discountRate,
    segment,
    priority: segment === 'whale' || segment === 'vip' ? 'high' : 'medium'
  });

  // Seasonal promotions
  const currentSeason = getSeason(new Date().getMonth());
  const seasonalFactor = config.seasonalFactors[currentSeason as keyof typeof config.seasonalFactors] || 1.0;
  
  if (seasonalFactor > 1.1) {
    promotions.push({
      type: 'seasonal_promotion',
      description: `${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} season special offer`,
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
      targetAmount: targetAmount * 0.8,
      discountRate: discountRate * 1.2,
      segment,
      priority: 'medium'
    });
  }

  // Retention promotions for churn customers
  if (segment === 'churn') {
    promotions.push({
      type: 'retention_offer',
      description: 'Special comeback offer',
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
      targetAmount: targetAmount * 0.5,
      discountRate: discountRate * 1.5,
      segment,
      priority: 'high'
    });
  }

  return promotions.slice(0, config.limits.promotions);
};

/**
 * Generate marketing strategies
 */
export const generateStrategies = async (
  customerId: number,
  segment: string,
  preferences: CustomerPreferences,
  config: RecommendationConfig
): Promise<StrategyRecommendation[]> => {
  const strategies: StrategyRecommendation[] = [];

  // Cross-selling strategy
  if (preferences.categoryPreferences.size > 1) {
    strategies.push({
      type: 'cross_selling',
      description: 'Recommend complementary products from different categories',
      priority: 'high',
      expectedImpact: 0.15,
      implementationCost: 0.05
    });
  }

  // Upselling strategy for high-value customers
  if (segment === 'whale' || segment === 'vip') {
    strategies.push({
      type: 'upselling',
      description: 'Recommend premium versions of purchased products',
      priority: 'high',
      expectedImpact: 0.25,
      implementationCost: 0.08
    });
  }

  // Personalization strategy
  if (preferences.brandPreferences.size > 2) {
    strategies.push({
      type: 'personalization',
      description: 'Create personalized product bundles based on brand preferences',
      priority: 'medium',
      expectedImpact: 0.12,
      implementationCost: 0.06
    });
  }

  // Seasonal strategy
  const currentSeason = getSeason(new Date().getMonth());
  const seasonalFactor = config.seasonalFactors[currentSeason as keyof typeof config.seasonalFactors] || 1.0;
  
  if (seasonalFactor > 1.1) {
    strategies.push({
      type: 'seasonal_marketing',
      description: `Focus on ${currentSeason} seasonal products`,
      priority: 'medium',
      expectedImpact: 0.10,
      implementationCost: 0.03
    });
  }

  return strategies.slice(0, config.limits.strategies);
};

// Helper functions
const getSeason = (month: number): string => {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

const findSimilarCustomers = async (customerId: number, preferences: CustomerPreferences): Promise<number[]> => {
  // This is a simplified version. In production, you'd use more sophisticated algorithms
  const similarCustomers = await prisma.order.groupBy({
    by: ['customerId'],
    where: {
      customerId: { not: customerId },
      orderItems: {
        some: {
          item: {
            category: {
              name: { in: Array.from(preferences.categoryPreferences.keys()) }
            }
          }
        }
      }
    },
    _count: {
      id: true
    },
    having: {
      id: {
        _count: {
          gte: 2
        }
      }
    }
  });

  return similarCustomers.map((c: any) => c.customerId);
};

const getProductsFromSimilarCustomers = async (customerId: number, similarCustomers: number[]): Promise<any[]> => {
  if (similarCustomers.length === 0) return [];

  const purchasedProducts = await prisma.orderItem.findMany({
    where: {
      order: {
        customerId: { in: similarCustomers }
      }
    },
    include: {
      item: {
        include: {
          category: true,
          brand: true
        }
      }
    }
  });

  // Filter out products already purchased by current customer
  const customerProducts = await prisma.orderItem.findMany({
    where: {
      order: { customerId }
    },
    select: { itemId: true }
  });

  const customerProductIds = new Set(customerProducts.map((p: any) => p.itemId));
  
  return purchasedProducts
    .filter((p: any)   => !customerProductIds.has(p.itemId))
    .map((p: any) => p.item)
    .filter((item: any, index: any, arr: any) => arr.findIndex((i: any) => i.id === item.id) === index); // Remove duplicates
};

const calculateCollaborativeConfidence = (product: any, similarCustomers: number[]): number => {
  // Base confidence based on number of similar customers
  const baseConfidence = Math.min(0.9, 0.5 + (similarCustomers.length * 0.1));
  
  // Adjust based on product popularity
  const popularityFactor = Math.min(1.0, product.stockQuantity / 100);
  
  return Math.round((baseConfidence * popularityFactor) * 100) / 100;
};

const calculateContentBasedConfidence = (product: any, preferences: CustomerPreferences): number => {
  const categoryPreference = preferences.categoryPreferences.get(product.category?.name) || 0;
  const brandPreference = preferences.brandPreferences.get(product.brand?.name) || 0;
  
  const categoryScore = Math.min(1.0, categoryPreference / 10);
  const brandScore = Math.min(1.0, brandPreference / 5);
  const priceScore = product.price >= preferences.priceRange.min && 
                     product.price <= preferences.priceRange.max ? 1.0 : 0.5;
  
  const confidence = (categoryScore * 0.4 + brandScore * 0.3 + priceScore * 0.3);
  return Math.round(confidence * 100) / 100;
}; 