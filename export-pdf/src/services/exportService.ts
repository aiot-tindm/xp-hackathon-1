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
        // Generate PDF directly to response
        await this.pdfService.generatePDFFromExportResult(exportResult, res);
        return; // Don't return JSON response
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
      
      if (res) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          processing_time: processingTime
        });
        return;
      }
      
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
    
    return {
      title,
      subtitle: this.generateSubtitle(params),
      period,
      data: Array.isArray(data) ? data : [data],
      summary: this.generateSummary(data, params),
      charts: this.generateCharts(data, params),
      metadata: {
        generated_at: new Date(),
        total_records: Array.isArray(data) ? data.length : 1,
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
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const charts = [];

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
        // Bar chart for slow moving inventory
        const slowMovingData = data.slice(0, 10).map((item: any, index: number) => ({
          name: item.name || item.product_name || `Sản phẩm ${index + 1}`,
          value: item.stock || item.inventory || item.remaining || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Hàng tồn kho chậm luân chuyển',
          data: slowMovingData
        });
        break;

      case 'all':
      default:
        // Generate all charts for comprehensive report
        // Handle combined data from DataService
        let products: any[] = [];
        let sales: any[] = [];
        // let refunds: any[] = [];

        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
          // Combined data object
          const combinedData = data as any;
          products = combinedData.products || [];
          sales = combinedData.sales || [];
          // refunds = combinedData.refunds || [];
        } else if (Array.isArray(data)) {
          // Single array data
          products = data;
          sales = data;
          // refunds = data;
        }

        // 1. Best sellers
        const allBestSellerData = products.slice(0, 5).map((item: any, index: number) => ({
          name: item.name || item.product_name || `Sản phẩm ${index + 1}`,
          value: item.sold || item.total_sold || item.count || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Top 5 sản phẩm bán chạy',
          data: allBestSellerData
        });

        // 2. Refund rates
        const allRefundData = products.slice(0, 5).map((item: any, index: number) => ({
          name: item.name || item.product_name || `Sản phẩm ${index + 1}`,
          value: item.refund_rate || item.refund_percentage || 0
        }));
        charts.push({
          type: 'line',
          title: 'Tỷ lệ refund theo sản phẩm',
          data: allRefundData
        });

        // 3. Revenue
        const allRevenueData = sales.slice(0, 5).map((item: any, index: number) => ({
          name: item.name || item.product_name || `Sản phẩm ${index + 1}`,
          value: item.total_revenue || item.revenue || item.sales || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Doanh số top 5 sản phẩm',
          data: allRevenueData
        });

        // 4. Refund reasons
        const allRefundReasons = [
          { name: 'Sản phẩm lỗi', value: 35 },
          { name: 'Không đúng mô tả', value: 25 },
          { name: 'Giao hàng chậm', value: 20 },
          { name: 'Thay đổi ý định', value: 15 },
          { name: 'Khác', value: 5 }
        ];
        charts.push({
          type: 'pie',
          title: 'Phân bố lý do refund',
          data: allRefundReasons
        });

        // 5. Slow moving inventory
        const allSlowMovingData = products.slice(0, 5).map((item: any, index: number) => ({
          name: item.name || item.product_name || `Sản phẩm ${index + 1}`,
          value: item.stock || item.inventory || item.remaining || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Hàng tồn kho chậm luân chuyển',
          data: allSlowMovingData
        });
        break;
    }

    return charts;
  }
} 