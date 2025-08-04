import { getConfig } from '../services/configService';

export interface RecommendationConfig {
  // Confidence score thresholds
  confidence: {
    high: number;
    medium: number;
    low: number;
  };
  
  // Discount rates by segment
  discountRates: {
    whale: number;
    vip: number;
    regular: number;
    new: number;
    churn: number;
  };
  
  // Target amounts for promotions
  targetAmounts: {
    whale: number;
    vip: number;
    regular: number;
    new: number;
    churn: number;
  };
  
  // Recommendation limits
  limits: {
    products: number;
    promotions: number;
    strategies: number;
  };
  
  // Algorithm weights
  algorithmWeights: {
    collaborativeFiltering: number;
    contentBased: number;
    popularity: number;
    recency: number;
  };
  
  // Performance thresholds
  performance: {
    minClickRate: number;
    minConversionRate: number;
    minRevenueImpact: number;
  };
  
  // Seasonal factors
  seasonalFactors: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
  
  // Price sensitivity thresholds
  priceSensitivity: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Get recommendation configuration from database
 * @param businessType - Business type (defaults to 'default')
 * @returns RecommendationConfig
 */
export const getRecommendationConfig = async (businessType: string = 'default'): Promise<RecommendationConfig> => {
  return await getConfig<RecommendationConfig>('recommendation', businessType);
}; 