import { DataService } from './dataService';
import { PDFService } from './pdfService';
import { 
  ExportResponse, 
  ExportParams, 
  ExportResult,
  DirectExportRequest
} from '../types/export';
import { Response } from 'express';

export class ExportService {
  private dataService: DataService;
  private pdfService: PDFService;

  constructor() {
    this.dataService = new DataService();
    this.pdfService = new PDFService();
  }

  async exportDataDirect(request: DirectExportRequest, res?: Response): Promise<ExportResponse | void> {
    const startTime = Date.now();
    
    try {
      // Step 1: Prepare export parameters directly from request
      const exportParams: ExportParams = {
        type: request.type,
        platform: request.platform,
        month: request.month,
        year: request.year,
        quarter: request.quarter,
        include_refund: request.include_refund,
        limit: request.limit || 10,
        language: request.language || 'vi',
        format: request.format || 'pdf'
      };

      // Step 2: Get data based on type
      const data = await this.dataService.getDataByType(exportParams.type, exportParams);
      
      // Step 3: Prepare export result
      const exportResult: ExportResult = this.prepareExportResult(data, exportParams);

      // Step 4: Generate file based on format
      if (exportParams.format === 'pdf' && res) {
        try {
          // Generate PDF directly to response
          await this.pdfService.generatePDFFromExportResult(exportResult, res);
          return; // Don't return JSON response
        } catch (pdfError) {
          console.error('❌ PDF generation failed:', pdfError);
          // Return error response instead of void
          const processingTime = Date.now() - startTime;
          return {
            success: false,
            error: `PDF generation failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`,
            processing_time: processingTime
          };
        }
      } else {
        // For other formats or when res is not provided, return JSON
        const processingTime = Date.now() - startTime;
        return {
          success: true,
          data: exportResult,
          processing_time: processingTime
        };
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ Direct export failed:', error);
      
      // Always return error response object, let route handler decide how to send it
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processing_time: processingTime
      };
    }
  }

  private prepareExportResult(data: any, params: ExportParams): ExportResult {
    const titles = {
      best_seller: 'Báo cáo sản phẩm bán chạy',
      refund: 'Báo cáo hàng bị refund nhiều',
      refund_reason: 'Báo cáo phân tích lý do refund',
      revenue: 'Báo cáo doanh thu theo ngày',
      category: 'Báo cáo phân tích theo danh mục',
      brand: 'Báo cáo phân tích theo thương hiệu',
      slow_moving: 'Báo cáo hàng ế',
      all: 'Báo cáo tổng hợp tất cả biểu đồ'
    };

    const title = titles[params.type] || 'Báo cáo xuất dữ liệu';
    const period = this.formatPeriod(params);
    
    const charts = this.generateCharts(data, params);
    console.log('🔍 prepareExportResult - charts generated:', charts.length);
    
    return {
      title,
      subtitle: this.generateSubtitle(params),
      period,
      data: data,
      summary: this.generateSummary(data, params),
      charts: charts,
      metadata: {
        generated_at: new Date(),
        total_records: params.type === 'all' ? charts.length : (Array.isArray(data) ? data.length : 1),
        export_type: params.type,
        filters: {
          platform: params.platform,
          month: params.month,
          year: params.year,
          quarter: params.quarter,
          include_refund: params.include_refund
        }
      }
    };
  }

  private formatPeriod(params: ExportParams): string {
    if (params.month && params.year) {
      return `Tháng ${params.month}/${params.year}`;
    }
    if (params.quarter && params.year) {
      return `Quý ${params.quarter} năm ${params.year}`;
    }
    if (params.year) {
      return `Năm ${params.year}`;
    }
    return 'Tất cả thời gian';
  }

  private generateSubtitle(params: ExportParams): string {
    const parts = [];
    
    if (params.platform) {
      parts.push(`Nền tảng: ${params.platform}`);
    }
    
    if (params.include_refund) {
      parts.push('Bao gồm dữ liệu hoàn hàng');
    }
    
    return parts.join(' | ');
  }

  private generateSummary(data: any, _params: ExportParams): any {
    console.log('Data:', data.length);
    if (Array.isArray(data)) {
      return {
        total_records: data.length,
        total_revenue: data.reduce((sum: number, item: any) => sum + (item.total_revenue || 0), 0),
        total_orders: data.reduce((sum: number, item: any) => sum + (item.total_orders || 0), 0),
        average_refund_rate: data.reduce((sum: number, item: any) => sum + (item.refund_rate || 0), 0) / data.length
      };
    }
    
    return data;
  }

