# Analytics API Documentation

## Tổng quan
API server cung cấp các endpoint để lấy dữ liệu phân tích từ database.

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
pip install flask flask-cors sqlalchemy pymysql python-dotenv
```

### 2. Cấu hình database
Tạo file `.env` với thông tin database:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=inventory-sale-ai
DB_PORT=3306
```

### 3. Chạy API server
```bash
python api.py
```

Server sẽ chạy tại: http://localhost:5000

## API Endpoints

### 1. Home
- **URL**: `/`
- **Method**: GET
- **Mô tả**: Trang chủ API với danh sách endpoints

### 2. Daily Sales Summary
- **URL**: `/api/daily-sales`
- **Method**: GET
- **Mô tả**: Lấy dữ liệu doanh số hàng ngày mới nhất

### 3. Daily Sales by Date
- **URL**: `/api/daily-sales/<date>`
- **Method**: GET
- **Parameters**: 
  - `date`: Ngày (YYYY-MM-DD)
- **Mô tả**: Lấy dữ liệu doanh số theo ngày cụ thể

### 4. Top Selling Items
- **URL**: `/api/top-selling-items`
- **Method**: GET
- **Parameters**:
  - `period`: Khoảng thời gian (default: all_time)
  - `sort_type`: Loại sắp xếp (revenue, profit, quantity)
  - `limit`: Số lượng kết quả (default: 10)
  - `date`: Ngày phân tích (YYYY-MM-DD)
- **Mô tả**: Lấy danh sách sản phẩm bán chạy nhất

### 5. Category Summary
- **URL**: `/api/category-summary`
- **Method**: GET
- **Parameters**:
  - `period`: Khoảng thời gian (default: all_time)
  - `sort_type`: Loại sắp xếp (revenue, quantity)
  - `date`: Ngày phân tích (YYYY-MM-DD)
- **Mô tả**: Lấy dữ liệu phân tích theo danh mục

### 6. Brand Summary
- **URL**: `/api/brand-summary`
- **Method**: GET
- **Parameters**:
  - `period`: Khoảng thời gian (default: all_time)
  - `sort_type`: Loại sắp xếp (revenue, quantity)
  - `date`: Ngày phân tích (YYYY-MM-DD)
- **Mô tả**: Lấy dữ liệu phân tích theo thương hiệu

### 7. Refund Analysis
- **URL**: `/api/refund-analysis`
- **Method**: GET
- **Parameters**:
  - `period`: Khoảng thời gian (default: all_time)
  - `sort_type`: Loại sắp xếp (refund_count, refund_rate, refund_quantity, refund_reason)
  - `date`: Ngày phân tích (YYYY-MM-DD)
- **Mô tả**: Lấy dữ liệu phân tích hoàn tiền

### 8. Low Stock Alerts
- **URL**: `/api/low-stock-alerts`
- **Method**: GET
- **Parameters**:
  - `date`: Ngày phân tích (YYYY-MM-DD)
- **Mô tả**: Lấy cảnh báo tồn kho thấp

### 9. Summary Overview
- **URL**: `/api/summary/overview`
- **Method**: GET
- **Parameters**:
  - `date`: Ngày phân tích (YYYY-MM-DD)
- **Mô tả**: Lấy tổng quan dữ liệu summary

### 10. Available Periods
- **URL**: `/api/summary/periods`
- **Method**: GET
- **Mô tả**: Lấy danh sách các khoảng thời gian có sẵn

### 11. Available Dates
- **URL**: `/api/summary/dates`
- **Method**: GET
- **Mô tả**: Lấy danh sách các ngày phân tích có sẵn

## Khoảng thời gian (Periods)
- `1_day_ago`: 1 ngày trước
- `7_days_ago`: 7 ngày trước
- `1_month_ago`: 1 tháng trước
- `3_months_ago`: 3 tháng trước
- `6_months_ago`: 6 tháng trước
- `1_year_ago`: 1 năm trước
- `all_time`: Tất cả thời gian

## Loại sắp xếp (Sort Types)
- `revenue`: Theo doanh thu
- `profit`: Theo lợi nhuận
- `quantity`: Theo số lượng
- `refund_count`: Theo số lượng hoàn tiền
- `refund_rate`: Theo tỉ lệ hoàn tiền
- `refund_quantity`: Theo số lượng sản phẩm hoàn tiền
- `refund_reason`: Theo lý do hoàn tiền

## Ví dụ sử dụng

### Lấy top 5 sản phẩm bán chạy theo doanh thu
```bash
curl "http://localhost:5000/api/top-selling-items?period=all_time&sort_type=revenue&limit=5"
```

### Lấy dữ liệu brand summary theo số lượng
```bash
curl "http://localhost:5000/api/brand-summary?period=1_month_ago&sort_type=quantity"
```

### Lấy tổng quan dữ liệu
```bash
curl "http://localhost:5000/api/summary/overview"
```

## Test API
Chạy file test để kiểm tra tất cả endpoints:
```bash
python test_api.py
```

## Lưu ý
- Đảm bảo database đã được tạo và có dữ liệu
- Chạy analytics engine trước để tạo dữ liệu summary
- API trả về JSON format với cấu trúc `{success: boolean, data: array/object, message: string}` 