export interface PotentialCustomersConfig {
  scoring: {
    purchaseFrequency: {
      thresholds: number[]; // similar products count
      weights: number[]; // scores
    };
    totalSpent: {
      thresholds: number[]; // USD amounts
      weights: number[]; // scores
    };
    recency: {
      thresholds: number[]; // days since last purchase
      weights: number[]; // scores (lower days = higher score)
    };
    diversity: {
      categoryThresholds: number[]; // category count
      brandThresholds: number[]; // brand count
      weights: number[]; // scores
    };
  };
  interestLevels: {
    high: { minScore: number; maxScore: number };
    medium: { minScore: number; maxScore: number };
    low: { minScore: number; maxScore: number };
  };
  marketingInsights: {
    segments: {
      tech_enthusiasts: string;
      value_seekers: string;
      premium_buyers: string;
      casual_shoppers: string;
    };
    channels: {
      email: string;
      social_media: string;
      sms: string;
      push_notifications: string;
    };
    timing: {
      weekend_mornings: string;
      weekday_evenings: string;
      lunch_breaks: string;
      late_night: string;
    };
  };
  salesIntelligence: {
    leadScoring: {
      high: { minScore: number; maxScore: number };
      medium: { minScore: number; maxScore: number };
      low: { minScore: number; maxScore: number };
    };
    conversionProbability: {
      high: { minScore: number; maxScore: number };
      medium: { minScore: number; maxScore: number };
      low: { minScore: number; maxScore: number };
    };
  };
}

// Default Potential Customers Configuration (USD-based)
export const DEFAULT_POTENTIAL_CUSTOMERS_CONFIG: PotentialCustomersConfig = {
  scoring: {
    purchaseFrequency: {
      thresholds: [1, 3, 5, 10, 20], // similar products count
      weights: [1, 2, 3, 4, 5] // scores
    },
    totalSpent: {
      thresholds: [100, 500, 1000, 5000, 10000], // USD amounts
      weights: [1, 2, 3, 4, 5] // scores
    },
    recency: {
      thresholds: [30, 60, 90, 180, 365], // days since last purchase
      weights: [5, 4, 3, 2, 1] // scores (lower days = higher score)
    },
    diversity: {
      categoryThresholds: [1, 2, 3, 5, 10], // category count
      brandThresholds: [1, 2, 3, 5, 10], // brand count
      weights: [1, 2, 3, 4, 5] // scores
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
};

// High-Value Business Configuration
export const HIGH_VALUE_POTENTIAL_CUSTOMERS_CONFIG: PotentialCustomersConfig = {
  scoring: {
    purchaseFrequency: {
      thresholds: [2, 5, 10, 20, 50], // Higher expectations
      weights: [1, 2, 3, 4, 5]
    },
    totalSpent: {
      thresholds: [1000, 5000, 10000, 50000, 100000], // Higher thresholds
      weights: [1, 2, 3, 4, 5]
    },
    recency: {
      thresholds: [15, 30, 60, 120, 180], // More aggressive
      weights: [5, 4, 3, 2, 1]
    },
    diversity: {
      categoryThresholds: [2, 3, 5, 10, 20], // Higher expectations
      brandThresholds: [2, 3, 5, 10, 20],
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
      tech_enthusiasts: "VIP customers with high technology spending and premium preferences",
      value_seekers: "High-value customers who focus on quality and features over price",
      premium_buyers: "Luxury customers who prefer exclusive and high-end products",
      casual_shoppers: "Affluent customers with diverse interests and occasional purchases"
    },
    channels: {
      email: "Premium email campaigns with exclusive content and early access",
      social_media: "Luxury brand positioning and influencer partnerships",
      sms: "VIP notifications and exclusive offers",
      push_notifications: "Premium app experience with personalized content"
    },
    timing: {
      weekend_mornings: "Luxury shopping experience and exclusive events",
      weekday_evenings: "After-hours VIP shopping and consultations",
      lunch_breaks: "Executive shopping and business solutions",
      late_night: "Premium mobile experience and exclusive access"
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
};

// Small Business Configuration
export const SMALL_BUSINESS_POTENTIAL_CUSTOMERS_CONFIG: PotentialCustomersConfig = {
  scoring: {
    purchaseFrequency: {
      thresholds: [1, 2, 3, 5, 10], // Lower expectations
      weights: [1, 2, 3, 4, 5]
    },
    totalSpent: {
      thresholds: [50, 200, 500, 1000, 5000], // Lower thresholds
      weights: [1, 2, 3, 4, 5]
    },
    recency: {
      thresholds: [60, 120, 180, 365, 730], // More lenient
      weights: [5, 4, 3, 2, 1]
    },
    diversity: {
      categoryThresholds: [1, 2, 3, 5, 10], // Lower expectations
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
      tech_enthusiasts: "Small business customers interested in technology solutions",
      value_seekers: "Budget-conscious customers looking for affordable options",
      premium_buyers: "Small business owners willing to invest in quality",
      casual_shoppers: "Local customers with occasional technology needs"
    },
    channels: {
      email: "Simple email campaigns with clear value propositions",
      social_media: "Local community engagement and word-of-mouth",
      sms: "Simple notifications and local offers",
      push_notifications: "Basic app functionality and local updates"
    },
    timing: {
      weekend_mornings: "Local business hours and community events",
      weekday_evenings: "After-work local shopping and consultations",
      lunch_breaks: "Local business networking and quick purchases",
      late_night: "Online research and mobile browsing"
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
};

export const getPotentialCustomersConfig = (businessType: string = 'default'): PotentialCustomersConfig => {
  switch (businessType.toLowerCase()) {
    case 'high_value':
    case 'high_value_business':
      return HIGH_VALUE_POTENTIAL_CUSTOMERS_CONFIG;
    case 'small_business':
    case 'small_business_config':
      return SMALL_BUSINESS_POTENTIAL_CUSTOMERS_CONFIG;
    case 'default':
    default:
      return DEFAULT_POTENTIAL_CUSTOMERS_CONFIG;
  }
}; 