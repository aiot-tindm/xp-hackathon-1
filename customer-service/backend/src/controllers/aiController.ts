import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import logger from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:5000';

// Customer analysis
export const analyzeCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/customers/classify`, req.body);
    
    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    logger.error('Error calling AI service for customer analysis:', error);
    next(new CustomError('Failed to analyze customers', 500));
  }
};

// Sales prediction
export const predictSales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/sales/predict`, req.body);
    
    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    logger.error('Error calling AI service for sales prediction:', error);
    next(new CustomError('Failed to predict sales', 500));
  }
};

// Inventory optimization
export const optimizeInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/inventory/optimize`);
    
    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    logger.error('Error calling AI service for inventory optimization:', error);
    next(new CustomError('Failed to optimize inventory', 500));
  }
};

// Product recommendations
export const recommendProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { buyer, limit } = req.query;
    const response = await axios.get(`${AI_SERVICE_URL}/products/recommend`, {
      params: { buyer, limit },
    });
    
    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    logger.error('Error calling AI service for product recommendations:', error);
    next(new CustomError('Failed to get product recommendations', 500));
  }
};

// Chatbot
export const chatbot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/chatbot`, req.body);
    
    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    logger.error('Error calling AI service for chatbot:', error);
    next(new CustomError('Failed to get chatbot response', 500));
  }
};

export default {
  analyzeCustomers,
  predictSales,
  optimizeInventory,
  recommendProducts,
  chatbot,
}; 