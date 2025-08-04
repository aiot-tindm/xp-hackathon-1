import prisma from '../models/database';
import logger from '../utils/logger';

// Config types
export type ConfigType = 'segmentation' | 'churn' | 'rfm' | 'recommendation' | 'potential_customers';

// Base config interface
export interface BaseConfig {
  [key: string]: any;
}

// Default configurations
export const DEFAULT_CONFIGS = {
  segmentation: {
    whale: {
      minTotalSpent: 80000,
      minOrders: 15,
      minAvgOrderValue: 4000
    },
    vip: {
      minTotalSpent: 40000,
      maxTotalSpent: 80000,
      minOrders: 10,
      minAvgOrderValue: 2000
    },
    regular: {
      minTotalSpent: 10000,
      maxTotalSpent: 40000,
      minOrders: 5
    },
    churn: {
      maxDaysSinceLastOrder: 500
    }
  },
  churn: {
    riskFactors: {
      inactivity: {
        thresholds: [30, 60, 90, 180, 365],
        weights: [0.1, 0.2, 0.3, 0.5, 0.8]
      },
      orderFrequency: {
        thresholds: [1, 2, 3, 5, 10],
        weights: [0.4, 0.3, 0.2, 0.1, 0.05]
      },
      orderValue: {
        thresholds: [100, 500, 1000, 5000, 10000],
        weights: [0.3, 0.2, 0.15, 0.1, 0.05]
      },
      engagement: {
        thresholds: [0.2, 0.4, 0.6, 0.8, 1.0],
        weights: [0.8, 0.6, 0.4, 0.2, 0.1]
      }
    },
    riskLevels: {
      high: { minRisk: 0.7, maxRisk: 1.0 },
      medium: { minRisk: 0.4, maxRisk: 0.69 },
      low: { minRisk: 0.0, maxRisk: 0.39 }
    },
    retentionStrategies: {
      immediate: ["personal_contact", "special_offer", "account_review", "feedback_survey"],
      shortTerm: ["loyalty_program", "product_recommendations", "exclusive_access", "early_bird_offers"],
      longTerm: ["relationship_building", "value_proposition", "community_engagement", "referral_program"]
    },
    insights: {
      reasons: {
        price_sensitivity: "Customer shows signs of price sensitivity and may be comparing with competitors",
        lack_of_engagement: "Customer has low engagement with brand communications and promotions",
        poor_experience: "Customer may have had negative experiences with products or service",
        competitor_switch: "Customer behavior suggests they may be exploring competitor offerings",
        seasonal_pattern: "Customer follows seasonal purchasing patterns",
        life_change: "Customer behavior change may indicate life circumstances have changed"
      },
      difficulty: {
        easy: "High probability of retention with targeted engagement",
        medium: "Moderate effort required for retention, focus on value proposition",
        hard: "Low probability of retention, may require aggressive win-back strategies"
      }
    }
  },
  rfm: {
    scoring: {
      recency: {
        thresholds: [30, 60, 90, 180],
        weights: [5, 4, 3, 2, 1]
      },
      frequency: {
        thresholds: [2, 3, 5, 10],
        weights: [1, 2, 3, 4, 5]
      },
      monetary: {
        thresholds: [500, 2000, 10000, 50000],
        weights: [1, 2, 3, 4, 5]
      }
    },
    segments: {
      champions: { minScore: 13, maxScore: 15 },
      loyal: { minScore: 11, maxScore: 12 },
      atRisk: { minScore: 8, maxScore: 10 },
      cantLose: { minScore: 6, maxScore: 7 },
      lost: { minScore: 3, maxScore: 5 }
    },
    insights: {
      recency: {
        excellent: "Customer purchased very recently (within 30 days)",
        good: "Customer purchased recently (within 60 days)",
        average: "Customer purchased within 90 days",
        poor: "Customer purchased within 180 days",
        critical: "Customer hasn't purchased for over 180 days"
      },
      frequency: {
        excellent: "Customer orders very frequently (10+ orders)",
        good: "Customer orders frequently (5-9 orders)",
        average: "Customer orders moderately (3-4 orders)",
        poor: "Customer orders occasionally (2 orders)",
        critical: "Customer has only 1 order"
      },
      monetary: {
        excellent: "Customer spends very high amounts ($50K+)",
        good: "Customer spends high amounts ($10K-$50K)",
        average: "Customer spends moderate amounts ($2K-$10K)",
        poor: "Customer spends low amounts ($500-$2K)",
        critical: "Customer spends very low amounts (<$500)"
      }
    }
  },
  recommendation: {
    confidence: {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    },
    discountRates: {
      whale: 0.20,
      vip: 0.15,
      regular: 0.10,
      new: 0.05,
      churn: 0.25
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
  },
  potential_customers: {
    scoring: {
      purchaseFrequency: {
        thresholds: [1, 3, 5, 10, 20],
        weights: [1, 2, 3, 4, 5]
      },
      totalSpent: {
        thresholds: [100, 500, 1000, 5000, 10000],
        weights: [1, 2, 3, 4, 5]
      },
      recency: {
        thresholds: [30, 60, 90, 180, 365],
        weights: [5, 4, 3, 2, 1]
      },
      diversity: {
        categoryThresholds: [1, 2, 3, 5, 10],
        brandThresholds: [1, 2, 3, 5, 10],
        weights: [1, 2, 3, 4, 5]
      }
    },
    interestLevels: {
      high: { minScore: 7, maxScore: 10 },
      medium: { minScore: 4, maxScore: 6 },
      low: { minScore: 1, maxScore: 3 }
    },
    marketingInsights: {
      segments: {
        tech_enthusiasts: "Customers who frequently purchase technology products and show high engagement with tech categories",
        value_seekers: "Customers who focus on price-performance ratio and look for deals",
        premium_buyers: "Customers who prefer high-end products and are less price-sensitive",
        casual_shoppers: "Customers with occasional purchases and varied interests"
      },
      channels: {
        email: "Most effective for detailed product information and personalized offers",
        social_media: "Best for brand awareness and product discovery",
        sms: "Effective for time-sensitive offers and quick updates",
        push_notifications: "Good for app users and immediate engagement"
      },
      timing: {
        weekend_mornings: "Optimal for leisurely browsing and major purchases",
        weekday_evenings: "Good for after-work shopping and research",
        lunch_breaks: "Effective for quick purchases and mobile shopping",
        late_night: "Suitable for impulse purchases and mobile users"
      }
    },
    salesIntelligence: {
      leadScoring: {
        high: { minScore: 8, maxScore: 10 },
        medium: { minScore: 5, maxScore: 7 },
        low: { minScore: 1, maxScore: 4 }
      },
      conversionProbability: {
        high: { minScore: 0.7, maxScore: 1.0 },
        medium: { minScore: 0.4, maxScore: 0.69 },
        low: { minScore: 0.0, maxScore: 0.39 }
      }
    }
  }
};

/**
 * Get configuration from database
 * @param configType - Type of configuration
 * @param businessType - Business type (defaults to 'default')
 * @returns Configuration object
 */
export const getConfig = async <T extends BaseConfig>(
  configType: ConfigType,
  businessType: string = 'default'
): Promise<T> => {
  try {
    const configRecord = await prisma.systemConfig.findUnique({
      where: {
        configType_businessType: {
          configType,
          businessType
        },
        isActive: true
      }
    });

    if (configRecord) {
      logger.info(`Retrieved ${configType} config for business type: ${businessType}`);
      const config = JSON.parse(configRecord.config as string) as T;
      return config || (DEFAULT_CONFIGS[configType] as unknown as T);
    }

    // If no config found, return default
    logger.warn(`No ${configType} config found for business type: ${businessType}, using default`);
    return DEFAULT_CONFIGS[configType] as unknown as T;
  } catch (error) {
    logger.error(`Error retrieving ${configType} config:`, error);
    return DEFAULT_CONFIGS[configType] as unknown as T;
  }
}; 