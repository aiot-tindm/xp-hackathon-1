import { getConfig } from '../services/configService';

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

/**
 * Get segmentation configuration from database
 * @param businessType - Business type (defaults to 'default')
 * @returns SegmentationConfig
 */
export const getSegmentationConfig = async (businessType: string = 'default'): Promise<SegmentationConfig> => {
  return await getConfig<SegmentationConfig>('segmentation', businessType);
}; 