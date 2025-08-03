// services/PDFService.ts
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import path from 'path';
import { ChartGenerator } from '../utils/chartGeneratorLocal';
import { ExportResult as ExportServiceResult } from '../types/export';

export interface InventoryItem {
  sku: string;
  name: string;
  sold: number;
  stock: number;
  refundRate: number;
}

// Export types for PDF only
export type ExportType = 'all' | 'best_seller' | 'refund' | 'top_reason_refund' | 'slow_moving';

export interface ExportParams {
  type?: ExportType;
  period?: string;
  limit?: number;
  language?: 'vi' | 'en';
}

export interface ExportResult {
  type: ExportType;
  period: string;
  items: InventoryItem[];
  summary: {
    totalItems: number;
    totalSold: number;
    totalStock: number;
    averageRefundRate: number;
  };
  generated_at: string;
}

export class PDFService {
  private readonly FONT_NORMAL = path.resolve(__dirname, '../fonts/Roboto-Regular.ttf');
  private readonly FONT_BOLD = path.resolve(__dirname, '../fonts/Roboto-Bold.ttf');

  // Main export method for PDF only
  public async exportReport(items: InventoryItem[], params: ExportParams): Promise<ExportResult> {
    const { type = 'all', period = 'Tháng hiện tại', limit = 10 } = params;
    
    let processedItems = this.processItemsByType(items, type, limit);
    
    const summary = this.calculateSummary(processedItems);
    
    return {
      type,
      period,
      items: processedItems,
      summary,
      generated_at: new Date().toISOString()
    };
  }

  // New method to generate PDF from ExportService result
  public async generatePDFFromExportResult(exportResult: ExportServiceResult, res: Response): Promise<void> {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${exportResult.metadata.export_type}-${Date.now()}.pdf"`);

    doc.pipe(res);

    // Add title
    this.addTitle(doc, exportResult.title, exportResult.period);

    // Add subtitle if exists
    if (exportResult.subtitle) {
      doc.fontSize(12)
         .font(this.FONT_NORMAL)
         .text(exportResult.subtitle, 50, doc.y + 10)
         .moveDown(1);
    }

    // Add charts if available
    if (exportResult.charts && exportResult.charts.length > 0) {
      await this.addChartsFromExportResult(doc, exportResult.charts);
    }

    // Add summary if available - REMOVED
    // if (exportResult.summary) {
    //   this.addSummaryFromExportResult(doc, exportResult.summary);
    // }

    // Add metadata
    // this.addMetadataFromExportResult(doc, exportResult.metadata);

    doc.end();
  }

  // Add charts from ExportService result
  private async addChartsFromExportResult(doc: any, charts: any[]): Promise<void> {
    let y = doc.y + 20;

    for (const chart of charts) {
      if (y > 700) { // Check if we need a new page
        doc.addPage();
        y = 50;
      }

      // Add chart title
      doc.fontSize(14)
         .font(this.FONT_BOLD)
         .text(chart.title, 50, y)
         .moveDown(0.5);

      y += 30;

      // Generate chart image based on type
      try {
        let chartBuffer;
        const labels = chart.data.map((item: any) => item.name || item.label || 'Unknown').slice(0, 10);
        const values = chart.data.map((item: any) => item.value || item.count || 0).slice(0, 10);

        switch (chart.type) {
          case 'bar':
            chartBuffer = await ChartGenerator.getBarChartBuffer(labels, values, chart.title);
            break;
          case 'line':
            chartBuffer = await ChartGenerator.getLineChartBuffer(labels, values, chart.title);
            break;
          case 'pie':
            chartBuffer = await ChartGenerator.getPieChartBuffer(labels, values, chart.title);
            break;
          case 'doughnut':
            chartBuffer = await ChartGenerator.getPieChartBuffer(labels, values, chart.title);
            break;
          default:
            chartBuffer = await ChartGenerator.getBarChartBuffer(labels, values, chart.title);
        }

        doc.image(chartBuffer, 50, y, { width: 250 });
        y += 200;
        doc.moveDown(2);
      } catch (error) {
        console.error('Error generating chart:', error);
        // Add fallback text
        doc.fontSize(12)
           .font(this.FONT_NORMAL)
           .text(`Không thể tạo biểu đồ: ${chart.title}`, 50, y)
           .moveDown(1);
        y += 50;
      }
    }
  }

