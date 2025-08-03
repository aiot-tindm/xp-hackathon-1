// Export service types

/**
 * @swagger
 * components:
 *   schemas:
 *     ExportType:
 *       type: string
 *       enum: [best_seller, refund, refund_reason, revenue, slow_moving, all]
 *       description: Các loại export được hỗ trợ
 */
export type ExportType = 
  | 'best_seller'      // 1. Hàng bán chạy
  | 'refund'           // 2. Hàng bị refund nhiều
  | 'refund_reason'    // 3. Lý do refund
  | 'revenue'          // 4. Doanh số chung
  | 'slow_moving'      // 5. Hàng ế
  | 'all';             // Default: Tất cả biểu đồ

/**
 * @swagger
 * components:
 *   schemas:
 *     ExportRequest:
 *       type: object
 *       required: [query]
 *       properties:
 *         query:
 *           type: string
 *           description: Câu hỏi tiếng Việt từ người dùng
 *           example: "export cho tôi dữ liệu doanh thu t7, phần refund"
 *         format:
 *           type: string
 *           enum: [pdf, excel, csv]
 *           default: pdf
 *           description: Định dạng file xuất
 *         language:
 *           type: string
 *           enum: [vi, en]
 *           default: vi
 *           description: Ngôn ngữ của báo cáo
 */
export interface ExportRequest {
  query: string;
  format?: 'pdf' | 'excel' | 'csv';
  language?: 'vi' | 'en';
}

/**
 * @swagger
 * components:
 *   schemas:
 *     DirectExportRequest:
 *       type: object
 *       required: [type]
 *       properties:
 *         type:
 *           $ref: '#/components/schemas/ExportType'
 *         platform:
 *           type: string
 *           description: Nền tảng (shopee, ebay, website, etc.)
 *         month:
 *           type: string
 *           description: Tháng (01-12)
 *         year:
 *           type: integer
 *           description: Năm
 *         quarter:
 *           type: string
 *           enum: [Q1, Q2, Q3, Q4]
 *           description: Quý
 *         include_refund:
 *           type: boolean
 *           description: Bao gồm dữ liệu hoàn hàng
 *         limit:
 *           type: integer
 *           default: 10
 *           description: Số lượng bản ghi tối đa
 *         format:
 *           type: string
 *           enum: [pdf, excel, csv]
 *           default: pdf
 *           description: Định dạng file xuất
 *         language:
 *           type: string
 *           enum: [vi, en]
 *           default: vi
 *           description: Ngôn ngữ của báo cáo
 */
export interface DirectExportRequest {
  type: ExportType;
  platform?: string;
  month?: string;
  year?: number;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  include_refund?: boolean;
  limit?: number;
  format?: 'pdf' | 'excel' | 'csv';
  language?: 'vi' | 'en';
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ExportResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Trạng thái xử lý
 *         data:
 *           type: object
 *           description: Dữ liệu kết quả
 *         file_url:
 *           type: string
 *           description: URL file đã xuất
 *         error:
 *           type: string
 *           description: Thông báo lỗi nếu có
 *         processing_time:
 *           type: number
 *           description: Thời gian xử lý (ms)
 */
export interface ExportResponse {
  success: boolean;
  data?: any;
  file_url?: string;
  error?: string;
  processing_time: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ExportParams:
 *       type: object
 *       properties:
 *         type:
 *           $ref: '#/components/schemas/ExportType'
 *         platform:
 *           type: string
 *         month:
 *           type: string
 *         year:
 *           type: integer
 *         quarter:
 *           type: string
 *         include_refund:
 *           type: boolean
 *         limit:
 *           type: integer
 *         language:
 *           type: string
 *           enum: [vi, en]
 *         format:
 *           type: string
 *           enum: [pdf, excel, csv]
 */
export interface ExportParams {
  type: ExportType;
  platform?: string;
  month?: string;
  year?: number;
  quarter?: string;
  include_refund?: boolean;
  limit?: number;
  language: 'vi' | 'en';
  format: 'pdf' | 'excel' | 'csv';
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ExportResult:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Tiêu đề báo cáo
 *         subtitle:
 *           type: string
 *           description: Phụ đề báo cáo
 *         period:
 *           type: string
 *           description: Thời gian báo cáo
 *         data:
 *           type: array
 *           description: Dữ liệu báo cáo
 *         summary:
 *           type: object
 *           description: Tóm tắt báo cáo
 *         charts:
 *           type: array
 *           description: Biểu đồ
 *         metadata:
 *           type: object
 *           properties:
 *             generated_at:
 *               type: string
 *               format: date-time
 *             total_records:
 *               type: integer
 *             export_type:
 *               $ref: '#/components/schemas/ExportType'
 *             filters:
 *               type: object
 */
export interface ExportResult {
  title: string;
  subtitle?: string;
  period: string;
  data: any[];
  summary?: any;
  charts?: any[];
  metadata: {
    generated_at: Date;
    total_records: number;
    export_type: ExportType;
    filters?: any;
  };
} 