// Customer Segmentation Configuration
// This file contains all the rules and thresholds for customer segmentation
// In the future, these can be moved to database for dynamic configuration
// All currency values are in USD ($) to match CSV data format

export interface SegmentationConfig {
  whale: {
    minTotalSpent: number;
    minOrders: number;
    minAvgOrderValue: number;
  };
  vip: {
    minTotalSpent: number;
    maxTotalSpent: number;
    minOrders: number;
    minAvgOrderValue: number;
  };
  regular: {
    minTotalSpent: number;
    maxTotalSpent: number;
    minOrders: number;
  };
  churn: {
    maxDaysSinceLastOrder: number;
  };
}

// Configuration based on actual CSV data analysis
// Data: 634 orders, 50 customers, 6 months (Jan-Jun 2024)
// Average orders per customer: 12.7
// Order values: $50 - $7,000 USD
// Peak months: Feb (Tết), May (Black Friday)

// Default configuration for general e-commerce (based on CSV data)
export const DEFAULT_SEGMENTATION_CONFIG: SegmentationConfig = {
  whale: {
    minTotalSpent: 600,         // $600 USD - Top 5% customers
    minOrders: 8,               // Above average (12.7/2)
    minAvgOrderValue: 60        // $60 USD per order
  },
  vip: {
    minTotalSpent: 200,         // $200 USD
    maxTotalSpent: 600,         // $600 USD
    minOrders: 5,               // Moderate frequency
    minAvgOrderValue: 32        // $32 USD per order
  },
  regular: {
    minTotalSpent: 40,          // $40 USD
    maxTotalSpent: 200,         // $200 USD
    minOrders: 3                // At least 3 orders in 6 months
  },
  churn: {
    maxDaysSinceLastOrder: 90   // 90 days (3 months) - reasonable for 6-month data
  }
};

// Configuration for high-value e-commerce (luxury goods, premium services)
// Based on CSV data with higher thresholds for premium products
export const HIGH_VALUE_SEGMENTATION_CONFIG: SegmentationConfig = {
  whale: {
    minTotalSpent: 1200,        // $1,200 USD - Premium customers
    minOrders: 10,              // High frequency for luxury
    minAvgOrderValue: 100       // $100 USD per order
  },
  vip: {
    minTotalSpent: 400,         // $400 USD
    maxTotalSpent: 1200,        // $1,200 USD
    minOrders: 6,               // Moderate-high frequency
    minAvgOrderValue: 60        // $60 USD per order
  },
  regular: {
    minTotalSpent: 120,         // $120 USD
    maxTotalSpent: 400,         // $400 USD
    minOrders: 4                // At least 4 orders
  },
  churn: {
    maxDaysSinceLastOrder: 120  // 120 days (4 months) - longer for luxury
  }
};

// Configuration for high-frequency e-commerce (daily necessities, groceries)
// Based on CSV data with focus on frequency rather than value
export const HIGH_FREQUENCY_SEGMENTATION_CONFIG: SegmentationConfig = {
  whale: {
    minTotalSpent: 320,         // $320 USD - High frequency buyers
    minOrders: 20,              // Very high frequency (20+ orders in 6 months)
    minAvgOrderValue: 12        // $12 USD per order - smaller orders
  },
  vip: {
    minTotalSpent: 120,         // $120 USD
    maxTotalSpent: 320,         // $320 USD
    minOrders: 12,              // High frequency (12+ orders)
    minAvgOrderValue: 8         // $8 USD per order
  },
  regular: {
    minTotalSpent: 32,          // $32 USD
    maxTotalSpent: 120,         // $120 USD
    minOrders: 6                // Moderate frequency (6+ orders)
  },
  churn: {
    maxDaysSinceLastOrder: 60   // 60 days (2 months) - shorter for frequent buyers
  }
};

// Configuration for small business e-commerce (startups, small retailers)
// Based on CSV data with lower thresholds for small businesses
export const SMALL_BUSINESS_SEGMENTATION_CONFIG: SegmentationConfig = {
  whale: {
    minTotalSpent: 200,         // $200 USD - Big customers for small business
    minOrders: 6,               // Moderate frequency
    minAvgOrderValue: 32        // $32 USD per order
  },
  vip: {
    minTotalSpent: 80,          // $80 USD
    maxTotalSpent: 200,         // $200 USD
    minOrders: 4,               // Moderate frequency
    minAvgOrderValue: 16        // $16 USD per order
  },
  regular: {
    minTotalSpent: 20,          // $20 USD
    maxTotalSpent: 80,          // $80 USD
    minOrders: 2                // At least 2 orders
  },
  churn: {
    maxDaysSinceLastOrder: 75   // 75 days (2.5 months) - moderate for small business
  }
};

