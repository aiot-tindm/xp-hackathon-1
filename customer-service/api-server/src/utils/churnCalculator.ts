import { ChurnConfig } from '../config/churnConfig';

export interface ChurnFactors {
  inactivity: number;
  orderFrequency: number;
  orderValue: number;
  engagement: number;
}

export interface ChurnInsights {
  primaryReason: string;
  secondaryReason: string;
  retentionProbability: number;
  winbackDifficulty: string;
  estimatedRevenueLoss: number;
}

export interface ChurnData {
  customerId: number;
  customerName: string;
  customerEmail: string;
  daysSinceLastOrder: number;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  churnRisk: number;
  riskLevel: string;
  churnFactors: ChurnFactors;
  insights: ChurnInsights;
  retentionStrategies: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  lastOrderDate: Date;
  firstOrderDate: Date;
  orderDecline: number;
  valueDecline: number;
  engagementScore: number;
}

export const calculateChurnRisk = (
  daysSinceLastOrder: number,
  totalOrders: number,
  totalSpent: number,
  engagementScore: number,
  config: ChurnConfig
): { churnRisk: number; factors: ChurnFactors } => {
  // Calculate inactivity risk
  let inactivityRisk = 0;
  for (let i = 0; i < config.riskFactors.inactivity.thresholds.length; i++) {
    const threshold = config.riskFactors.inactivity.thresholds[i];
    const weight = config.riskFactors.inactivity.weights[i];
    if (threshold !== undefined && weight !== undefined && daysSinceLastOrder >= threshold) {
      inactivityRisk = weight;
      break;
    }
  }

  // Calculate order frequency risk (lower orders = higher risk)
  let frequencyRisk = 0;
  for (let i = 0; i < config.riskFactors.orderFrequency.thresholds.length; i++) {
    const threshold = config.riskFactors.orderFrequency.thresholds[i];
    const weight = config.riskFactors.orderFrequency.weights[i];
    if (threshold !== undefined && weight !== undefined && totalOrders <= threshold) {
      frequencyRisk = weight;
      break;
    }
  }

  // Calculate order value risk (lower value = higher risk)
  let valueRisk = 0;
  for (let i = 0; i < config.riskFactors.orderValue.thresholds.length; i++) {
    const threshold = config.riskFactors.orderValue.thresholds[i];
    const weight = config.riskFactors.orderValue.weights[i];
    if (threshold !== undefined && weight !== undefined && totalSpent <= threshold) {
      valueRisk = weight;
      break;
    }
  }

  // Calculate engagement risk (lower engagement = higher risk)
  let engagementRisk = 0;
  for (let i = 0; i < config.riskFactors.engagement.thresholds.length; i++) {
    const threshold = config.riskFactors.engagement.thresholds[i];
    const weight = config.riskFactors.engagement.weights[i];
    if (threshold !== undefined && weight !== undefined && engagementScore <= threshold) {
      engagementRisk = weight;
      break;
    }
  }

  // Calculate weighted churn risk
  const churnRisk = Math.min(
    (inactivityRisk * 0.4 + frequencyRisk * 0.25 + valueRisk * 0.2 + engagementRisk * 0.15),
    1.0
  );

  return {
    churnRisk: Math.round(churnRisk * 100) / 100,
    factors: {
      inactivity: Math.round(inactivityRisk * 100) / 100,
      orderFrequency: Math.round(frequencyRisk * 100) / 100,
      orderValue: Math.round(valueRisk * 100) / 100,
      engagement: Math.round(engagementRisk * 100) / 100
    }
  };
};

export const determineRiskLevel = (churnRisk: number, config: ChurnConfig): string => {
  if (churnRisk >= config.riskLevels.high.minRisk && churnRisk <= config.riskLevels.high.maxRisk) {
    return 'high';
  } else if (churnRisk >= config.riskLevels.medium.minRisk && churnRisk <= config.riskLevels.medium.maxRisk) {
    return 'medium';
  } else {
    return 'low';
  }
};

export const generateChurnInsights = (
  churnRisk: number,
  churnFactors: ChurnFactors,
  totalSpent: number,
  avgOrderValue: number,
  config: ChurnConfig
): ChurnInsights => {
  // Determine primary reason based on highest factor
  const factors = [
    { name: 'inactivity', value: churnFactors.inactivity },
    { name: 'orderFrequency', value: churnFactors.orderFrequency },
    { name: 'orderValue', value: churnFactors.orderValue },
    { name: 'engagement', value: churnFactors.engagement }
  ];
  
  factors.sort((a, b) => b.value - a.value);
  const primaryFactor = factors[0];
  const secondaryFactor = factors[1];

  // Map factors to reasons
  const reasonMap: { [key: string]: string } = {
    inactivity: 'lack_of_engagement',
    orderFrequency: 'price_sensitivity',
    orderValue: 'poor_experience',
    engagement: 'competitor_switch'
  };

  const primaryReason = primaryFactor ? reasonMap[primaryFactor.name] || 'life_change' : 'life_change';
  const secondaryReason = secondaryFactor ? reasonMap[secondaryFactor.name] || 'seasonal_pattern' : 'seasonal_pattern';

  // Calculate retention probability (inverse of churn risk)
  const retentionProbability = Math.max(0.1, 1 - churnRisk);

  // Determine winback difficulty
  let winbackDifficulty = 'medium';
  if (churnRisk < 0.4) {
    winbackDifficulty = 'easy';
  } else if (churnRisk > 0.7) {
    winbackDifficulty = 'hard';
  }

  // Estimate revenue loss (based on total spent and churn risk)
  const estimatedRevenueLoss = Math.round(totalSpent * churnRisk * 0.5); // Assume 50% of historical value

  return {
    primaryReason,
    secondaryReason,
    retentionProbability: Math.round(retentionProbability * 100) / 100,
    winbackDifficulty,
    estimatedRevenueLoss
  };
};

