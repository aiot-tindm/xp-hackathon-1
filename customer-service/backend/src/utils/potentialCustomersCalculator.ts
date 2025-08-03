import { PotentialCustomersConfig } from '../config/potentialCustomersConfig';

export interface CustomerAnalysis {
  customerId: number;
  customer: any;
  totalSpent: number;
  similarProducts: number;
  categories: Set<string>;
  brands: Set<string>;
  lastPurchaseDate: Date;
  firstPurchaseDate: Date;
  purchaseFrequency: number;
  avgOrderValue: number;
}

export interface InterestScore {
  totalScore: number;
  purchaseFrequencyScore: number;
  totalSpentScore: number;
  recencyScore: number;
  diversityScore: number;
}

export interface MarketingInsights {
  targetSegment: string;
  preferredChannels: string[];
  optimalTiming: string;
  priceRange: string;
  campaignSuggestions: string[];
}

export interface SalesIntelligence {
  leadScore: number;
  conversionProbability: number;
  salesCycle: string;
  dealSize: string;
  followUpActions: string[];
}

export interface InventoryInsights {
  demandForecast: number;
  stockRecommendation: string;
  seasonalFactor: number;
  supplyChainImpact: string;
}

export interface PotentialCustomerData {
  customerId: number;
  customer: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
  };
  totalSpent: number;
  similarProducts: number;
  categories: string[];
  brands: string[];
  lastPurchaseDate: Date;
  firstPurchaseDate: Date;
  purchaseFrequency: number;
  avgOrderValue: number;
  interestScore: number;
  interestLevel: string;
  marketingInsights: MarketingInsights;
  salesIntelligence: SalesIntelligence;
  inventoryInsights: InventoryInsights;
  demographics: {
    segment: string;
    totalOrders: number;
  };
}

export const calculateInterestScore = (
  analysis: CustomerAnalysis,
  config: PotentialCustomersConfig
): InterestScore => {
  // Calculate purchase frequency score
  let purchaseFrequencyScore = 1;
  for (let i = 0; i < config.scoring.purchaseFrequency.thresholds.length; i++) {
    const threshold = config.scoring.purchaseFrequency.thresholds[i];
    const weight = config.scoring.purchaseFrequency.weights[i];
    if (threshold !== undefined && weight !== undefined && analysis.similarProducts >= threshold) {
      purchaseFrequencyScore = weight;
      break;
    }
  }

  // Calculate total spent score
  let totalSpentScore = 1;
  for (let i = 0; i < config.scoring.totalSpent.thresholds.length; i++) {
    const threshold = config.scoring.totalSpent.thresholds[i];
    const weight = config.scoring.totalSpent.weights[i];
    if (threshold !== undefined && weight !== undefined && analysis.totalSpent >= threshold) {
      totalSpentScore = weight;
      break;
    }
  }

  // Calculate recency score (lower days = higher score)
  const daysSinceLastPurchase = Math.floor((Date.now() - analysis.lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24));
  let recencyScore = 1;
  for (let i = 0; i < config.scoring.recency.thresholds.length; i++) {
    const threshold = config.scoring.recency.thresholds[i];
    const weight = config.scoring.recency.weights[i];
    if (threshold !== undefined && weight !== undefined && daysSinceLastPurchase <= threshold) {
      recencyScore = weight;
      break;
    }
  }

  // Calculate diversity score
  let diversityScore = 1;
  const categoryCount = analysis.categories.size;
  const brandCount = analysis.brands.size;
  
  for (let i = 0; i < config.scoring.diversity.categoryThresholds.length; i++) {
    const categoryThreshold = config.scoring.diversity.categoryThresholds[i];
    const brandThreshold = config.scoring.diversity.brandThresholds[i];
    const weight = config.scoring.diversity.weights[i];
    if (categoryThreshold !== undefined && brandThreshold !== undefined && weight !== undefined && 
        categoryCount >= categoryThreshold && brandCount >= brandThreshold) {
      diversityScore = weight;
      break;
    }
  }

  const totalScore = Math.min(
    purchaseFrequencyScore + totalSpentScore + recencyScore + diversityScore,
    10
  );

  return {
    totalScore,
    purchaseFrequencyScore,
    totalSpentScore,
    recencyScore,
    diversityScore
  };
};

