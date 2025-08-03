export interface ChurnConfig {
  riskFactors: {
    inactivity: {
      thresholds: number[]; // days
      weights: number[]; // risk scores
    };
    orderFrequency: {
      thresholds: number[]; // orders
      weights: number[]; // risk scores
    };
    orderValue: {
      thresholds: number[]; // USD amounts
      weights: number[]; // risk scores
    };
    engagement: {
      thresholds: number[]; // engagement scores
      weights: number[]; // risk scores
    };
  };
  riskLevels: {
    high: { minRisk: number; maxRisk: number };
    medium: { minRisk: number; maxRisk: number };
    low: { minRisk: number; maxRisk: number };
  };
  retentionStrategies: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  insights: {
    reasons: {
      price_sensitivity: string;
      lack_of_engagement: string;
      poor_experience: string;
      competitor_switch: string;
      seasonal_pattern: string;
      life_change: string;
    };
    difficulty: {
      easy: string;
      medium: string;
      hard: string;
    };
  };
}

// Default Churn Configuration (USD-based)
export const DEFAULT_CHURN_CONFIG: ChurnConfig = {
  riskFactors: {
    inactivity: {
      thresholds: [30, 60, 90, 180, 365], // days
      weights: [0.1, 0.2, 0.3, 0.5, 0.8] // risk scores
    },
    orderFrequency: {
      thresholds: [1, 2, 3, 5, 10], // orders
      weights: [0.4, 0.3, 0.2, 0.1, 0.05] // risk scores (lower orders = higher risk)
    },
    orderValue: {
      thresholds: [100, 500, 1000, 5000, 10000], // USD amounts
      weights: [0.3, 0.2, 0.15, 0.1, 0.05] // risk scores (lower value = higher risk)
    },
    engagement: {
      thresholds: [0.2, 0.4, 0.6, 0.8, 1.0], // engagement scores
      weights: [0.8, 0.6, 0.4, 0.2, 0.1] // risk scores (lower engagement = higher risk)
    }
  },
  riskLevels: {
    high: { minRisk: 0.7, maxRisk: 1.0 },
    medium: { minRisk: 0.4, maxRisk: 0.69 },
    low: { minRisk: 0.0, maxRisk: 0.39 }
  },
  retentionStrategies: {
    immediate: [
      "personal_contact",
      "special_offer",
      "account_review",
      "feedback_survey"
    ],
    shortTerm: [
      "loyalty_program",
      "product_recommendations",
      "exclusive_access",
      "early_bird_offers"
    ],
    longTerm: [
      "relationship_building",
      "value_proposition",
      "community_engagement",
      "referral_program"
    ]
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
};

// High-Value Business Churn Configuration
export const HIGH_VALUE_CHURN_CONFIG: ChurnConfig = {
  riskFactors: {
    inactivity: {
      thresholds: [15, 30, 60, 120, 180], // More aggressive
      weights: [0.2, 0.3, 0.5, 0.7, 0.9]
    },
    orderFrequency: {
      thresholds: [2, 5, 10, 20, 50], // Higher expectations
      weights: [0.5, 0.3, 0.2, 0.1, 0.05]
    },
    orderValue: {
      thresholds: [1000, 5000, 10000, 50000, 100000], // Higher thresholds
      weights: [0.4, 0.3, 0.2, 0.1, 0.05]
    },
    engagement: {
      thresholds: [0.3, 0.5, 0.7, 0.9, 1.0],
      weights: [0.9, 0.7, 0.5, 0.3, 0.1]
    }
  },
  riskLevels: {
    high: { minRisk: 0.7, maxRisk: 1.0 },
    medium: { minRisk: 0.4, maxRisk: 0.69 },
    low: { minRisk: 0.0, maxRisk: 0.39 }
  },
  retentionStrategies: {
    immediate: [
      "vip_contact",
      "premium_offer",
      "dedicated_support",
      "exclusive_event"
    ],
    shortTerm: [
      "vip_loyalty_program",
      "premium_recommendations",
      "early_access",
      "personalized_service"
    ],
    longTerm: [
      "relationship_management",
      "premium_value_proposition",
      "exclusive_community",
      "referral_incentives"
    ]
  },
  insights: {
    reasons: {
      price_sensitivity: "VIP customer may be exploring premium alternatives",
      lack_of_engagement: "VIP customer engagement has declined significantly",
      poor_experience: "VIP customer may have had service quality issues",
      competitor_switch: "VIP customer may be courted by competitors",
      seasonal_pattern: "VIP customer follows luxury seasonal patterns",
      life_change: "VIP customer circumstances may have changed"
    },
    difficulty: {
      easy: "VIP customer likely to respond to premium retention efforts",
      medium: "VIP customer requires personalized retention approach",
      hard: "VIP customer may require exceptional retention strategies"
    }
  }
};

// Small Business Churn Configuration
export const SMALL_BUSINESS_CHURN_CONFIG: ChurnConfig = {
  riskFactors: {
    inactivity: {
      thresholds: [60, 120, 180, 365, 730], // More lenient
      weights: [0.05, 0.1, 0.2, 0.4, 0.7]
    },
    orderFrequency: {
      thresholds: [1, 2, 3, 5, 10], // Lower expectations
      weights: [0.2, 0.15, 0.1, 0.05, 0.02]
    },
    orderValue: {
      thresholds: [50, 200, 500, 1000, 5000], // Lower thresholds
      weights: [0.2, 0.15, 0.1, 0.05, 0.02]
    },
    engagement: {
      thresholds: [0.1, 0.3, 0.5, 0.7, 1.0],
      weights: [0.6, 0.4, 0.3, 0.2, 0.1]
    }
  },
  riskLevels: {
    high: { minRisk: 0.7, maxRisk: 1.0 },
    medium: { minRisk: 0.4, maxRisk: 0.69 },
    low: { minRisk: 0.0, maxRisk: 0.39 }
  },
  retentionStrategies: {
    immediate: [
      "friendly_contact",
      "simple_offer",
      "feedback_request",
      "problem_resolution"
    ],
    shortTerm: [
      "simple_loyalty_program",
      "basic_recommendations",
      "regular_communication",
      "helpful_resources"
    ],
    longTerm: [
      "community_building",
      "value_education",
      "trust_building",
      "referral_program"
    ]
  },
  insights: {
    reasons: {
      price_sensitivity: "Small business customer is price-conscious",
      lack_of_engagement: "Small business customer needs more support",
      poor_experience: "Small business customer may have had issues",
      competitor_switch: "Small business customer may be exploring alternatives",
      seasonal_pattern: "Small business customer follows business cycles",
      life_change: "Small business customer circumstances may have changed"
    },
    difficulty: {
      easy: "Small business customer likely to respond to simple retention efforts",
      medium: "Small business customer needs personalized attention",
      hard: "Small business customer may require significant retention effort"
    }
  }
};

export const getChurnConfig = (businessType: string = 'default'): ChurnConfig => {
  switch (businessType.toLowerCase()) {
    case 'high_value':
    case 'high_value_business':
      return HIGH_VALUE_CHURN_CONFIG;
    case 'small_business':
    case 'small_business_config':
      return SMALL_BUSINESS_CHURN_CONFIG;
    case 'default':
    default:
      return DEFAULT_CHURN_CONFIG;
  }
}; 