export const generateRetentionStrategies = (
  riskLevel: string,
  churnFactors: ChurnFactors,
  config: ChurnConfig
): { immediate: string[]; shortTerm: string[]; longTerm: string[] } => {
  const strategies = {
    immediate: [...config.retentionStrategies.immediate],
    shortTerm: [...config.retentionStrategies.shortTerm],
    longTerm: [...config.retentionStrategies.longTerm]
  };

  // Add specific strategies based on risk factors
  if (churnFactors.inactivity > 0.5) {
    strategies.immediate.push('re_engagement_campaign');
  }
  if (churnFactors.orderFrequency > 0.5) {
    strategies.shortTerm.push('frequency_incentives');
  }
  if (churnFactors.orderValue > 0.5) {
    strategies.shortTerm.push('value_based_offers');
  }
  if (churnFactors.engagement > 0.5) {
    strategies.immediate.push('personalized_communication');
  }

  // Limit strategies to top 3 for each category
  strategies.immediate = strategies.immediate.slice(0, 3);
  strategies.shortTerm = strategies.shortTerm.slice(0, 3);
  strategies.longTerm = strategies.longTerm.slice(0, 3);

  return strategies;
};

export const calculateEngagementScore = (
  totalOrders: number,
  totalSpent: number,
  daysSinceLastOrder: number,
  avgOrderValue: number
): number => {
  // Simple engagement score calculation
  const orderScore = Math.min(totalOrders / 10, 1); // Normalize to 0-1
  const valueScore = Math.min(totalSpent / 10000, 1); // Normalize to 0-1
  const recencyScore = Math.max(0, 1 - (daysSinceLastOrder / 365)); // Recent = higher score
  const avgValueScore = Math.min(avgOrderValue / 1000, 1); // Normalize to 0-1

  return Math.round((orderScore * 0.3 + valueScore * 0.3 + recencyScore * 0.3 + avgValueScore * 0.1) * 100) / 100;
};

export const calculateTrends = (
  orders: any[]
): { orderDecline: number; valueDecline: number } => {
  if (orders.length < 2) {
    return { orderDecline: 0, valueDecline: 0 };
  }

  // Split orders into two periods
  const midPoint = Math.floor(orders.length / 2);
  const recentOrders = orders.slice(0, midPoint);
  const olderOrders = orders.slice(midPoint);

  // Calculate average order values
  const recentAvg = recentOrders.reduce((sum: number, order: any) => {
    const orderTotal = order.orderItems.reduce((itemSum: number, item: any) => {
      return itemSum + (Number(item.pricePerUnit) * item.quantity);
    }, 0);
    return sum + orderTotal;
  }, 0) / recentOrders.length;

  const olderAvg = olderOrders.reduce((sum: number, order: any) => {
    const orderTotal = order.orderItems.reduce((itemSum: number, item: any) => {
      return itemSum + (Number(item.pricePerUnit) * item.quantity);
    }, 0);
    return sum + orderTotal;
  }, 0) / olderOrders.length;

  // Calculate decline percentages
  const orderDecline = olderOrders.length > 0 ? 
    (olderOrders.length - recentOrders.length) / olderOrders.length : 0;
  
  const valueDecline = olderAvg > 0 ? 
    (olderAvg - recentAvg) / olderAvg : 0;

  return {
    orderDecline: Math.round(orderDecline * 100) / 100,
    valueDecline: Math.round(valueDecline * 100) / 100
  };
};

// Simple churn risk calculation for predictions API
export const calculateSimpleChurnRisk = (
  daysSinceLastOrder: number,
  totalOrders: number
): number => {
  let churnRisk = 0.1; // Base risk
  
  // Add risk based on inactivity
  if (daysSinceLastOrder > 180) churnRisk += 0.4;
  else if (daysSinceLastOrder > 90) churnRisk += 0.3;
  else if (daysSinceLastOrder > 60) churnRisk += 0.2;

  // Add risk based on order frequency
  if (totalOrders <= 2) churnRisk += 0.2;

  return Math.min(churnRisk, 1.0);
}; 