export const determineInterestLevel = (interestScore: number, config: PotentialCustomersConfig): string => {
  if (interestScore >= config.interestLevels.high.minScore && interestScore <= config.interestLevels.high.maxScore) {
    return 'high';
  } else if (interestScore >= config.interestLevels.medium.minScore && interestScore <= config.interestLevels.medium.maxScore) {
    return 'medium';
  } else {
    return 'low';
  }
};

export const generateMarketingInsights = (
  analysis: CustomerAnalysis,
  interestScore: number,
  config: PotentialCustomersConfig
): MarketingInsights => {
  // Determine target segment based on spending and behavior
  let targetSegment = 'casual_shoppers';
  if (analysis.totalSpent >= 5000 && analysis.similarProducts >= 5) {
    targetSegment = 'tech_enthusiasts';
  } else if (analysis.totalSpent >= 2000 && analysis.avgOrderValue >= 500) {
    targetSegment = 'premium_buyers';
  } else if (analysis.totalSpent >= 1000 && analysis.purchaseFrequency >= 2) {
    targetSegment = 'value_seekers';
  }

  // Determine preferred channels based on behavior
  const preferredChannels = ['email', 'social_media'];
  if (interestScore >= 8) {
    preferredChannels.push('sms', 'push_notifications');
  }

  // Determine optimal timing based on purchase patterns
  let optimalTiming = 'weekend_mornings';
  const lastPurchaseHour = analysis.lastPurchaseDate.getHours();
  if (lastPurchaseHour >= 18 || lastPurchaseHour <= 6) {
    optimalTiming = 'late_night';
  } else if (lastPurchaseHour >= 12 && lastPurchaseHour <= 14) {
    optimalTiming = 'lunch_breaks';
  } else if (lastPurchaseHour >= 17 && lastPurchaseHour <= 19) {
    optimalTiming = 'weekday_evenings';
  }

  // Determine price range based on spending
  let priceRange = '$100-$500';
  if (analysis.totalSpent >= 5000) {
    priceRange = '$1000+';
  } else if (analysis.totalSpent >= 2000) {
    priceRange = '$500-$1000';
  }

  // Generate campaign suggestions
  const campaignSuggestions = [];
  if (interestScore >= 8) {
    campaignSuggestions.push('early_bird_discount', 'product_demo', 'exclusive_access');
  } else if (interestScore >= 5) {
    campaignSuggestions.push('limited_time_offer', 'product_showcase', 'loyalty_rewards');
  } else {
    campaignSuggestions.push('awareness_campaign', 'educational_content', 'social_proof');
  }

  return {
    targetSegment,
    preferredChannels,
    optimalTiming,
    priceRange,
    campaignSuggestions
  };
};

