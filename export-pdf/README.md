# Export PDF Service

Dịch vụ xuất báo cáo PDF với biểu đồ từ dữ liệu thương mại điện tử. Hỗ trợ xuất các loại báo cáo khác nhau như hàng bán chạy, refund, doanh thu, hàng ế và tổng hợp.

## 🚀 Cách chạy

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Build dự án
```bash
npm run build
```

### Chạy trong môi trường development
```bash
npm run dev
```

### Chạy trong môi trường production
```bash
npm start
```

### Chạy với watch mode (tự động restart khi có thay đổi)
```bash
npm run watch
```

## 📊 Các loại Export được hỗ trợ

| Loại | Mô tả | Tham số bắt buộc |
|------|-------|------------------|
| `best_seller` | Hàng bán chạy | `type` |
| `refund` | Hàng bị refund nhiều | `type` |
| `refund_reason` | Lý do refund | `type` |
| `revenue` | Doanh số chung | `type` |
| `slow_moving` | Hàng ế | `type` |
| `all` | Tất cả biểu đồ (mặc định) | `type` |

## 🔌 API Endpoints

### 1. Xuất báo cáo trực tiếp
**POST** `/api/export/direct`

Xuất báo cáo PDF với biểu đồ bằng cách chỉ định trực tiếp các tham số.

#### Request Body
```json
{
  "type": "best_seller",
  "platform": "Shopee",
  "month": "07",
  "year": 2025,
  "include_refund": true,
  "limit": 10,
  "format": "pdf",
  "language": "vi"
}
```

#### Tham số
| Tham số | Loại | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `type` | string | ✅ | Loại export (xem bảng trên) |
| `platform` | string | ❌ | Nền tảng (Shopee, Lazada, etc.) |
| `month` | string | ❌ | Tháng (01-12) |
| `year` | number | ❌ | Năm |
| `quarter` | string | ❌ | Quý (Q1, Q2, Q3, Q4) |
| `include_refund` | boolean | ❌ | Bao gồm dữ liệu hoàn hàng |
| `limit` | number | ❌ | Số lượng bản ghi tối đa (mặc định: 10) |
| `format` | string | ❌ | Định dạng file (pdf, excel, csv) |
| `language` | string | ❌ | Ngôn ngữ (vi, en) |

#### Response
- **Success (200)**: File PDF được trả về trực tiếp
- **Error (400)**: Tham số không hợp lệ
- **Error (500)**: Lỗi server

### 2. Kiểm tra sức khỏe dịch vụ
**GET** `/api/export/health`

Kiểm tra trạng thái hoạt động của dịch vụ.

#### Response
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-08-03T03:19:32.030Z"
}
```

### 3. Kiểm tra CORS
**GET** `/api/test-cors`

Kiểm tra cấu hình CORS.

#### Response
```json
{
  "message": "CORS test successful",
  "timestamp": "2025-08-03T03:19:32.030Z",
  "status": "success"
}
```

### 4. Health check tổng quát
**GET** `/api/health`

Kiểm tra sức khỏe tổng quát của server.

#### Response
```json
{
  "status": "healthy",
  "uptime": 1234.567,
  "timestamp": "2025-08-03T03:19:32.030Z"
}
```

## 📝 Ví dụ sử dụng

### 1. Xuất báo cáo hàng bán chạy
```bash
curl -X POST http://localhost:3000/api/export/direct \
  -H "Content-Type: application/json" \
  -d '{
    "type": "best_seller",
    "platform": "Shopee",
    "month": "07",
    "year": 2025,
    "limit": 15,
    "format": "pdf",
    "language": "vi"
  }'
```

### 2. Xuất báo cáo refund theo quý
```bash
curl -X POST http://localhost:3000/api/export/direct \
  -H "Content-Type: application/json" \
  -d '{
    "type": "refund",
    "quarter": "Q2",
    "year": 2025,
    "include_refund": true,
    "format": "pdf",
    "language": "vi"
  }'
```

### 3. Xuất báo cáo tổng hợp tất cả biểu đồ
```bash
curl -X POST http://localhost:3000/api/export/direct \
  -H "Content-Type: application/json" \
  -d '{
    "type": "all",
    "platform": "Lazada",
    "month": "08",
    "year": 2025,
    "include_refund": true,
    "limit": 20,
    "format": "pdf",
    "language": "vi"
  }'
```

## 🏗️ Cấu trúc dự án

```
export-pdf/
├── src/
│   ├── config/
│   │   └── swagger.ts          # Cấu hình Swagger API docs
│   ├── fonts/
│   │   ├── Roboto-Bold.ttf     # Font chữ đậm
│   │   └── Roboto-Regular.ttf  # Font chữ thường
│   ├── routes/
│   │   └── exportRoutes.ts     # Định nghĩa API routes
│   ├── services/
│   │   ├── dataService.ts      # Xử lý dữ liệu
│   │   ├── exportService.ts    # Logic xuất báo cáo
│   │   └── pdfService.ts       # Tạo file PDF
│   ├── types/
│   │   ├── database.ts         # Types cho database
│   │   └── export.ts           # Types cho export
│   ├── utils/
│   │   └── chartGeneratorLocal.ts # Tạo biểu đồ
│   └── index.ts                # Entry point
├── dist/                       # Build output
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Cấu hình

### Environment Variables
- `PORT`: Port server (mặc định: 3000)

### CORS Configuration
Dịch vụ được cấu hình để cho phép tất cả origins với credentials.

### Swagger Documentation
Truy cập API documentation tại: `http://localhost:3000/api-docs`

## 📊 Output Format

### PDF Output
- File PDF được tạo với biểu đồ Chart.js
- Bao gồm tiêu đề, phụ đề, thời gian báo cáo
- Biểu đồ được render bằng canvas
- Font Roboto được sử dụng cho tiếng Việt

### JSON Response (khi không xuất PDF)
```json
{
  "success": true,
  "message": "Xuất báo cáo PDF với biểu đồ thành công",
  "data": {
    "title": "Báo cáo hàng bán chạy",
    "subtitle": "Nền tảng: Shopee",
    "period": "Tháng 07/2025",
    "total_records": 15,
    "export_type": "best_seller",
    "charts": [
      {
        "type": "bar",
        "title": "Top sản phẩm bán chạy",
        "data": []
      }
    ]
  },
  "processing_time": 1500,
  "status": "success"
}
```

## 🚨 Xử lý lỗi

### Lỗi thường gặp
- **400**: Tham số không hợp lệ
- **500**: Lỗi server nội bộ
- **404**: Route không tồn tại

### Logs
Dịch vụ ghi log chi tiết cho:
- Request nhận được
- Thời gian xử lý
- Lỗi xảy ra
- Kết quả xuất

## 🧪 Testing

```bash
npm test
```

## 📦 Dependencies chính

- **express**: Web framework
- **pdfkit**: Tạo file PDF
- **chartjs-node-canvas**: Render biểu đồ
- **swagger-jsdoc**: API documentation
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers

## 🔄 Development

### Watch mode
```bash
npm run watch
```

### Build production
```bash
npm run build
npm start
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Logs trong console
2. API documentation tại `/api-docs`
3. Health check tại `/api/health` 