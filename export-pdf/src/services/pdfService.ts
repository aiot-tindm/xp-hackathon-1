// services/PDFService.ts
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import path from 'path';
import { ChartGenerator } from '../utils/chartGeneratorLocal';
import { ExportResult as ExportServiceResult } from '../types/export';



export class PDFService {
  private readonly FONT_NORMAL = path.resolve(__dirname, '../fonts/Roboto-Regular.ttf');
  private readonly FONT_BOLD = path.resolve(__dirname, '../fonts/Roboto-Bold.ttf');



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
        const labels = chart.data.map((item: any) => {
          const name = item.name || item.label || 'Unknown';
          // Keep full name if it's short, otherwise truncate more gracefully
          return name.length > 25 ? name.substring(0, 25) + '...' : name;
        }).slice(0, 10);
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

        // Center the chart and make it larger
        const chartWidth = 400;
        const pageWidth = 595; // A4 width in points
        const chartX = (pageWidth - chartWidth) / 2;
        
        doc.image(chartBuffer, chartX, y, { width: chartWidth });
        y += 250;
        doc.moveDown(3);
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





  // Add title to PDF
  private addTitle(doc: any, title: string, period: string): void {
    doc.font(this.FONT_BOLD).fontSize(20).text(title, 50, 50);
    doc.font(this.FONT_NORMAL).fontSize(14).text(`Kỳ báo cáo: ${period}`, 50, 80);
    doc.font(this.FONT_NORMAL).fontSize(12).text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, 50, 100);
  }
}
