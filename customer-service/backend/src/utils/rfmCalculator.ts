import { RFMConfig } from '../config/rfmConfig';

export interface RFMScore {
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  rfmScore: number;
}

export interface RFMInsights {
  recencyInsight: string;
  frequencyInsight: string;
  monetaryInsight: string;
  overallInsight: string;
}

export interface RFMData {
  customerId: number;
  customerName: string;
  customerEmail: string;
  recency: number;
  frequency: number;
  monetary: number;
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  rfmScore: number;
  rfmSegment: string;
  businessSegment: string;
  insights: RFMInsights;
  recommendations: string[];
  lastOrderDate: Date;
  firstOrderDate: Date;
  avgOrderValue: number;
}

export const calculateRFMScore = (
  recency: number,
  frequency: number,
  monetary: number,
  config: RFMConfig
): RFMScore => {
  // Calculate Recency Score (lower days = higher score)
  let recencyScore = 1;
  for (let i = 0; i < config.scoring.recency.thresholds.length; i++) {
    const threshold = config.scoring.recency.thresholds[i];
    const weight = config.scoring.recency.weights[i];
    if (threshold !== undefined && weight !== undefined && recency <= threshold) {
      recencyScore = weight;
      break;
    }
  }
  const lastThreshold = config.scoring.recency.thresholds[config.scoring.recency.thresholds.length - 1];
  const lastWeight = config.scoring.recency.weights[config.scoring.recency.weights.length - 1];
  if (lastThreshold !== undefined && lastWeight !== undefined && recency > lastThreshold) {
    recencyScore = lastWeight;
  }

  // Calculate Frequency Score (higher orders = higher score)
  let frequencyScore = 1;
  for (let i = 0; i < config.scoring.frequency.thresholds.length; i++) {
    const threshold = config.scoring.frequency.thresholds[i];
    const weight = config.scoring.frequency.weights[i];
    if (threshold !== undefined && weight !== undefined && frequency >= threshold) {
      frequencyScore = weight;
      break;
    }
  }
  const firstThreshold = config.scoring.frequency.thresholds[0];
  const firstWeight = config.scoring.frequency.weights[0];
  if (firstThreshold !== undefined && firstWeight !== undefined && frequency < firstThreshold) {
    frequencyScore = firstWeight;
  }

  // Calculate Monetary Score (higher amount = higher score)
  let monetaryScore = 1;
  for (let i = 0; i < config.scoring.monetary.thresholds.length; i++) {
    const threshold = config.scoring.monetary.thresholds[i];
    const weight = config.scoring.monetary.weights[i];
    if (threshold !== undefined && weight !== undefined && monetary >= threshold) {
      monetaryScore = weight;
      break;
    }
  }
  const firstMonetaryThreshold = config.scoring.monetary.thresholds[0];
  const firstMonetaryWeight = config.scoring.monetary.weights[0];
  if (firstMonetaryThreshold !== undefined && firstMonetaryWeight !== undefined && monetary < firstMonetaryThreshold) {
    monetaryScore = firstMonetaryWeight;
  }

  return {
    recencyScore,
    frequencyScore,
    monetaryScore,
    rfmScore: recencyScore + frequencyScore + monetaryScore
  };
};

export const calculateRFMSegment = (rfmScore: number, config: RFMConfig): string => {
  if (rfmScore >= config.segments.champions.minScore && rfmScore <= config.segments.champions.maxScore) {
    return 'champions';
  } else if (rfmScore >= config.segments.loyal.minScore && rfmScore <= config.segments.loyal.maxScore) {
    return 'loyal';
  } else if (rfmScore >= config.segments.atRisk.minScore && rfmScore <= config.segments.atRisk.maxScore) {
    return 'at_risk';
  } else if (rfmScore >= config.segments.cantLose.minScore && rfmScore <= config.segments.cantLose.maxScore) {
    return 'cant_lose';
  } else {
    return 'lost';
  }
};

