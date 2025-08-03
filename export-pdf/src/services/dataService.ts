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
    try {
      // Query daily_sales_summary table
      let query = `
        SELECT 
          SUM(total_orders) as total_orders,
          SUM(total_revenue) as total_revenue,
          SUM(total_profit) as total_profit,
          SUM(total_refunds) as total_refunds,
          COUNT(*) as days_count
        FROM daily_sales_summary
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      // Add date filters if provided
      if (month && year) {
        query += ` AND MONTH(analysis_date) = ? AND YEAR(analysis_date) = ?`;
        params.push(parseInt(month), year);
      }
      
      const results = await executeQuery(query, params);
      const result = results[0];
      
      // Calculate refund rate
      const totalOrders = result.total_orders || 0;
      const totalRefunds = result.total_refunds || 0;
      const refundRate = totalOrders > 0 ? (totalRefunds / totalOrders) * 100 : 0;
      
      return {
        total_orders: totalOrders,
        total_revenue: parseFloat(result.total_revenue || 0),
        total_refunds: totalRefunds,
        refund_rate: parseFloat(refundRate.toFixed(2)),
        period: month && year ? `Tháng ${month}/${year}` : 'Tất cả thời gian',
        platform: platform || 'Tất cả'
      };
      
    } catch (error) {
      console.error('Error fetching sales data:', error);
      
      // Fallback to mock data
      return {
        total_orders: 1250,
        total_revenue: 125000000,
        total_refunds: 45,
        refund_rate: 3.6,
        period: month && year ? `Tháng ${month}/${year}` : 'Tất cả thời gian',
        platform: platform || 'Tất cả'
      };
    }
  }

  async getProductPerformance(limit: number = 10, _includeRefund: boolean = false): Promise<ProductPerformance[]> {
    try {
      // Query top_selling_items table only
      let query = `
        SELECT 
          sku,
          item_name,
          total_quantity_sold,
          total_revenue,
          total_profit,
          rank_position,
          data_range,
          analysis_date,
          0 as cost_price,
          0 as sale_price,
          0 as stock_quantity,
          0 as item_id,
          'Unknown' as brand_name,
          'Unknown' as category_name,
          0 as refund_count,
          0 as refund_rate
        FROM top_selling_items
        WHERE sort_type = 'quantity'
      `;
      
      const params: any[] = [];
      
      // Add date filters if provided (you can extend this based on your needs)
      // if (month && year) {
      //   query += ` AND MONTH(tsi.analysis_date) = ? AND YEAR(tsi.analysis_date) = ?`;
      //   params.push(parseInt(month), year);
      // }
      
              // Order by rank position
        query += ` ORDER BY rank_position ASC`;
      
      const results = await executeQuery(query, params);
      
      // Transform results to ProductPerformance format
      const products: ProductPerformance[] = results.map((row: any) => ({
        item_id: row.item_id || 0,
        sku: row.sku,
        name: row.item_name,
        brand_name: row.brand_name || 'Không xác định',
        category_name: row.category_name || 'Không xác định',
        total_sold: row.total_quantity_sold || 0,
        total_revenue: row.total_revenue || 0,
        total_profit: row.total_profit || 0,
        refund_count: row.refund_count || 0,
        refund_rate: row.refund_rate || 0,
        stock_quantity: row.stock_quantity || 0,
        cost_price: row.cost_price || 0,
        sale_price: row.sale_price || 0,
        profit_margin: row.total_profit && row.total_revenue 
          ? ((row.total_profit / row.total_revenue) * 100)
          : 0
      }));
      
      return products;
      
    } catch (error) {
      console.error('Error fetching top selling items:', error);
      
      // Fallback to mock data if database query fails
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
  }

  async getRefundAnalysis(month?: string, year?: number): Promise<RefundAnalysis[]> {
    try {
      // Query refund_analysis table with joins to get complete information
      let query = `
        SELECT 
          ra.sku,
          ra.item_name,
          ra.total_orders,
          ra.refund_orders,
          ra.refund_rate,
          ra.refund_reason,
          ra.refund_quantity,
          ra.rank_position,
          ra.data_range,
          ra.analysis_date,
          i.cost_price,
          i.sale_price,
          i.stock_quantity,
          b.name as brand_name,
          c.name as category_name
        FROM refund_analysis ra
        LEFT JOIN items i ON ra.sku COLLATE utf8mb4_unicode_ci = i.sku COLLATE utf8mb4_unicode_ci
        LEFT JOIN brands b ON i.brand_id = b.id
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE ra.sort_type = 'refund_rate'
      `;
      
      const params: any[] = [];
      
      // Add date filters if provided
      if (month && year) {
        query += ` AND MONTH(ra.analysis_date) = ? AND YEAR(ra.analysis_date) = ?`;
        params.push(parseInt(month), year);
      }
      
      // Order by rank position and limit results
      query += ` ORDER BY ra.rank_position ASC LIMIT 10`;
      
      // console.log('Query:', query);
      // console.log('Params:', params);
      
      const results = await executeQuery(query, params);
      
      // Transform database results to match RefundAnalysis interface
      const refunds: RefundAnalysis[] = results.map((row: any) => ({
        order_id: row.rank_position, // Using rank_position as order_id
        order_code: `REF-${row.sku}-${row.rank_position}`,
        customer_name: 'N/A', // Not available in refund_analysis table
        item_name: row.item_name || 'Không xác định',
        refund_reason: row.refund_reason || 'Không xác định',
        refund_amount: parseFloat(row.sale_price || 0) * row.refund_quantity, // Calculate refund amount
        order_date: new Date(row.analysis_date),
        platform: 'Tất cả', // Not available in refund_analysis table
        // Additional fields from refund_analysis
        sku: row.sku,
        total_orders: row.total_orders,
        refund_orders: row.refund_orders,
        refund_rate: parseFloat(row.refund_rate),
        refund_quantity: row.refund_quantity,
        rank_position: row.rank_position,
        data_range: row.data_range,
        // Additional fields from joined tables
        cost_price: parseFloat(row.cost_price || 0),
        sale_price: parseFloat(row.sale_price || 0),
        stock_quantity: row.stock_quantity || 0,
        brand_name: row.brand_name || 'Không xác định',
        category_name: row.category_name || 'Không xác định'
      }));
      
      // console.log('Refund data:', refunds);
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

  async getDailySalesData(month?: string, year?: number): Promise<any[]> {
    try {
      // Query daily_sales_summary table for chart data
      let query = `
        SELECT 
          analysis_date,
          total_orders,
          total_revenue,
          total_profit,
          total_refunds
        FROM daily_sales_summary
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      // Add date filters if provided
      if (month && year) {
        query += ` AND MONTH(analysis_date) = ? AND YEAR(analysis_date) = ?`;
        params.push(parseInt(month), year);
      }
      
      // Order by date
      query += ` ORDER BY analysis_date ASC`;
      
      const results = await executeQuery(query, params);
      
      // Transform results to chart data format
      const dailyData = results.map((row: any) => ({
        date: row.analysis_date,
        orders: row.total_orders || 0,
        revenue: parseFloat(row.total_revenue || 0),
        profit: parseFloat(row.total_profit || 0),
        refunds: row.total_refunds || 0
      }));
      
      return dailyData;
      
    } catch (error) {
      console.error('Error fetching daily sales data:', error);
      
      // Return mock data as fallback
      return [
        { date: '2024-06-30', orders: 8, revenue: 45581.15, profit: 32666.15, refunds: 0 },
        { date: '2025-08-03', orders: 0, revenue: 0, profit: 0, refunds: 0 }
      ];
    }
  }

  async getRefundReasonAnalysis(month?: string, year?: number): Promise<any[]> {
    try {
      // Query refund_analysis table for refund reasons
      let query = `
        SELECT 
          refund_reason,
          COUNT(*) as count,
          SUM(refund_orders) as total_refund_orders,
          AVG(refund_rate) as avg_refund_rate,
          SUM(refund_quantity) as total_refund_quantity
        FROM refund_analysis
        WHERE sort_type = 'refund_reason'
          AND refund_reason IS NOT NULL 
          AND refund_reason != ''
      `;
      
      const params: any[] = [];
      
      // Add date filters if provided
      if (month && year) {
        query += ` AND MONTH(analysis_date) = ? AND YEAR(analysis_date) = ?`;
        params.push(parseInt(month), year);
      }
      
      // Group by refund reason and order by count
      query += ` GROUP BY refund_reason ORDER BY count DESC`;
      
      const results = await executeQuery(query, params);
      
      // Transform results to chart data format
      const refundReasons = results.map((row: any) => ({
        name: row.refund_reason || 'Không xác định',
        value: row.count || 0,
        total_refund_orders: row.total_refund_orders || 0,
        avg_refund_rate: parseFloat(row.avg_refund_rate || 0),
        total_refund_quantity: row.total_refund_quantity || 0
      }));
      
      return refundReasons;
      
    } catch (error) {
      console.error('Error fetching refund reason analysis:', error);
      
      // Return mock data as fallback
      return [
        { name: 'Sản phẩm lỗi', value: 35 },
        { name: 'Không đúng mô tả', value: 25 },
        { name: 'Giao hàng chậm', value: 20 },
        { name: 'Thay đổi ý định', value: 15 },
        { name: 'Khác', value: 5 }
      ];
    }
  }

  async getBrandPerformance(limit: number = 10): Promise<BrandPerformance[]> {
    try {
      // Query brand_summary table with GROUP BY to avoid duplicates
      let query = `
        SELECT 
          MIN(brand_id) as brand_id,
          brand_name,
          SUM(total_quantity_sold) as total_quantity_sold,
          SUM(total_revenue) as total_revenue,
          SUM(total_profit) as total_profit,
          AVG(profit_margin) as profit_margin,
          MIN(rank_position) as rank_position
        FROM brand_summary
        WHERE sort_type = 'revenue'
        GROUP BY brand_name
      `;
      
      const params: any[] = [];
      
      // Order by total revenue and limit results
      query += ` ORDER BY total_revenue DESC LIMIT ${Math.max(1, Math.min(limit, 100))}`;
      
      const results = await executeQuery(query, params);
      
      // Transform results to BrandPerformance format
      const brands: BrandPerformance[] = results.map((row: any) => ({
        brand_id: row.brand_id,
        brand_name: row.brand_name,
        total_quantity_sold: row.total_quantity_sold || 0,
        total_revenue: parseFloat(row.total_revenue || 0),
        total_orders: 0, // Not available in brand_summary
        average_order_value: 0, // Not available in brand_summary
        refund_rate: 0 // Not available in brand_summary
      }));
      
      return brands;
      
    } catch (error) {
      console.error('Error fetching brand performance:', error);
      
      // Fallback to mock data
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
  }

  async getCategoryPerformance(limit: number = 10): Promise<CategoryPerformance[]> {
    try {
      // Query category_summary table with GROUP BY to avoid duplicates
      let query = `
        SELECT 
          MIN(category_id) as category_id,
          category_name,
          SUM(total_quantity_sold) as total_quantity_sold,
          SUM(total_revenue) as total_revenue,
          SUM(total_profit) as total_profit,
          AVG(profit_margin) as profit_margin,
          MIN(rank_position) as rank_position
        FROM category_summary
        WHERE sort_type = 'revenue'
        GROUP BY category_name
      `;
      
      const params: any[] = [];
      
      // Order by total revenue and limit results
      query += ` ORDER BY total_revenue DESC LIMIT ${Math.max(1, Math.min(limit, 100))}`;
      
      const results = await executeQuery(query, params);
      
      // Transform results to CategoryPerformance format
      const categories: CategoryPerformance[] = results.map((row: any) => ({
        category_id: row.category_id,
        category_name: row.category_name,
        total_quantity_sold: row.total_quantity_sold || 0,
        total_revenue: parseFloat(row.total_revenue || 0),
        total_orders: 0, // Not available in category_summary
        average_order_value: 0, // Not available in category_summary
        refund_rate: 0 // Not available in category_summary
      }));
      
      return categories;
      
    } catch (error) {
      console.error('Error fetching category performance:', error);
      
      // Fallback to mock data
      const categories: CategoryPerformance[] = [
        {
          category_id: 1,
          category_name: 'Electronics',
          total_quantity_sold: 200,
          total_revenue: 60000000,
          total_orders: 150,
          average_order_value: 400000,
          refund_rate: 3.3
        },
        {
          category_id: 2,
          category_name: 'Clothing',
          total_quantity_sold: 80,
          total_revenue: 32000000,
          total_orders: 65,
          average_order_value: 492308,
          refund_rate: 2.5
        }
      ];

      return categories.slice(0, limit);
    }
  }

  async getSlowMovingProducts(limit: number = 10): Promise<ProductPerformance[]> {
    try {
      // Query items and order_items to identify slow moving products
      let query = `
        SELECT 
          i.id as item_id,
          i.sku,
          i.name,
          i.cost_price,
          i.sale_price,
          i.stock_quantity,
          COALESCE(SUM(oi.quantity), 0) as total_quantity_sold,
          COALESCE(SUM(oi.quantity * oi.price_per_unit), 0) as total_revenue,
          COALESCE(SUM(oi.quantity * (oi.price_per_unit - i.cost_price)), 0) as total_profit,
          b.name as brand_name,
          c.name as category_name,
          0 as refund_count,
          0.00 as refund_rate,
          CASE 
            WHEN COALESCE(SUM(oi.quantity), 0) = 0 THEN 999999
            ELSE i.stock_quantity / COALESCE(SUM(oi.quantity), 0)
          END as stock_to_sales_ratio
        FROM items i
        LEFT JOIN order_items oi ON i.id = oi.item_id
        LEFT JOIN brands b ON i.brand_id = b.id
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.is_active = 1
        GROUP BY i.id, i.sku, i.name, i.cost_price, i.sale_price, i.stock_quantity, b.name, c.name
        HAVING stock_to_sales_ratio > 5 OR total_quantity_sold = 0
        ORDER BY stock_to_sales_ratio DESC, total_quantity_sold ASC
        LIMIT ${Math.max(1, Math.min(limit, 100))}
      `;
      
      const results = await executeQuery(query, []);
      
      // Transform results to ProductPerformance format
      const products: ProductPerformance[] = results.map((row: any) => ({
        item_id: row.item_id,
        sku: row.sku,
        name: row.name,
        cost_price: parseFloat(row.cost_price || 0),
        sale_price: parseFloat(row.sale_price || 0),
        stock_quantity: row.stock_quantity || 0,
        total_sold: row.total_quantity_sold || 0,
        total_revenue: parseFloat(row.total_revenue || 0),
        brand_name: row.brand_name || 'Unknown',
        category_name: row.category_name || 'Unknown',
        refund_count: row.refund_count || 0,
        refund_rate: parseFloat(row.refund_rate || 0),
        profit_margin: parseFloat(row.total_profit || 0) / parseFloat(row.total_revenue || 1) * 100
      }));
      
      return products;
      
    } catch (error) {
      console.error('Error fetching slow moving products:', error);
      
      // Fallback to mock data
      const products: ProductPerformance[] = [
        {
          item_id: 1,
          sku: 'SLOW-001',
          name: 'Sản phẩm ế 1',
          cost_price: 100,
          sale_price: 150,
          stock_quantity: 50,
          total_sold: 5,
          total_revenue: 750,
          brand_name: 'Brand A',
          category_name: 'Category 1',
          refund_count: 0,
          refund_rate: 0,
          profit_margin: 33.33
        },
        {
          item_id: 2,
          sku: 'SLOW-002',
          name: 'Sản phẩm ế 2',
          cost_price: 200,
          sale_price: 300,
          stock_quantity: 30,
          total_sold: 3,
          total_revenue: 900,
          brand_name: 'Brand B',
          category_name: 'Category 2',
          refund_count: 1,
          refund_rate: 33.33,
          profit_margin: 33.33
        }
      ];

      return products.slice(0, limit);
    }
  }

  async getDataByType(type: ExportType, params: any): Promise<any> {
    switch (type) {
      case 'revenue':
        return await this.getDailySalesData(params.month, params.year);
      
      case 'best_seller':
        return await this.getProductPerformance(params.limit || 10, params.include_refund);
      
      case 'refund':
        return await this.getRefundAnalysis(params.month, params.year);
      
      case 'refund_reason':
        return await this.getRefundReasonAnalysis(params.month, params.year);
      
      case 'category':
        return await this.getCategoryPerformance(params.limit || 10);
      
      case 'brand':
        return await this.getBrandPerformance(params.limit || 10);
      
      case 'slow_moving':
        return await this.getSlowMovingProducts(params.limit || 10);
      
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