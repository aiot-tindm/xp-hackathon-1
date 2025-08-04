# Hướng dẫn chạy Export PDF Service với Docker

## Build Docker image
```bash
docker build -t export-pdf-service .
```

## Chạy container
```bash
docker run -d \
  --name export-pdf-service \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  export-pdf-service
```

## Chạy với environment variables tùy chỉnh
```bash
docker run -d \
  --name export-pdf-service \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
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