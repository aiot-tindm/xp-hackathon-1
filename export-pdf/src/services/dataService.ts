import { 
  SalesData, 
  ProductPerformance, 
  RefundAnalysis, 
  BrandPerformance, 
  CategoryPerformance
} from '../types/database';
import { ExportType } from '../types/export';
import { executeQuery } from '../config/database';

export class DataService {
  
  // Mock data for demonstration - in real implementation, this would connect to database
  async getSalesData(month?: string, year?: number, platform?: string): Promise<SalesData> {
    // Mock implementation - replace with actual database queries
    return {
      total_orders: 1250,
      total_revenue: 125000000,
      total_refunds: 45,
      refund_rate: 3.6,
      period: month && year ? `Tháng ${month}/${year}` : 'Tất cả thời gian',
      platform: platform
    };
  }

  async getProductPerformance(limit: number = 10, _includeRefund: boolean = false): Promise<ProductPerformance[]> {
    // Mock implementation - replace with actual database queries
    const products: ProductPerformance[] = [
      {
        item_id: 1,
        sku: 'IPHONE15-001',
        name: 'iPhone 15 Pro Max 256GB',
        brand_name: 'Apple',
        category_name: 'Điện thoại',
        total_sold: 150,
        total_revenue: 45000000,
        refund_count: 5,
        refund_rate: 3.3,
        stock_quantity: 30,
        cost_price: 28000000,
        sale_price: 30000000,
        profit_margin: 7.1
      },
      {
        item_id: 2,
        sku: 'MACBOOK-001',
        name: 'MacBook Air M2 13 inch',
        brand_name: 'Apple',
        category_name: 'Laptop',
        total_sold: 80,
        total_revenue: 32000000,
        refund_count: 2,
        refund_rate: 2.5,
        stock_quantity: 15,
        cost_price: 25000000,
        sale_price: 40000000,
        profit_margin: 37.5
      }
    ];

    return products.slice(0, limit);
  }

  async getRefundAnalysis(month?: string, year?: number): Promise<RefundAnalysis[]> {
    try {
      // Query refund_analysis table with filters
      let query = `
        SELECT 
          sku,
          item_name,
          total_orders,
          refund_orders,
          refund_rate,
          refund_reason,
          refund_quantity,
          rank_position,
          data_range,
          analysis_date
        FROM refund_analysis 
        WHERE sort_type = 'refund_count'
      `;

      console.log('Query:', query);
      
      const params: any[] = [];
      
      // Add date filters if provided
      if (month && year) {
        query += ` AND MONTH(analysis_date) = ? AND YEAR(analysis_date) = ?`;
        params.push(parseInt(month), year);
      }
      
      // Order by rank position and limit results
      query += ` ORDER BY rank_position ASC LIMIT 10`;
      
      const results = await executeQuery(query, params);
      
      // Transform database results to match RefundAnalysis interface
      const refunds: RefundAnalysis[] = results.map((row: any) => ({
        order_id: row.rank_position, // Using rank_position as order_id
        order_code: `REF-${row.sku}-${row.rank_position}`,
        customer_name: 'N/A', // Not available in refund_analysis table
        item_name: row.item_name || 'Không xác định',
        refund_reason: row.refund_reason || 'Không xác định',
        refund_amount: 0, // Not available in refund_analysis table
        order_date: new Date(row.analysis_date),
        platform: 'Tất cả', // Not available in refund_analysis table
        // Additional fields from refund_analysis
        sku: row.sku,
        total_orders: row.total_orders,
        refund_orders: row.refund_orders,
        refund_rate: parseFloat(row.refund_rate),
        refund_quantity: row.refund_quantity,
        rank_position: row.rank_position,
        data_range: row.data_range
      }));
      
      return refunds;
    } catch (error) {
      console.error('Error fetching refund analysis:', error);
      // Return mock data as fallback
      return [
        {
          order_id: 1,
          order_code: 'ORD-2025-001',
          customer_name: 'Nguyễn Văn A',
          item_name: 'iPhone 15 Pro Max 256GB',
          refund_reason: 'Sản phẩm bị lỗi màn hình',
          refund_amount: 30000000,
          order_date: new Date('2025-07-15'),
          platform: 'Shopee'
        },
        {
          order_id: 2,
          order_code: 'ORD-2025-002',
          customer_name: 'Trần Thị B',
          item_name: 'MacBook Air M2 13 inch',
          refund_reason: 'Không đúng mô tả sản phẩm',
          refund_amount: 40000000,
          order_date: new Date('2025-07-20'),
          platform: 'Website'
        }
      ];
    }
  }

  async getBrandPerformance(limit: number = 10): Promise<BrandPerformance[]> {
    // Mock implementation - replace with actual database queries
    const brands: BrandPerformance[] = [
      {
        brand_id: 1,
        brand_name: 'Apple',
        total_quantity_sold: 230,
        total_revenue: 77000000,
        total_orders: 180,
        average_order_value: 427778,
        refund_rate: 2.8
      },
      {
        brand_id: 2,
        brand_name: 'Samsung',
        total_quantity_sold: 120,
        total_revenue: 36000000,
        total_orders: 95,
        average_order_value: 378947,
        refund_rate: 4.2
      }
    ];

    return brands.slice(0, limit);
  }

  async getCategoryPerformance(limit: number = 10): Promise<CategoryPerformance[]> {
    // Mock implementation - replace with actual database queries
    const categories: CategoryPerformance[] = [
      {
        category_id: 1,
        category_name: 'Điện thoại',
        total_quantity_sold: 200,
        total_revenue: 60000000,
        total_orders: 150,
        average_order_value: 400000,
        refund_rate: 3.3
      },
      {
        category_id: 2,
        category_name: 'Laptop',
        total_quantity_sold: 80,
        total_revenue: 32000000,
        total_orders: 65,
        average_order_value: 492308,
        refund_rate: 2.5
      }
    ];

    return categories.slice(0, limit);
  }

  async getDataByType(type: ExportType, params: any): Promise<any> {
    switch (type) {
      case 'revenue':
        return await this.getSalesData(params.month, params.year, params.platform);
      
      case 'best_seller':
        return await this.getProductPerformance(params.limit || 10, params.include_refund);
      
      case 'refund':
        return await this.getRefundAnalysis(params.month, params.year);
      
      case 'refund_reason':
        return await this.getRefundAnalysis(params.month, params.year);
      
      case 'slow_moving':
        return await this.getProductPerformance(params.limit || 10, params.include_refund);
      
      case 'all':
        // Return combined data for all charts
        const [salesData, productData, refundData] = await Promise.all([
          this.getSalesData(params.month, params.year, params.platform),
          this.getProductPerformance(params.limit || 10, params.include_refund),
          this.getRefundAnalysis(params.month, params.year)
        ]);
        
        return {
          sales: salesData,
          products: productData,
          refunds: refundData
        };
      
      default:
        throw new Error(`Unsupported export type: ${type}`);
    }
  }
} 