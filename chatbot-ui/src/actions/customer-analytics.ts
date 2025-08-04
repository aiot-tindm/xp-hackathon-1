import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export type CustomerSegment = 'whale' | 'vip' | 'regular' | 'new' | 'churn';
export type BusinessType = 'default' | 'high_value' | 'small_business' | 'high_frequency' | 'electronics' | 'fashion_sports';
export type RiskLevel = 'high' | 'medium' | 'low';

export interface CustomerAnalyticsOverview {
  success: boolean;
  data: {
    summary: {
      totalCustomers: number;
      activeCustomers: number;
      totalRevenue: number;
      averageOrderValue: number;
      churnRate: number;
    };
    segments: {
      [key in CustomerSegment]: {
        count: number;
        percentage: number;
        totalRevenue: number;
        avgClv: number;
      };
    };
    topCustomers: Array<{
      customerId: number;
      customerName: string;
      segment: CustomerSegment;
      totalSpent: number;
      orderCount: number;
      clv: number;
      lastOrderDate: string;
    }>;
  };
}

export interface CustomerDetail {
  success: boolean;
  data: {
    customer: {
      id: number;
      name: string;
      email: string;
      segment: CustomerSegment;
      registrationDate: string;
      lastOrderDate: string;
    };
    metrics: {
      totalSpent: number;
      orderCount: number;
      avgOrderValue: number;
      clv: number;
      daysSinceLastOrder: number;
    };
    categoryBreakdown: Array<{
      category: string;
      orderCount: number;
      totalSpent: number;
      percentage: number;
    }>;
    monthlyTrends: Array<{
      month: string;
      orderCount: number;
      totalSpent: number;
    }>;
  };
}

export interface CustomerPredictions {
  success: boolean;
  data: Array<{
    customerId: number;
    customerName: string;
    currentClv: number;
    predictedClv: number;
    churnRisk: number;
    nextPurchaseDate: string;
    recommendations: {
      products: Array<{
        productId: number;
        productName: string;
        score: number;
        reason: string;
      }>;
      promotions: Array<{
        type: string;
        description: string;
      }>;
      strategies: string[];
    };
  }>;
}

export interface CustomerRFM {
  success: boolean;
  data: {
    rfmScores: {
      recency: number;
      frequency: number;
      monetary: number;
      total: number;
    };
    rfmSegment: string;
    businessSegment: CustomerSegment;
    insights: string[];
    recommendations: string[];
  };
}

export interface ChurnPrediction {
  success: boolean;
  data: Array<{
    customerId: number;
    customerName: string;
    churnRisk: number;
    riskLevel: RiskLevel;
    riskFactors: {
      inactivity: number;
      orderFrequency: number;
      orderValue: number;
      engagement: number;
    };
    retentionStrategies: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    revenueAtRisk: number;
  }>;
}

export interface NewInventoryMatching {
  success: boolean;
  data: {
    potentialCustomers: Array<{
      customerId: number;
      customerName: string;
      interestScore: number;
      reasons: string[];
      leadScore: number;
      conversionProbability: number;
    }>;
    marketingInsights: {
      targetSegments: string[];
      preferredChannels: string[];
      optimalTiming: string;
    };
    inventoryInsights: {
      demandForecast: number;
      stockRecommendation: string;
    };
  };
}

// ----------------------------------------------------------------------

const getCustomerAnalyticsBaseUrl = () => {
  return CONFIG.api.customerServiceBaseUrl || 'http://localhost:4001';
};

export async function getCustomerAnalyticsOverview(params?: {
  page?: number;
  limit?: number;
  businessType?: BusinessType;
  segment?: CustomerSegment;
  days?: number;
  category?: string;
}): Promise<CustomerAnalyticsOverview> {
  try {
    const url = `${getCustomerAnalyticsBaseUrl()}/api/analytics/customers`;
    const response = await axios.get<CustomerAnalyticsOverview>(url, {
      params,
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error('Customer analytics overview error:', error);
    throw new Error('Failed to fetch customer analytics overview');
  }
}

export async function getCustomerDetail(
  customerId: number,
  params?: { days?: number }
): Promise<CustomerDetail> {
  try {
    const url = `${getCustomerAnalyticsBaseUrl()}/api/analytics/customers/${customerId}`;
    const response = await axios.get<CustomerDetail>(url, {
      params,
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error('Customer detail error:', error);
    throw new Error('Failed to fetch customer details');
  }
}

export async function getCustomerPredictions(data: {
  customerIds: number[];
  predictionType?: string;
  months?: number;
  includeRecommendations?: boolean;
}): Promise<CustomerPredictions> {
  try {
    const url = `${getCustomerAnalyticsBaseUrl()}/api/analytics/customers/predictions`;
    const response = await axios.post<CustomerPredictions>(url, data, {
      timeout: 60000, // Longer timeout for predictions
    });
    return response.data;
  } catch (error) {
    console.error('Customer predictions error:', error);
    throw new Error('Failed to fetch customer predictions');
  }
}

export async function getCustomerRFM(params?: {
  customerId?: number;
  businessType?: BusinessType;
}): Promise<CustomerRFM> {
  try {
    const url = `${getCustomerAnalyticsBaseUrl()}/api/analytics/customers/rfm`;
    const response = await axios.get<CustomerRFM>(url, {
      params,
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error('Customer RFM error:', error);
    throw new Error('Failed to fetch customer RFM analysis');
  }
}

export async function getChurnPrediction(params?: {
  days?: number;
  includeAllCustomers?: boolean;
  businessType?: BusinessType;
}): Promise<ChurnPrediction> {
  try {
    const url = `${getCustomerAnalyticsBaseUrl()}/api/analytics/customers/churn-prediction`;
    const response = await axios.get<ChurnPrediction>(url, {
      params,
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error('Churn prediction error:', error);
    throw new Error('Failed to fetch churn prediction');
  }
}

export async function getNewInventoryMatching(params?: {
  productIds?: string;
  categoryIds?: string;
  limit?: number;
  days?: number;
}): Promise<NewInventoryMatching> {
  try {
    const url = `${getCustomerAnalyticsBaseUrl()}/api/analytics/customers/new-inventory-matching`;
    const response = await axios.get<NewInventoryMatching>(url, {
      params,
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error('New inventory matching error:', error);
    throw new Error('Failed to fetch new inventory matching');
  }
}