// Configuration for electronics-focused e-commerce (based on CSV data)
// CSV has many electronics products (iPhone, Samsung, MacBook, etc.)
export const ELECTRONICS_SEGMENTATION_CONFIG: SegmentationConfig = {
  whale: {
    minTotalSpent: 1000,        // $1,000 USD - Electronics are expensive
    minOrders: 6,               // Moderate frequency for expensive items
    minAvgOrderValue: 120       // $120 USD per order
  },
  vip: {
    minTotalSpent: 320,         // $320 USD
    maxTotalSpent: 1000,        // $1,000 USD
    minOrders: 4,               // Moderate frequency
    minAvgOrderValue: 60        // $60 USD per order
  },
  regular: {
    minTotalSpent: 80,          // $80 USD
    maxTotalSpent: 320,         // $320 USD
    minOrders: 3                // At least 3 orders
  },
  churn: {
    maxDaysSinceLastOrder: 105  // 105 days (3.5 months) - longer for electronics
  }
};

// Configuration for fashion/sports e-commerce (based on CSV data)
// CSV has Nike, Adidas, Puma products
export const FASHION_SPORTS_SEGMENTATION_CONFIG: SegmentationConfig = {
  whale: {
    minTotalSpent: 480,         // $480 USD - Fashion enthusiasts
    minOrders: 10,              // High frequency for fashion
    minAvgOrderValue: 40        // $40 USD per order
  },
  vip: {
    minTotalSpent: 160,         // $160 USD
    maxTotalSpent: 480,         // $480 USD
    minOrders: 6,               // Moderate-high frequency
    minAvgOrderValue: 24        // $24 USD per order
  },
  regular: {
    minTotalSpent: 40,          // $40 USD
    maxTotalSpent: 160,         // $160 USD
    minOrders: 3                // At least 3 orders
  },
  churn: {
    maxDaysSinceLastOrder: 90   // 90 days (3 months) - standard for fashion
  }
};

// Configuration selector function
export const getSegmentationConfig = (businessType: string = 'default'): SegmentationConfig => {
  switch (businessType.toLowerCase()) {
    case 'high_value':
    case 'luxury':
    case 'premium':
      return HIGH_VALUE_SEGMENTATION_CONFIG;
    case 'high_frequency':
    case 'grocery':
    case 'daily':
      return HIGH_FREQUENCY_SEGMENTATION_CONFIG;
    case 'small_business':
    case 'startup':
      return SMALL_BUSINESS_SEGMENTATION_CONFIG;
    case 'electronics':
    case 'tech':
    case 'gadgets':
      return ELECTRONICS_SEGMENTATION_CONFIG;
    case 'fashion':
    case 'sports':
    case 'clothing':
      return FASHION_SPORTS_SEGMENTATION_CONFIG;
    case 'default':
    default:
      return DEFAULT_SEGMENTATION_CONFIG;
  }
};

// Future: Database configuration functions
// These functions can be implemented when moving to database storage

export interface DatabaseSegmentationConfig {
  id: string;
  businessType: string;
  config: SegmentationConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock function for future database integration
export const getSegmentationConfigFromDatabase = async (businessType: string): Promise<SegmentationConfig> => {
  // TODO: Implement database query
  // const config = await prisma.segmentationConfig.findFirst({
  //   where: { businessType, isActive: true }
  // });
  // return config?.config || DEFAULT_SEGMENTATION_CONFIG;
  
  // For now, return from file config
  return getSegmentationConfig(businessType);
};

// Mock function for future database integration
export const updateSegmentationConfigInDatabase = async (
  businessType: string, 
  config: SegmentationConfig
): Promise<void> => {
  // TODO: Implement database update
  // await prisma.segmentationConfig.upsert({
  //   where: { businessType },
  //   update: { config, updatedAt: new Date() },
  //   create: { businessType, config, isActive: true, createdAt: new Date(), updatedAt: new Date() }
  // });
  
  console.log(`Updated segmentation config for ${businessType}:`, config);
}; 