  // Process items based on export type
  private processItemsByType(items: InventoryItem[], type: ExportType, limit: number): InventoryItem[] {
    switch (type) {
      case 'best_seller':
        return this.getBestSellers(items, limit);
      case 'refund':
        return this.getHighRefundItems(items, limit);
      case 'slow_moving':
        return this.getSlowMovingItems(items, limit);
      case 'top_reason_refund':
        return this.getTopRefundReasonItems(items, limit);
      default:
        return items.slice(0, limit);
    }
  }

  // Get best selling products
  private getBestSellers(items: InventoryItem[], limit: number): InventoryItem[] {
    return [...items]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, limit);
  }

  // Get high refund rate products
  private getHighRefundItems(items: InventoryItem[], limit: number): InventoryItem[] {
    return [...items]
      .sort((a, b) => b.refundRate - a.refundRate)
      .slice(0, limit);
  }

  // Get slow moving inventory
  private getSlowMovingItems(items: InventoryItem[], limit: number): InventoryItem[] {
    return [...items]
      .sort((a, b) => a.sold - b.sold)
      .slice(0, limit);
  }

  // Get top refund reason items (mock data)
  private getTopRefundReasonItems(items: InventoryItem[], limit: number): InventoryItem[] {
    return [...items]
      .sort((a, b) => b.refundRate - a.refundRate)
      .slice(0, limit);
  }

  // Calculate summary statistics
  private calculateSummary(items: InventoryItem[]) {
    const totalSold = items.reduce((sum, item) => sum + item.sold, 0);
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
    const averageRefundRate = items.reduce((sum, item) => sum + item.refundRate, 0) / items.length;

    return {
      totalItems: items.length,
      totalSold,
      totalStock,
      averageRefundRate: Math.round(averageRefundRate * 100) / 100
    };
  }

  // Generate PDF with charts
  public async generatePDFWithCharts(exportResult: ExportResult, res: Response): Promise<void> {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${exportResult.type}-${Date.now()}.pdf"`);

    doc.pipe(res);

    // Add title
    this.addTitle(doc, this.getTitleForType(exportResult.type), exportResult.period);

    // Add charts based on type
    await this.addChartsForType(doc, exportResult);

    // Add summary - REMOVED
    // this.addSummaryForExport(doc, exportResult.summary);

    // Add insights
    this.addInsightForExport(doc, exportResult);

    doc.end();
  }

  // Get title for export type
  private getTitleForType(type: ExportType): string {
    switch (type) {
      case 'best_seller':
        return 'Báo cáo sản phẩm bán chạy';
      case 'refund':
        return 'Báo cáo phân tích hoàn trả';
      case 'slow_moving':
        return 'Báo cáo hàng ế chậm luân chuyển';
      case 'top_reason_refund':
        return 'Báo cáo lý do hoàn trả hàng đầu';
      default:
        return 'Báo cáo tổng hợp';
    }
  }

  // Add charts based on export type
  private async addChartsForType(doc: any, exportResult: ExportResult): Promise<void> {
    const { type, items } = exportResult;
    let y = 150;

    switch (type) {
      case 'best_seller':
        await this.addBestSellerCharts(doc, items, y);
        break;
      case 'refund':
        await this.addRefundCharts(doc, items, y);
        break;
      case 'slow_moving':
        await this.addSlowMovingCharts(doc, items, y);
        break;
      case 'top_reason_refund':
        await this.addRefundReasonCharts(doc, y);
        break;
      default:
        await this.addAllCharts(doc, items, y);
        break;
    }
  }

  // Add best seller charts
  private async addBestSellerCharts(doc: any, items: InventoryItem[], y: number): Promise<void> {
    // Sales chart
    const labels = items.map(item => item.name.substring(0, 20) + '...');
    const data = items.map(item => item.sold);
    
    const salesChart = await ChartGenerator.getBarChartBuffer(
      labels,
      data,
      'Top sản phẩm bán chạy'
    );
    
    doc.image(salesChart, 50, y, { width: 250 });
    doc.moveDown(2);
  }

  // Add refund analysis charts
  private async addRefundCharts(doc: any, items: InventoryItem[], y: number): Promise<void> {
    // Refund rate chart
    const labels = items.map(item => item.name.substring(0, 20) + '...');
    const data = items.map(item => item.refundRate);
    
    const refundChart = await ChartGenerator.getHorizontalBarChartBuffer(
      labels,
      data,
      'Tỷ lệ hoàn trả theo sản phẩm'
    );
    
    doc.image(refundChart, 50, y, { width: 250 });
    doc.moveDown(2);
  }

  // Add refund reason charts (mock data)
  private async addRefundReasonCharts(doc: any, y: number): Promise<void> {
    const refundReasons = [
      { name: 'Sản phẩm lỗi', value: 35 },
      { name: 'Không đúng mô tả', value: 25 },
      { name: 'Giao hàng chậm', value: 20 },
      { name: 'Thay đổi ý định', value: 15 },
      { name: 'Khác', value: 5 }
    ];
    
    const labels = refundReasons.map(item => item.name);
    const data = refundReasons.map(item => item.value);
    
    const reasonChart = await ChartGenerator.getPieChartBuffer(
      labels,
      data,
      'Lý do hoàn trả hàng đầu'
    );
    
    doc.image(reasonChart, 50, y, { width: 250 });
    doc.moveDown(2);
  }

  // Add slow moving charts
  private async addSlowMovingCharts(doc: any, items: InventoryItem[], y: number): Promise<void> {
    // Stock vs Sales chart
    const labels = items.map(item => item.name.substring(0, 20) + '...');
    const data = items.map(item => item.stock);
    
    const stockSalesChart = await ChartGenerator.getBarChartBuffer(
      labels,
      data,
      'Hàng tồn kho chậm luân chuyển'
    );
    
    doc.image(stockSalesChart, 50, y, { width: 250 });
    doc.moveDown(2);
  }

  // Add all charts for comprehensive report
  private async addAllCharts(doc: any, items: InventoryItem[], y: number): Promise<void> {
    // Best sellers
    const bestSellers = items.slice(0, 5);
    const bestSellerLabels = bestSellers.map(item => item.name.substring(0, 15) + '...');
    const bestSellerData = bestSellers.map(item => item.sold);
    
    const salesChart = await ChartGenerator.getBarChartBuffer(
      bestSellerLabels,
      bestSellerData,
      'Top 5 sản phẩm bán chạy'
    );
    
    doc.image(salesChart, 50, y, { width: 250 });
    doc.moveDown(2);
    
    // Refund rates
    const highRefundItems = items.slice(0, 5);
    const refundLabels = highRefundItems.map(item => item.name.substring(0, 15) + '...');
    const refundData = highRefundItems.map(item => item.refundRate);
    
    const refundChart = await ChartGenerator.getHorizontalBarChartBuffer(
      refundLabels,
      refundData,
      'Top 5 sản phẩm có tỷ lệ hoàn trả cao'
    );
    
    doc.image(refundChart, 50, y + 200, { width: 250 });
    doc.moveDown(2);
  }

  // Add insights for export
  private addInsightForExport(doc: any, exportResult: ExportResult): void {
    doc.font(this.FONT_BOLD).fontSize(14).text('Phân tích và khuyến nghị', 50, doc.y + 30);
    doc.font(this.FONT_NORMAL).fontSize(12);
    
    const { type } = exportResult; // summary
    
    switch (type) {
      case 'best_seller':
        doc.text('• Tập trung vào các sản phẩm bán chạy để tối ưu hóa doanh thu', 50, doc.y + 10);
        doc.text('• Cân nhắc tăng cường marketing cho các sản phẩm này', 50, doc.y + 25);
        break;
      case 'refund':
        doc.text('• Cần cải thiện chất lượng sản phẩm có tỷ lệ hoàn trả cao', 50, doc.y + 10);
        doc.text('• Xem xét lại quy trình kiểm soát chất lượng', 50, doc.y + 25);
        break;
      case 'slow_moving':
        doc.text('• Cần có chiến lược giảm giá hoặc khuyến mãi cho hàng ế', 50, doc.y + 10);
        doc.text('• Xem xét ngừng nhập hàng các sản phẩm này', 50, doc.y + 25);
        break;
      case 'top_reason_refund':
        doc.text('• Cải thiện mô tả sản phẩm để tránh hiểu lầm', 50, doc.y + 10);
        doc.text('• Tối ưu hóa quy trình giao hàng', 50, doc.y + 25);
        break;
      default:
        doc.text('• Phân tích toàn diện cho thấy cần cải thiện nhiều mặt', 50, doc.y + 10);
        doc.text('• Ưu tiên xử lý các vấn đề về hoàn trả trước', 50, doc.y + 25);
        break;
    }
  }

  // Add title to PDF
  private addTitle(doc: any, title: string, period: string): void {
    doc.font(this.FONT_BOLD).fontSize(20).text(title, 50, 50);
    doc.font(this.FONT_NORMAL).fontSize(14).text(`Kỳ báo cáo: ${period}`, 50, 80);
    doc.font(this.FONT_NORMAL).fontSize(12).text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, 50, 100);
  }
}
