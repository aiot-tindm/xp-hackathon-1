// Database types based on init.sql schema

export interface Brand {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Item {
  id: number;
  sku: string;
  name: string;
  cost_price: number;
  sale_price: number;
  stock_quantity: number;
  brand_id?: number;
  category_id?: number;
  is_active: boolean;
  is_adult_content?: boolean;
  nudity_detection_score?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: number;
  order_code: string;
  customer_id: number;
  shipping_location?: string;
  platform: string;
  order_date: Date;
  status: string;
  refund_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  price_per_unit: number;
  discount_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface DailySalesSummary {
  id: number;
  analysis_by: 'system' | 'user';
  analysis_date: Date;
  platform: string;
  total_orders: number;
  total_revenue: number;
  updated_at: Date;
}

export interface BrandSummary {
  id: number;
  analysis_by: 'system' | 'user';
  analysis_date: Date;
  platform: string;
  brand_id: number;
  total_quantity_sold: number;
  total_revenue: number;
  updated_at: Date;
}

export interface CategorySummary {
  id: number;
  analysis_by: 'system' | 'user';
  analysis_date: Date;
  platform: string;
  category_id: number;
  total_quantity_sold: number;
  total_revenue: number;
  updated_at: Date;
}

export interface LoyalCustomer {
  customer_id: number;
  total_orders: number;
  total_spent: number;
  last_purchase_date?: Date;
  loyalty_segment: string;
  created_at: Date;
  updated_at: Date;
}

// Extended types for export functionality
export interface SalesData {
  total_orders: number;
  total_revenue: number;
  total_refunds: number;
  refund_rate: number;
  period: string;
  platform?: string;
}

export interface ProductPerformance {
  item_id: number;
  sku: string;
  name: string;
  brand_name?: string;
  category_name?: string;
  total_sold: number;
  total_revenue: number;
  refund_count: number;
  refund_rate: number;
  stock_quantity: number;
  cost_price: number;
  sale_price: number;
  profit_margin: number;
}

export interface RefundAnalysis {
  order_id: number;
  order_code: string;
  customer_name: string;
  item_name: string;
  refund_reason: string;
  refund_amount: number;
  order_date: Date;
  platform: string;
}

export interface BrandPerformance {
  brand_id: number;
  brand_name: string;
  total_quantity_sold: number;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  refund_rate: number;
}

export interface CategoryPerformance {
  category_id: number;
  category_name: string;
  total_quantity_sold: number;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  refund_rate: number;
} 