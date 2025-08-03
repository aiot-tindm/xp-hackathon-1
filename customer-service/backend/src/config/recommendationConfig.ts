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

// Default configuration
export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationConfig = {
  confidence: {
    high: 0.8,
    medium: 0.6,
    low: 0.4
  },
  discountRates: {
    whale: 0.20, // 20%
    vip: 0.15,   // 15%
    regular: 0.10, // 10%
    new: 0.05,   // 5%
    churn: 0.25  // 25% (higher to retain)
  },
  targetAmounts: {
    whale: 10000,
    vip: 5000,
    regular: 2000,
    new: 1000,
    churn: 1500
  },
  limits: {
    products: 5,
    promotions: 3,
    strategies: 2
  },
  algorithmWeights: {
    collaborativeFiltering: 0.4,
    contentBased: 0.3,
    popularity: 0.2,
    recency: 0.1
  },
  performance: {
    minClickRate: 0.05,
    minConversionRate: 0.02,
    minRevenueImpact: 100
  },
  seasonalFactors: {
    spring: 1.1,
    summer: 1.0,
    autumn: 1.05,
    winter: 1.15
  },
  priceSensitivity: {
    high: 0.8,
    medium: 0.5,
    low: 0.2
  }
};

// High-value business configuration
export const HIGH_VALUE_RECOMMENDATION_CONFIG: RecommendationConfig = {
  ...DEFAULT_RECOMMENDATION_CONFIG,
  discountRates: {
    whale: 0.25,
    vip: 0.20,
    regular: 0.15,
    new: 0.10,
    churn: 0.30
  },
  targetAmounts: {
    whale: 20000,
    vip: 10000,
    regular: 5000,
    new: 2000,
    churn: 3000
  },
  algorithmWeights: {
    collaborativeFiltering: 0.5,
    contentBased: 0.3,
    popularity: 0.1,
    recency: 0.1
  }
};

// Electronics business configuration
export const ELECTRONICS_RECOMMENDATION_CONFIG: RecommendationConfig = {
  ...DEFAULT_RECOMMENDATION_CONFIG,
  discountRates: {
    whale: 0.15,
    vip: 0.12,
    regular: 0.08,
    new: 0.05,
    churn: 0.20
  },
  targetAmounts: {
    whale: 15000,
    vip: 8000,
    regular: 3000,
    new: 1500,
    churn: 2500
  },
  algorithmWeights: {
    collaborativeFiltering: 0.3,
    contentBased: 0.5,
    popularity: 0.1,
    recency: 0.1
  }
};

// Fashion/Sports business configuration
export const FASHION_SPORTS_RECOMMENDATION_CONFIG: RecommendationConfig = {
  ...DEFAULT_RECOMMENDATION_CONFIG,
  discountRates: {
    whale: 0.18,
    vip: 0.14,
    regular: 0.10,
    new: 0.06,
    churn: 0.22
  },
  targetAmounts: {
    whale: 8000,
    vip: 4000,
    regular: 2000,
    new: 1000,
    churn: 1800
  },
  algorithmWeights: {
    collaborativeFiltering: 0.4,
    contentBased: 0.2,
    popularity: 0.3,
    recency: 0.1
  },
  seasonalFactors: {
    spring: 1.2,
    summer: 1.1,
    autumn: 1.0,
    winter: 1.3
  }
};

// Small business configuration
export const SMALL_BUSINESS_RECOMMENDATION_CONFIG: RecommendationConfig = {
  ...DEFAULT_RECOMMENDATION_CONFIG,
  discountRates: {
    whale: 0.12,
    vip: 0.10,
    regular: 0.08,
    new: 0.05,
    churn: 0.15
  },
  targetAmounts: {
    whale: 5000,
    vip: 2500,
    regular: 1000,
    new: 500,
    churn: 800
  },
  algorithmWeights: {
    collaborativeFiltering: 0.2,
    contentBased: 0.3,
    popularity: 0.4,
    recency: 0.1
  }
};

/**
 * Get recommendation configuration based on business type
 */
export const getRecommendationConfig = (businessType: string = 'default'): RecommendationConfig => {
  switch (businessType.toLowerCase()) {
    case 'high_value':
      return HIGH_VALUE_RECOMMENDATION_CONFIG;
    case 'electronics':
      return ELECTRONICS_RECOMMENDATION_CONFIG;
    case 'fashion':
    case 'sports':
      return FASHION_SPORTS_RECOMMENDATION_CONFIG;
    case 'small_business':
      return SMALL_BUSINESS_RECOMMENDATION_CONFIG;
    default:
      return DEFAULT_RECOMMENDATION_CONFIG;
  }
}; 