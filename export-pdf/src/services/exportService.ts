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
      console.log('📝 Direct export request:', request);
      
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

      console.log('⚙️ Direct export parameters:', exportParams);

      // Step 2: Get data based on type
      const data = await this.dataService.getDataByType(exportParams.type, exportParams);
      
      console.log('📈 Data retrieved, records:', Array.isArray(data) ? data.length : 1);

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
      best_seller: 'Báo cáo hàng bán chạy',
      refund: 'Báo cáo hàng bị refund nhiều',
      refund_reason: 'Báo cáo lý do refund',
      revenue: 'Báo cáo doanh số chung',
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
          name: item.name || item.product_name || `Sản phẩm ${index + 1}`,
          value: item.sold || item.total_sold || item.count || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Top sản phẩm bán chạy',
          data: bestSellerData
        });
        break;

      case 'refund':
        // Horizontal bar chart for high refund products
        const refundData = data.slice(0, 10).map((item: any, index: number) => ({
          name: item.item_name || `Sản phẩm ${index + 1}`,
          value: item.refund_rate || item.refund_percentage || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Sản phẩm có tỷ lệ refund cao',
          data: refundData
        });
        break;

      case 'refund_reason':
        // Pie chart for refund reasons
        const refundReasons = [
          { name: 'Sản phẩm lỗi', value: 35 },
          { name: 'Không đúng mô tả', value: 25 },
          { name: 'Giao hàng chậm', value: 20 },
          { name: 'Thay đổi ý định', value: 15 },
          { name: 'Khác', value: 5 }
        ];
        charts.push({
          type: 'pie',
          title: 'Phân bố lý do refund',
          data: refundReasons
        });
        break;

      case 'revenue':
        // Bar chart for revenue
        const revenueData = data.slice(0, 10).map((item: any, index: number) => ({
          name: item.name || item.product_name || `Sản phẩm ${index + 1}`,
          value: item.total_revenue || item.revenue || item.sales || 0
        }));
        charts.push({
          type: 'bar',
          title: 'Doanh số theo sản phẩm',
          data: revenueData
        });

        // Pie chart for revenue distribution by category
        if (data.length > 1) {
          const categories = data.reduce((acc: any, item: any) => {
            const category = item.category || item.brand || 'Khác';
            acc[category] = (acc[category] || 0) + (item.total_revenue || item.revenue || 0);
            return acc;
          }, {});

          const pieData = Object.entries(categories).map(([name, value]) => ({
            name,
            value: value as number
          }));

          charts.push({
            type: 'pie',
            title: 'Phân bố doanh số theo danh mục',
            data: pieData
          });
        }
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