export interface RFMConfig {
  scoring: {
    recency: {
      thresholds: number[]; // days
      weights: number[]; // scores 1-5
    };
    frequency: {
      thresholds: number[]; // order counts
      weights: number[]; // scores 1-5
    };
    monetary: {
      thresholds: number[]; // USD amounts
      weights: number[]; // scores 1-5
    };
  };
  segments: {
    champions: { minScore: number; maxScore: number };
    loyal: { minScore: number; maxScore: number };
    atRisk: { minScore: number; maxScore: number };
    cantLose: { minScore: number; maxScore: number };
    lost: { minScore: number; maxScore: number };
  };
  insights: {
    recency: {
      excellent: string;
      good: string;
      average: string;
      poor: string;
      critical: string;
    };
    frequency: {
      excellent: string;
      good: string;
      average: string;
      poor: string;
      critical: string;
    };
    monetary: {
      excellent: string;
      good: string;
      average: string;
      poor: string;
      critical: string;
    };
  };
}

// Default RFM Configuration (USD-based)
export const DEFAULT_RFM_CONFIG: RFMConfig = {
  scoring: {
    recency: {
      thresholds: [30, 60, 90, 180], // days
      weights: [5, 4, 3, 2, 1] // scores
    },
    frequency: {
      thresholds: [2, 3, 5, 10], // order counts
      weights: [1, 2, 3, 4, 5] // scores
    },
    monetary: {
      thresholds: [500, 2000, 10000, 50000], // USD amounts
      weights: [1, 2, 3, 4, 5] // scores
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
};

// High-Value Business RFM Configuration
export const HIGH_VALUE_RFM_CONFIG: RFMConfig = {
  scoring: {
    recency: {
      thresholds: [15, 30, 60, 120], // More aggressive recency
      weights: [5, 4, 3, 2, 1]
    },
    frequency: {
      thresholds: [5, 10, 20, 50], // Higher frequency expectations
      weights: [1, 2, 3, 4, 5]
    },
    monetary: {
      thresholds: [2000, 10000, 50000, 200000], // Higher monetary thresholds
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
      excellent: "VIP customer purchased very recently (within 15 days)",
      good: "VIP customer purchased recently (within 30 days)",
      average: "VIP customer purchased within 60 days",
      poor: "VIP customer purchased within 120 days",
      critical: "VIP customer hasn't purchased for over 120 days"
    },
    frequency: {
      excellent: "VIP customer orders very frequently (50+ orders)",
      good: "VIP customer orders frequently (20-49 orders)",
      average: "VIP customer orders moderately (10-19 orders)",
      poor: "VIP customer orders occasionally (5-9 orders)",
      critical: "VIP customer has only 1-4 orders"
    },
    monetary: {
      excellent: "VIP customer spends very high amounts ($200K+)",
      good: "VIP customer spends high amounts ($50K-$200K)",
      average: "VIP customer spends moderate amounts ($10K-$50K)",
      poor: "VIP customer spends low amounts ($2K-$10K)",
      critical: "VIP customer spends very low amounts (<$2K)"
    }
  }
};

// Small Business RFM Configuration
export const SMALL_BUSINESS_RFM_CONFIG: RFMConfig = {
  scoring: {
    recency: {
      thresholds: [60, 120, 180, 365], // More lenient recency
      weights: [5, 4, 3, 2, 1]
    },
    frequency: {
      thresholds: [1, 2, 3, 5], // Lower frequency expectations
      weights: [1, 2, 3, 4, 5]
    },
    monetary: {
      thresholds: [100, 500, 1000, 5000], // Lower monetary thresholds
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
      excellent: "Small business customer purchased very recently (within 60 days)",
      good: "Small business customer purchased recently (within 120 days)",
      average: "Small business customer purchased within 180 days",
      poor: "Small business customer purchased within 365 days",
      critical: "Small business customer hasn't purchased for over 365 days"
    },
    frequency: {
      excellent: "Small business customer orders very frequently (5+ orders)",
      good: "Small business customer orders frequently (3-4 orders)",
      average: "Small business customer orders moderately (2 orders)",
      poor: "Small business customer orders occasionally (1 order)",
      critical: "Small business customer has no orders"
    },
    monetary: {
      excellent: "Small business customer spends very high amounts ($5K+)",
      good: "Small business customer spends high amounts ($1K-$5K)",
      average: "Small business customer spends moderate amounts ($500-$1K)",
      poor: "Small business customer spends low amounts ($100-$500)",
      critical: "Small business customer spends very low amounts (<$100)"
    }
  }
};

export const getRFMConfig = (businessType: string = 'default'): RFMConfig => {
  switch (businessType.toLowerCase()) {
    case 'high_value':
    case 'high_value_business':
      return HIGH_VALUE_RFM_CONFIG;
    case 'small_business':
    case 'small_business_config':
      return SMALL_BUSINESS_RFM_CONFIG;
    case 'default':
    default:
      return DEFAULT_RFM_CONFIG;
  }
}; 