export const generateSalesIntelligence = (
  analysis: CustomerAnalysis,
  interestScore: number,
  config: PotentialCustomersConfig
): SalesIntelligence => {
  // Calculate lead score (1-10)
  const leadScore = Math.min(interestScore + (analysis.totalSpent >= 5000 ? 2 : 0), 10);

  // Calculate conversion probability
  const conversionProbability = Math.min(
    (interestScore / 10) * 0.6 + (analysis.totalSpent >= 2000 ? 0.2 : 0) + (analysis.similarProducts >= 3 ? 0.2 : 0),
    1.0
  );

  // Determine sales cycle
  let salesCycle = 'medium';
  if (interestScore >= 8 && analysis.totalSpent >= 5000) {
    salesCycle = 'short';
  } else if (interestScore <= 4 || analysis.totalSpent < 500) {
    salesCycle = 'long';
  }

  // Determine deal size
  let dealSize = 'medium';
  if (analysis.totalSpent >= 5000) {
    dealSize = 'large';
  } else if (analysis.totalSpent < 1000) {
    dealSize = 'small';
  }

  // Generate follow-up actions
  const followUpActions = [];
  if (interestScore >= 8) {
    followUpActions.push('product_demo', 'pricing_negotiation', 'contract_discussion');
  } else if (interestScore >= 5) {
    followUpActions.push('needs_assessment', 'value_proposition', 'trial_offer');
  } else {
    followUpActions.push('relationship_building', 'educational_content', 'awareness_campaign');
  }

  return {
    leadScore: Math.round(leadScore * 10) / 10,
    conversionProbability: Math.round(conversionProbability * 100) / 100,
    salesCycle,
    dealSize,
    followUpActions
  };
};

export const generateInventoryInsights = (
  analysis: CustomerAnalysis,
  interestScore: number
): InventoryInsights => {
  // Calculate demand forecast based on interest score and customer behavior
  const baseDemand = analysis.similarProducts * 2;
  const interestMultiplier = interestScore / 10;
  const demandForecast = Math.round(baseDemand * interestMultiplier * 10);

  // Determine stock recommendation
  let stockRecommendation = 'maintain';
  if (interestScore >= 8 && demandForecast > 50) {
    stockRecommendation = 'increase';
  } else if (interestScore <= 4 || demandForecast < 10) {
    stockRecommendation = 'decrease';
  }

  // Calculate seasonal factor (simple implementation)
  const currentMonth = new Date().getMonth();
  let seasonalFactor = 1.0;
  if (currentMonth >= 10 || currentMonth <= 1) { // Holiday season
    seasonalFactor = 1.3;
  } else if (currentMonth >= 6 && currentMonth <= 8) { // Summer
    seasonalFactor = 0.8;
  }

  // Determine supply chain impact
  let supplyChainImpact = 'minimal';
  if (demandForecast > 100) {
    supplyChainImpact = 'moderate';
  } else if (demandForecast > 500) {
    supplyChainImpact = 'significant';
  }

  return {
    demandForecast,
    stockRecommendation,
    seasonalFactor: Math.round(seasonalFactor * 100) / 100,
    supplyChainImpact
  };
};

export const analyzeCustomerOrderHistory = (
  orders: any[]
): CustomerAnalysis => {
  const analysis: CustomerAnalysis = {
    customerId: orders[0].customerId,
    customer: orders[0].customer,
    totalSpent: 0,
    similarProducts: 0,
    categories: new Set(),
    brands: new Set(),
    lastPurchaseDate: orders[0].orderDate,
    firstPurchaseDate: orders[0].orderDate,
    purchaseFrequency: 0,
    avgOrderValue: 0
  };

  orders.forEach(order => {
    order.orderItems.forEach((item: any) => {
      const itemTotal = Number(item.pricePerUnit) * item.quantity;
      analysis.totalSpent += itemTotal;
      analysis.similarProducts++;
      analysis.categories.add(item.item.category?.name || 'Unknown');
      analysis.brands.add(item.item.brand?.name || 'Unknown');
    });

    if (order.orderDate < analysis.firstPurchaseDate) {
      analysis.firstPurchaseDate = order.orderDate;
    }
    if (order.orderDate > analysis.lastPurchaseDate) {
      analysis.lastPurchaseDate = order.orderDate;
    }
  });

  // Calculate purchase frequency (orders per month)
  const monthsSinceFirstPurchase = Math.max(1,
    (analysis.lastPurchaseDate.getTime() - analysis.firstPurchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  analysis.purchaseFrequency = orders.length / monthsSinceFirstPurchase;
  analysis.avgOrderValue = analysis.totalSpent / orders.length;

  return analysis;
}; 