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

    // Add professional footer
    this.addFooter(doc);

    doc.end();
  }

  // Add charts from ExportService result
  private async addChartsFromExportResult(doc: any, charts: any[]): Promise<void> {
    let y = doc.y + 30;

    for (const chart of charts) {
      if (y > 700) { // Check if we need a new page
        doc.addPage();
        y = 50;
      }

      // Add section background
      doc.rect(30, y - 10, 535, 50)
         .fill('#f8f9fa')
         .strokeColor('#e9ecef')
         .lineWidth(1)
         .stroke();

      // Add chart title with professional styling
      doc.fontSize(16)
         .font(this.FONT_BOLD)
         .fill('#2c3e50')
         .text(chart.title, 50, y)
         .moveDown(0.5);

      y += 40;

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
          case 'horizontal_bar':
            chartBuffer = await ChartGenerator.getHorizontalBarChartBuffer(labels, values, chart.title);
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

        // Center the chart and make it larger with professional styling
        const chartWidth = 450;
        const pageWidth = 595; // A4 width in points
        const chartX = (pageWidth - chartWidth) / 2;
        
        // Add chart container with shadow effect
        doc.rect(chartX - 10, y - 10, chartWidth + 20, 280)
           .fill('#ffffff')
           .strokeColor('#e9ecef')
           .lineWidth(1)
           .stroke();
        
        doc.image(chartBuffer, chartX, y, { width: chartWidth });
        y += 300;
        doc.moveDown(2);
        
        // Reset fill color
        doc.fill('#000000');
      } catch (error) {
        console.error('Error generating chart:', error);
        // Add fallback text with professional styling
        doc.fontSize(12)
           .font(this.FONT_NORMAL)
           .fill('#e74c3c')
           .text(`⚠️ Không thể tạo biểu đồ: ${chart.title}`, 50, y)
           .moveDown(1);
        y += 50;
        doc.fill('#000000');
      }
    }
  }





  // Add title to PDF with professional styling
  private addTitle(doc: any, title: string, period: string): void {
    // Add a subtle background rectangle for the header
    doc.rect(0, 0, 595, 120)
       .fill('#f8f9fa');
    
    // Main title with larger font and better spacing
    doc.font(this.FONT_BOLD)
       .fontSize(24)
       .fill('#2c3e50')
       .text(title, 50, 40);
    
    // Add a decorative line under the title
    doc.moveTo(50, 75)
       .lineTo(545, 75)
       .strokeColor('#3498db')
       .lineWidth(2)
       .stroke();
    
    // Metadata with better styling
    doc.font(this.FONT_NORMAL)
       .fontSize(12)
       .fill('#7f8c8d')
       .text(`Kỳ báo cáo: ${period}`, 50, 90)
       .text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, 50, 105);
    
    // Reset fill color
    doc.fill('#000000');
  }

  // Add professional footer
  private addFooter(doc: any): void {
    const pageCount = doc.bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      const pageHeight = doc.page.height;
      
      // Add footer background
      doc.rect(0, pageHeight - 60, 595, 60)
         .fill('#f8f9fa');
      
      // Add footer line
      doc.moveTo(50, pageHeight - 60)
         .lineTo(545, pageHeight - 60)
         .strokeColor('#3498db')
         .lineWidth(1)
         .stroke();
      // // Reset fill color
      doc.fill('#000000');
    }
  }
}
