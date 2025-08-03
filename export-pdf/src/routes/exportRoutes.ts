import { Router, Request, Response } from 'express';
import { ExportService } from '../services/exportService';
import { ExportResponse } from '../types/export';

const router = Router();
const exportService = new ExportService();

/**
 * @swagger
 * /api/export/direct:
 *   post:
 *     summary: Xuất báo cáo PDF với biểu đồ trực tiếp với tham số cụ thể
 *     description: Xuất báo cáo PDF với biểu đồ bằng cách chỉ định trực tiếp các tham số mà không cần phân tích câu hỏi
 *     tags: [Export]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DirectExportRequest'
 *           examples:
 *             revenue_export:
 *               summary: Xuất báo cáo doanh số tháng 7 với biểu đồ
 *               value:
 *                 type: "revenue"
 *                 month: "07"
 *                 year: 2025
 *                 platform: "Shopee"
 *                 include_refund: true
 *                 format: "pdf"
 *                 language: "vi"
 *             best_seller:
 *               summary: Xuất sản phẩm bán chạy tháng 6 với biểu đồ
 *               value:
 *                 type: "best_seller"
 *                 month: "06"
 *                 year: 2025
 *                 limit: 10
 *                 format: "pdf"
 *                 language: "vi"
 *             refund_analysis:
 *               summary: Phân tích hoàn hàng quý 2 với biểu đồ
 *               value:
 *                 type: "refund"
 *                 quarter: "Q2"
 *                 year: 2025
 *                 format: "pdf"
 *                 language: "vi"
 *             refund_reason:
 *               summary: Phân tích lý do refund với biểu đồ
 *               value:
 *                 type: "refund_reason"
 *                 month: "08"
 *                 year: 2025
 *                 platform: "Lazada"
 *                 format: "pdf"
 *                 language: "vi"
 *             slow_moving:
 *               summary: Phân tích hàng ế chậm luân chuyển với biểu đồ
 *               value:
 *                 type: "slow_moving"
 *                 month: "07"
 *                 year: 2025
 *                 limit: 15
 *                 format: "pdf"
 *                 language: "vi"
 *             all_charts:
 *               summary: Báo cáo tổng hợp tất cả biểu đồ
 *               value:
 *                 type: "all"
 *                 month: "08"
 *                 year: 2025
 *                 platform: "Shopee"
 *                 include_refund: true
 *                 limit: 20
 *                 format: "pdf"
 *                 language: "vi"
 *     responses:
 *       200:
 *         description: Xuất báo cáo PDF với biểu đồ thành công
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExportResponse'
 *             examples:
 *               best_seller_success:
 *                 summary: Báo cáo hàng bán chạy thành công
 *                 value:
 *                   success: true
 *                   message: "Xuất báo cáo PDF với biểu đồ thành công"
 *                   data:
 *                     title: "Báo cáo hàng bán chạy"
 *                     subtitle: "Nền tảng: Shopee"
 *                     period: "Tháng 06/2025"
 *                     total_records: 10
 *                     export_type: "best_seller"
 *                     charts: [
 *                       {
 *                         type: "bar",
 *                         title: "Top sản phẩm bán chạy",
 *                         data: []
 *                       }
 *                     ]
 *                   processing_time: 1500
 *                   status: "success"
 *               refund_success:
 *                 summary: Báo cáo refund thành công
 *                 value:
 *                   success: true
 *                   message: "Xuất báo cáo PDF với biểu đồ thành công"
 *                   data:
 *                     title: "Báo cáo hàng bị refund nhiều"
 *                     subtitle: "Quý 2 năm 2025"
 *                     period: "Quý 2 năm 2025"
 *                     total_records: 8
 *                     export_type: "refund"
 *                     charts: [
 *                       {
 *                         type: "line",
 *                         title: "Tỷ lệ refund theo sản phẩm",
 *                         data: []
 *                       }
 *                     ]
 *                   processing_time: 1200
 *                   status: "success"
 *               all_charts_success:
 *                 summary: Báo cáo tổng hợp thành công
 *                 value:
 *                   success: true
 *                   message: "Xuất báo cáo PDF với biểu đồ thành công"
 *                   data:
 *                     title: "Báo cáo tổng hợp tất cả biểu đồ"
 *                     subtitle: "Nền tảng: Shopee | Bao gồm dữ liệu hoàn hàng"
 *                     period: "Tháng 08/2025"
 *                     total_records: 20
 *                     export_type: "all"
 *                     charts: [
 *                       {
 *                         type: "bar",
 *                         title: "Top 5 sản phẩm bán chạy",
 *                         data: []
 *                       },
 *                       {
 *                         type: "line",
 *                         title: "Tỷ lệ refund theo sản phẩm",
 *                         data: []
 *                       },
 *                       {
 *                         type: "pie",
 *                         title: "Phân bố lý do refund",
 *                         data: []
 *                       }
 *                     ]
 *                   processing_time: 2500
 *                   status: "success"
 *       400:
 *         description: Tham số không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/direct', async (req: Request, res: Response) => {
  try {
    const { 
      type, 
      platform, 
      month, 
      year, 
      quarter, 
      include_refund, 
      limit = 10,
      format = 'pdf', 
      language = 'vi' 
    } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Loại export (type) không được để trống',
        status: 'error'
      });
    }

    console.log('📝 Received direct export request:', { 
      type, platform, month, year, quarter, include_refund, limit, format, language 
    });

    const result = await exportService.exportDataDirect({
      type,
      platform,
      month,
      year,
      quarter,
      include_refund,
      limit,
      format,
      language
    }, res);

    // If result is void, it means PDF was sent directly
    if (result === undefined) {
      return;
    }

    // Otherwise, return JSON response
    if (typeof result === 'object' && result !== null) {
      const exportResponse = result as ExportResponse;
      if (exportResponse.success) {
        return res.json({
          success: true,
          message: 'Xuất báo cáo PDF với biểu đồ thành công',
          data: exportResponse.data,
          file_url: exportResponse.file_url,
          processing_time: exportResponse.processing_time,
          status: 'success'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: exportResponse.error,
          processing_time: exportResponse.processing_time,
          status: 'error'
        });
      }
    }

    // Fallback return for unexpected cases
    return res.status(500).json({
      success: false,
      error: 'Unexpected response format',
      status: 'error'
    });

  } catch (error) {
    console.error('❌ Error in direct export route:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi server',
      status: 'error'
    });
  }
});

/**
 * @swagger
 * /api/export/health:
 *   get:
 *     summary: Kiểm tra trạng thái dịch vụ
 *     description: Kiểm tra sức khỏe của export PDF service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Dịch vụ hoạt động bình thường
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             examples:
 *               healthy:
 *                 summary: Dịch vụ khỏe mạnh
 *                 value:
 *                   success: true
 *                   status: "healthy"
 *                   timestamp: "2025-08-03T03:19:32.030Z"
 *       500:
 *         description: Dịch vụ có vấn đề
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

export default router; 