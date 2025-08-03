# Cấu hình Database cho Export PDF Service

## Yêu cầu

- MySQL 8.0 hoặc cao hơn
- Node.js 18+ 
- npm hoặc yarn

## Cài đặt Database

### 1. Tạo Database

```sql
CREATE DATABASE `inventory-sale-ai` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

### 2. Import dữ liệu

Sử dụng file `inventory-sale-ai.sql` để import dữ liệu:

```bash
mysql -u root -p inventory-sale-ai < inventory-sale-ai.sql
```

### 3. Cấu hình Environment Variables

Tạo file `.env` từ `env.example`:

```bash
cp env.example .env
```

Cập nhật các thông số kết nối trong file `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=inventory-sale-ai
DB_CHARSET=utf8mb4

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Cấu trúc Bảng Refund Analysis

Bảng `refund_analysis` chứa dữ liệu phân tích refund với các trường:

- `analysis_date`: Ngày phân tích
- `data_range`: Khoảng thời gian dữ liệu (1_day_ago, 7_days_ago, 1_month_ago, 3_months_ago, 6_months_ago, 1_year_ago, all_time)
- `sort_type`: Loại sắp xếp (refund_count, refund_rate, refund_quantity, refund_reason)
- `sku`: Mã sản phẩm
- `item_name`: Tên sản phẩm
- `total_orders`: Tổng số đơn hàng
- `refund_orders`: Số đơn hàng bị refund
- `refund_rate`: Tỷ lệ refund (%)
- `refund_reason`: Lý do refund
- `refund_quantity`: Số lượng sản phẩm bị refund
- `rank_position`: Vị trí xếp hạng

## Chạy ứng dụng

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Chạy server

```bash
npm start
```

Hoặc chạy ở chế độ development:

```bash
npm run dev
```

### 4. Test kết nối

Truy cập: `http://localhost:3000/api/health`

## API Endpoints

### Export PDF với dữ liệu Refund

```bash
POST /api/export/direct
Content-Type: application/json

{
  "type": "refund",
  "params": {
    "month": "12",
    "year": 2024
  }
}
```

### Các loại export khác

- `refund`: Dữ liệu refund analysis
- `refund_reason`: Lý do refund
- `best_seller`: Sản phẩm bán chạy
- `revenue`: Doanh thu
- `slow_moving`: Sản phẩm ế
- `all`: Tất cả biểu đồ

## Troubleshooting

### Lỗi kết nối database

1. Kiểm tra MySQL service đang chạy
2. Kiểm tra thông tin kết nối trong file `.env`
3. Kiểm tra quyền truy cập database

### Lỗi import dữ liệu

1. Đảm bảo database đã được tạo
2. Kiểm tra encoding UTF-8
3. Kiểm tra quyền import file SQL

## Cấu trúc Project

```
export-pdf/
├── src/
│   ├── config/
│   │   ├── database.ts      # Cấu hình kết nối database
│   │   └── swagger.ts       # Cấu hình API documentation
│   ├── services/
│   │   ├── dataService.ts   # Service query dữ liệu từ database
│   │   └── pdfService.ts    # Service tạo PDF
│   ├── types/
│   │   └── database.ts      # Type definitions
│   └── index.ts             # Entry point
├── inventory-sale-ai.sql    # File dữ liệu database
├── env.example              # Template environment variables
└── package.json
``` 