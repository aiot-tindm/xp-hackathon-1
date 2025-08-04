# Dockerfile cho API Server Service
# Chạy api.py để cung cấp REST API

FROM python:3.11-slim

# Thiết lập metadata
LABEL maintainer="Analytics Team"
LABEL description="Docker container cho API Server Service - chạy api.py"

# Thiết lập working directory
WORKDIR /app

# Cài đặt system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY ../requirements.txt .

# Cài đặt Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source code
COPY ../package ./package
COPY ../api-server ./api-server

# Tạo thư mục logs
RUN mkdir -p /app/logs

# Thiết lập environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Expose port
EXPOSE 5000

# Tạo script entrypoint
RUN echo '#!/bin/bash\n\
echo "🚀 Khởi động API Server..."\n\
echo "🌐 API server sẽ chạy tại http://localhost:5000"\n\
echo "📊 Các endpoints có sẵn:"\n\
echo "   - GET /api/daily-sales"\n\
echo "   - GET /api/top-selling-items"\n\
echo "   - GET /api/category-summary"\n\
echo "   - GET /api/brand-summary"\n\
echo "   - GET /api/refund-analysis"\n\
echo "   - GET /api/low-stock-alerts"\n\
echo "   - GET /api/slow-moving-items"\n\
echo "   - GET /api/summary/overview"\n\
cd /app/api-server\n\
python api.py\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Thiết lập entrypoint
ENTRYPOINT ["/app/entrypoint.sh"] 