import { getConfig } from '../services/configService';

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

/**
 * Get churn configuration from database
 * @param businessType - Business type (defaults to 'default')
 * @returns ChurnConfig
 */
export const getChurnConfig = async (businessType: string = 'default'): Promise<ChurnConfig> => {
  return await getConfig<ChurnConfig>('churn', businessType);
}; 