import { getConfig } from '../services/configService';

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

/**
 * Get RFM configuration from database
 * @param businessType - Business type (defaults to 'default')
 * @returns RFMConfig
 */
export const getRFMConfig = async (businessType: string = 'default'): Promise<RFMConfig> => {
  return await getConfig<RFMConfig>('rfm', businessType);
}; 