export const generateRFMInsights = (
  recencyScore: number,
  frequencyScore: number,
  monetaryScore: number,
  config: RFMConfig
): RFMInsights => {
  // Generate recency insight
  let recencyInsight = '';
  if (recencyScore === 5) recencyInsight = config.insights.recency.excellent;
  else if (recencyScore === 4) recencyInsight = config.insights.recency.good;
  else if (recencyScore === 3) recencyInsight = config.insights.recency.average;
  else if (recencyScore === 2) recencyInsight = config.insights.recency.poor;
  else recencyInsight = config.insights.recency.critical;

  // Generate frequency insight
  let frequencyInsight = '';
  if (frequencyScore === 5) frequencyInsight = config.insights.frequency.excellent;
  else if (frequencyScore === 4) frequencyInsight = config.insights.frequency.good;
  else if (frequencyScore === 3) frequencyInsight = config.insights.frequency.average;
  else if (frequencyScore === 2) frequencyInsight = config.insights.frequency.poor;
  else frequencyInsight = config.insights.frequency.critical;

  // Generate monetary insight
  let monetaryInsight = '';
  if (monetaryScore === 5) monetaryInsight = config.insights.monetary.excellent;
  else if (monetaryScore === 4) monetaryInsight = config.insights.monetary.good;
  else if (monetaryScore === 3) monetaryInsight = config.insights.monetary.average;
  else if (monetaryScore === 2) monetaryInsight = config.insights.monetary.poor;
  else monetaryInsight = config.insights.monetary.critical;

  // Generate overall insight
  const totalScore = recencyScore + frequencyScore + monetaryScore;
  let overallInsight = '';
  
  if (totalScore >= 13) {
    overallInsight = 'High-value customer with excellent engagement across all metrics';
  } else if (totalScore >= 11) {
    overallInsight = 'Loyal customer with good engagement patterns';
  } else if (totalScore >= 8) {
    overallInsight = 'Customer showing signs of declining engagement';
  } else if (totalScore >= 6) {
    overallInsight = 'Customer at risk of churning, needs immediate attention';
  } else {
    overallInsight = 'Customer has disengaged and may be lost';
  }

  return {
    recencyInsight,
    frequencyInsight,
    monetaryInsight,
    overallInsight
  };
};

export const generateRFMRecommendations = (
  rfmScore: number,
  rfmSegment: string,
  recencyScore: number,
  frequencyScore: number,
  monetaryScore: number
): string[] => {
  const recommendations: string[] = [];

  // Segment-based recommendations
  switch (rfmSegment) {
    case 'champions':
      recommendations.push('Exclusive VIP treatment and early access to new products');
      recommendations.push('Personalized premium service and dedicated account manager');
      recommendations.push('Referral program incentives and loyalty rewards');
      break;
    case 'loyal':
      recommendations.push('Cross-selling opportunities and product recommendations');
      recommendations.push('Loyalty program enrollment and tier benefits');
      recommendations.push('Regular engagement campaigns and personalized offers');
      break;
    case 'at_risk':
      recommendations.push('Re-engagement campaigns with special offers');
      recommendations.push('Customer feedback surveys to understand concerns');
      recommendations.push('Win-back campaigns with personalized incentives');
      break;
    case 'cant_lose':
      recommendations.push('Immediate contact to understand their needs');
      recommendations.push('Special retention offers and personalized service');
      recommendations.push('Account review and relationship building');
      break;
    case 'lost':
      recommendations.push('Win-back campaigns with aggressive offers');
      recommendations.push('Customer feedback to understand churn reasons');
      recommendations.push('Reactivation campaigns with new product introductions');
      break;
  }

  // Score-based specific recommendations
  if (recencyScore <= 2) {
    recommendations.push('Send re-engagement email campaigns');
  }
  if (frequencyScore <= 2) {
    recommendations.push('Implement frequency-based loyalty programs');
  }
  if (monetaryScore <= 2) {
    recommendations.push('Upselling campaigns to higher-value products');
  }

  return recommendations.slice(0, 3); // Limit to top 3 recommendations
}; 