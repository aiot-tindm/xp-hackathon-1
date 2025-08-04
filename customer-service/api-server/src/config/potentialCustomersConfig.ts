import { getConfig } from '../services/configService';

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

/**
 * Get potential customers configuration from database
 * @param businessType - Business type (defaults to 'default')
 * @returns PotentialCustomersConfig
 */
export const getPotentialCustomersConfig = async (businessType: string = 'default'): Promise<PotentialCustomersConfig> => {
  return await getConfig<PotentialCustomersConfig>('potential_customers', businessType);
}; 