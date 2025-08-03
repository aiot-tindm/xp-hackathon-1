// Base types
export interface BaseEntity {
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product extends BaseEntity {
  sku: string;
  name: string;
  brand: string;
  category: string;
  sellPrice: number | any; // Allow Prisma Decimal
  hsd?: Date | null; // Allow null from database
}

export interface CreateProductDto {
  sku: string;
  name: string;
  brand: string;
  category: string;
  sellPrice: number;
  hsd?: Date;
}

export interface UpdateProductDto {
  name?: string;
  brand?: string;
  category?: string;
  sellPrice?: number;
  hsd?: Date;
}

// Lot types
export interface Lot extends BaseEntity {
  id: number;
  sku: string;
  importDate: Date;
  importPrice: number | any; // Allow Prisma Decimal
  quantity: number;
  remain: number;
  product?: Product;
}

export interface CreateLotDto {
  sku: string;
  importDate: Date;
  importPrice: number;
  quantity: number;
}

export interface UpdateLotDto {
  importDate?: Date;
  importPrice?: number;
  quantity?: number;
  remain?: number;
}

// Sale Order types
export interface SaleOrder extends BaseEntity {
  id: number;
  saleDate: Date;
  status: string;
  buyer: string;
  location: string;
  platform: string;
  refundReason?: string | null; // Allow null from database
  items?: SaleOrderItem[];
}

export interface CreateSaleOrderDto {
  saleDate: Date;
  status: string;
  buyer: string;
  location: string;
  platform: string;
  items: CreateSaleOrderItemDto[];
}

export interface UpdateSaleOrderDto {
  saleDate?: Date;
  status?: string;
  buyer?: string;
  location?: string;
  platform?: string;
  refundReason?: string;
}

// Sale Order Item types
export interface SaleOrderItem {
  id: number;
  orderId: number;
  sku: string;
  lotId?: number | null; // Allow null from database
  salePrice: number | any; // Allow Prisma Decimal
  quantity: number;
  discount: number | any; // Allow Prisma Decimal
  createdAt: Date;
  product?: Product;
  lot?: Lot | null; // Allow null from database
}

export interface CreateSaleOrderItemDto {
  sku: string;
  lotId?: number;
  salePrice: number;
  quantity: number;
  discount?: number;
}

// Event Sale types
export interface EventSale extends BaseEntity {
  id: number;
  eventName: string;
  startDate: Date;
  endDate: Date;
  discount: number | any; // Allow Prisma Decimal
  items?: EventSaleItem[];
}

export interface CreateEventSaleDto {
  eventName: string;
  startDate: Date;
  endDate: Date;
  discount: number;
  items?: CreateEventSaleItemDto[];
}

export interface UpdateEventSaleDto {
  eventName?: string;
  startDate?: Date;
  endDate?: Date;
  discount?: number;
}

// Event Sale Item types
export interface EventSaleItem {
  eventId: number;
  sku: string;
  customDiscount: number | any; // Allow Prisma Decimal
  product?: Product;
}

export interface CreateEventSaleItemDto {
  sku: string;
  customDiscount: number;
}

// Coupon types
export interface Coupon extends BaseEntity {
  id: number;
  code: string;
  buyer: string;
  discount: number | any; // Allow Prisma Decimal
  validFrom: Date;
  validTo: Date;
  used: boolean;
}

export interface CreateCouponDto {
  code: string;
  buyer: string;
  discount: number;
  validFrom: Date;
  validTo: Date;
}

export interface UpdateCouponDto {
  code?: string;
  buyer?: string;
  discount?: number;
  validFrom?: Date;
  validTo?: Date;
  used?: boolean;
}

// Customer Analysis types
export interface CustomerAnalysis {
  buyer: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate: Date;
  customerType: CustomerType;
}

export enum CustomerType {
  WHALE = 'whale',
  VIP = 'vip',
  CHURN = 'churn',
  NEW = 'new'
}

// AI Prediction types
export interface SalesPrediction {
  sku: string;
  predictedQuantity: number;
  confidence: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface InventoryOptimization {
  sku: string;
  currentStock: number;
  recommendedStock: number;
  reorderPoint: number;
  urgency: 'high' | 'medium' | 'low';
}

export interface ProductRecommendation {
  sku: string;
  score: number;
  reason: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query types
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ProductQuery extends PaginationQuery {
  brand?: string;
  category?: string;
  search?: string;
}

export interface SalesQuery extends PaginationQuery {
  startDate?: Date;
  endDate?: Date;
  buyer?: string;
  platform?: string;
  status?: string;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Cache types
export interface CacheConfig {
  ttl: number;
  prefix: string;
}

// Logger types
export interface LogLevel {
  error: 0;
  warn: 1;
  info: 2;
  http: 3;
  debug: 4;
} 