  private generateCharts(data: any, params: ExportParams): any[] {
    const charts = [];
    
    console.log('🔍 generateCharts - type:', params.type);
    console.log('🔍 generateCharts - data type:', typeof data);
    console.log('🔍 generateCharts - data is array:', Array.isArray(data));
    console.log('🔍 generateCharts - data keys:', data && typeof data === 'object' ? Object.keys(data) : 'N/A');
    
    // For type 'all', data is an object containing multiple arrays
    if (params.type === 'all') {
      // Handle combined data object
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        console.log('🔍 generateCharts - calling generateAllCharts');
        // Process combined data for 'all' type
        return this.generateAllCharts(data);
      } else {
        console.log('🔍 generateCharts - data is not object for type all, returning empty');
        return [];
      }
    }
    
    // For other types, data should be an array
    if (!Array.isArray(data) || data.length === 0) {
      console.log('🔍 generateCharts - data is not array or empty, returning empty');
      return [];
    }

    // Generate charts based on export type
    switch (params.type) {
      case 'best_seller':
        // Bar chart for best selling products
        const bestSellerData = data.slice(0, 10).map((item: any, index: number) => ({
          name: item.name || item.item_name || `Sản phẩm ${index + 1}`,
          value: item.total_sold || item.sold || item.count || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Top sản phẩm bán chạy (Số lượng)',
          data: bestSellerData
        });
        
        // Revenue chart for best selling products
        const bestSellerRevenueData = data.slice(0, 10).map((item: any, index: number) => ({
          name: item.name || item.item_name || `Sản phẩm ${index + 1}`,
          value: item.total_revenue || item.revenue || 0
        }));
        charts.push({
          type: 'horizontal_bar',
          title: 'Doanh thu theo sản phẩm (VNĐ)',
          data: bestSellerRevenueData
        });
        break;

      case 'refund':
        // Horizontal bar chart for high refund products
        const refundData = data.slice(0, 10).map((item: any, index: number) => ({
          name: item.item_name || `Sản phẩm ${index + 1}`,
          value: item.refund_rate || item.refund_percentage || 0
        }));
        charts.push({
          type: 'horizontal_bar',
          title: 'Tỷ lệ refund theo sản phẩm (%)',
          data: refundData
        });
        break;

      case 'refund_reason':
        // Pie chart for refund reasons
        const refundReasons = data.slice(0, 10).map((item: any, index: number) => ({
          name: item.name || item.refund_reason || `Lý do ${index + 1}`,
          value: item.value || item.count || 0
        }));
        charts.push({
          type: 'pie',
          title: 'Phân bố lý do refund',
          data: refundReasons
        });
        break;

      case 'revenue':
        // Line chart for daily revenue
        const dailyRevenueData = data.slice(0, 30).map((item: any) => ({
          name: new Date(item.date).toLocaleDateString('vi-VN'),
          value: item.revenue || 0
        }));
        charts.push({
          type: 'line',
          title: 'Doanh thu theo ngày (VNĐ)',
          data: dailyRevenueData
        });

        // Bar chart for daily orders
        const dailyOrdersData = data.slice(0, 30).map((item: any) => ({
          name: new Date(item.date).toLocaleDateString('vi-VN'),
          value: item.orders || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Số đơn hàng theo ngày',
          data: dailyOrdersData
        });
        break;

      case 'category':
        // Bar chart for category revenue
        const categoryRevenueData = data.slice(0, 10).map((item: any) => ({
          name: item.category_name || 'Không xác định',
          value: item.total_revenue || 0
        }));
        charts.push({
          type: 'horizontal_bar',
          title: 'Doanh thu theo danh mục (VNĐ)',
          data: categoryRevenueData
        });

        // Bar chart for category quantity
        const categoryQuantityData = data.slice(0, 10).map((item: any) => ({
          name: item.category_name || 'Không xác định',
          value: item.total_quantity_sold || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Số lượng bán theo danh mục',
          data: categoryQuantityData
        });
        break;

      case 'brand':
        // Horizontal bar chart for brand revenue
        const brandRevenueData = data.slice(0, 10).map((item: any) => ({
          name: item.brand_name || 'Không xác định',
          value: item.total_revenue || 0
        }));
        charts.push({
          type: 'horizontal_bar',
          title: 'Doanh thu theo thương hiệu (VNĐ)',
          data: brandRevenueData
        });

        // Bar chart for brand quantity
        const brandQuantityData = data.slice(0, 10).map((item: any) => ({
          name: item.brand_name || 'Không xác định',
          value: item.total_quantity_sold || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Số lượng bán theo thương hiệu',
          data: brandQuantityData
        });
        break;

      case 'slow_moving':
        // Horizontal bar chart for slow moving products (stock quantity)
        const slowMovingStockData = data.slice(0, 10).map((item: any) => ({
          name: item.name || 'Unknown Product',
          value: item.stock_quantity || 0
        }));
        charts.push({
          type: 'horizontal_bar',
          title: 'Hàng tồn kho ế (Số lượng)',
          data: slowMovingStockData
        });

        // Bar chart for slow moving products (total sold)
        const slowMovingSoldData = data.slice(0, 10).map((item: any) => ({
          name: item.name || 'Unknown Product',
          value: item.total_sold || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Số lượng đã bán của hàng ế',
          data: slowMovingSoldData
        });
        break;

      default:
        // Handle unsupported types
        console.warn(`Unsupported export type: ${params.type}`);
        break;
    }

    return charts;
  }

  private generateAllCharts(data: any): any[] {
    const charts: any[] = [];
    
    // Extract data from combined object
    const products = data.products || [];
    const sales = data.sales || [];
    const refundReasonsData = data.refund_reasons || [];
    const categories = data.categories || [];
    const brands = data.brands || [];
    const slowMoving = data.slow_moving || [];

    // 1. Best sellers - Quantity
    const allBestSellerQuantityData = products.slice(0, 5).map((item: any) => ({
      name: item.name || item.item_name || 'Unknown Product',
      value: item.total_sold || item.total_quantity_sold || 0
    }));
    charts.push({
      type: 'horizontal_bar',
      title: 'Top 5 sản phẩm bán chạy (Số lượng)',
      data: allBestSellerQuantityData
    });

    // 2. Best sellers - Revenue
    const allBestSellerRevenueData = products.slice(0, 5).map((item: any) => ({
      name: item.name || item.item_name || 'Unknown Product',
      value: item.total_revenue || 0
    }));
    charts.push({
      type: 'horizontal_bar',
      title: 'Doanh thu theo sản phẩm (VNĐ)',
      data: allBestSellerRevenueData
    });

    // 3. Revenue by day
    const allRevenueData = sales.slice(0, 10).map((item: any) => ({
      name: new Date(item.date).toLocaleDateString('vi-VN'),
      value: item.revenue || 0
    }));
    charts.push({
      type: 'line',
      title: 'Doanh thu theo ngày (VNĐ)',
      data: allRevenueData
    });

    // 4. Orders by day
    const allOrdersData = sales.slice(0, 10).map((item: any) => ({
      name: new Date(item.date).toLocaleDateString('vi-VN'),
      value: item.orders || 0
    }));
    charts.push({
      type: 'bar',
      title: 'Số đơn hàng theo ngày',
      data: allOrdersData
    });

    // 5. Refund reasons
    const allRefundReasonsData = refundReasonsData.slice(0, 5).map((item: any) => ({
      name: item.refund_reason || 'Unknown',
      value: item.count || 0
    }));
    charts.push({
      type: 'pie',
      title: 'Phân bố lý do refund',
      data: allRefundReasonsData
    });

    // 6. Category revenue
    const allCategoryRevenueData = categories.slice(0, 5).map((item: any) => ({
      name: item.category_name || 'Unknown',
      value: item.total_revenue || 0
    }));
    charts.push({
      type: 'horizontal_bar',
      title: 'Doanh thu theo danh mục (VNĐ)',
      data: allCategoryRevenueData
    });

    // 7. Category quantity
    const allCategoryQuantityData = categories.slice(0, 5).map((item: any) => ({
      name: item.category_name || 'Unknown',
      value: item.total_quantity_sold || 0
    }));
    charts.push({
      type: 'bar',
      title: 'Số lượng bán theo danh mục',
      data: allCategoryQuantityData
    });

    // 8. Brand revenue
    const allBrandRevenueData = brands.slice(0, 5).map((item: any) => ({
      name: item.brand_name || 'Unknown',
      value: item.total_revenue || 0
    }));
    charts.push({
      type: 'horizontal_bar',
      title: 'Doanh thu theo thương hiệu (VNĐ)',
      data: allBrandRevenueData
    });

    // 9. Brand quantity
    const allBrandQuantityData = brands.slice(0, 5).map((item: any) => ({
      name: item.brand_name || 'Unknown',
      value: item.total_quantity_sold || 0
    }));
    charts.push({
      type: 'bar',
      title: 'Số lượng bán theo thương hiệu',
      data: allBrandQuantityData
    });

    // 10. Slow moving stock
    const allSlowMovingStockData = slowMoving.slice(0, 5).map((item: any) => ({
      name: item.name || 'Unknown Product',
      value: item.stock_quantity || 0
    }));
    charts.push({
      type: 'horizontal_bar',
      title: 'Hàng tồn kho ế (Số lượng)',
      data: allSlowMovingStockData
    });

    // 11. Slow moving sold
    const allSlowMovingSoldData = slowMoving.slice(0, 5).map((item: any) => ({
      name: item.name || 'Unknown Product',
      value: item.total_sold || 0
    }));
    charts.push({
      type: 'bar',
      title: 'Số lượng đã bán của hàng ế',
      data: allSlowMovingSoldData
    });

    return charts;
  }
} 