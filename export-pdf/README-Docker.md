# Hướng dẫn chạy Export PDF Service với Docker

## Build Docker image
```bash
docker build -t export-pdf-service .
```

## Chạy container (Không cần database)
```bash
docker run -d \
  --name export-pdf-service \
  -p 3000:3000 \
  export-pdf-service
```

## Chạy với database local
```bash
docker run -d \
  --name export-pdf-service \
  -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=root \
  -e DB_NAME=inventory-sale-ai \
  export-pdf-service
```

## Chạy với environment variables tùy chỉnh
```bash
docker run -d \
  --name export-pdf-service \
  -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_PORT=3306 \
  -e DB_USER=your-user \
  -e DB_PASSWORD=your-password \
  -e DB_NAME=your-database \
  export-pdf-service
```

## Kiểm tra service

### Health check
```bash
curl http://localhost:3000/api/health
```

### API Documentation
Mở trình duyệt và truy cập: http://localhost:3000/api-docs

### Test CORS
```bash
curl http://localhost:3000/api/test-cors
```

### Test Export PDF
```bash
# Export revenue chart
curl -X POST http://localhost:3000/api/export/direct \
  -H "Content-Type: application/json" \
  -d '{"type": "revenue"}' \
  --output test.pdf

# Export all charts
curl -X POST http://localhost:3000/api/export/direct \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}' \
  --output all-charts.pdf
```

## Quản lý container

### Xem logs
```bash
docker logs export-pdf-service
```

### Xem logs real-time
```bash
docker logs -f export-pdf-service
```

### Dừng container
```bash
docker stop export-pdf-service
```

### Xóa container
```bash
docker rm export-pdf-service
```

### Restart container
```bash
docker restart export-pdf-service
```

## Lưu ý

- Service sẽ chạy trên port 3000
- Health check được cấu hình tự động
- Container sử dụng user không phải root để bảo mật
- Image được tối ưu với multi-stage build để giảm kích thước
- Các dependencies cho chartjs-node-canvas đã được cài đặt sẵn
- Font files đã được copy vào container
- Service có thể hoạt động với hoặc không có database

## Cấu hình Database

### Kết nối database local
- Sử dụng `host.docker.internal` để kết nối máy host
- Cấu hình MySQL cho phép remote access từ Docker container
- Đảm bảo database `inventory-sale-ai` đã được tạo

### Các loại export hỗ trợ
- `best_seller` - Hàng bán chạy
- `refund` - Hàng bị refund nhiều  
- `refund_reason` - Lý do refund
- `revenue` - Doanh thu theo ngày
- `category` - Phân tích theo danh mục
- `brand` - Phân tích theo thương hiệu
- `slow_moving` - Hàng ế
- `all` - Tất cả biểu đồ tổng hợp 