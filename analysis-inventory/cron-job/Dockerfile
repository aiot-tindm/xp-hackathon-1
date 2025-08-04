# Dockerfile cho Cron Job Service
# Chạy analysis.py hàng ngày để phân tích dữ liệu

FROM python:3.11-slim

# Thiết lập metadata
LABEL maintainer="Analytics Team"
LABEL description="Docker container cho Cron Job Service - chạy analysis.py hàng ngày"

# Thiết lập working directory
WORKDIR /app

# Cài đặt system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY ../requirements.txt .

# Cài đặt Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source code
COPY ../package ./package
COPY ../cron-job ./cron-job

# Tạo thư mục logs
RUN mkdir -p /app/logs

# Thiết lập environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Tạo script chạy analysis với retry logic
RUN echo '#!/bin/bash\n\
echo "🚀 Khởi động Analysis System..."\n\
echo "📊 Chạy analysis.py..."\n\
\n\
# Retry logic cho MySQL connection\n\
max_attempts=30\n\
attempt=1\n\
\n\
while [ $attempt -le $max_attempts ]; do\n\
    echo "   Thử kết nối MySQL lần $attempt/$max_attempts..."\n\
    \n\
    cd /app/cron-job\n\
    if python analysis.py; then\n\
        echo "✅ Hoàn thành phân tích!"\n\
        exit 0\n\
    else\n\
        echo "   Lỗi kết nối MySQL, thử lại sau 2 giây..."\n\
        sleep 2\n\
        attempt=$((attempt + 1))\n\
    fi\n\
done\n\
\n\
echo "❌ Không thể kết nối MySQL sau $max_attempts lần thử!"\n\
exit 1\n\
' > /app/run_analysis.sh && chmod +x /app/run_analysis.sh

# Tạo script để trigger analysis từ bên ngoài
RUN echo '#!/bin/bash\n\
echo "🔧 Manual trigger analysis..."\n\
/app/run_analysis.sh\n\
' > /app/trigger_analysis.sh && chmod +x /app/trigger_analysis.sh

# Tạo script entrypoint với cron
RUN echo '#!/bin/bash\n\
echo "🚀 Khởi động Cron Job Service..."\n\
echo "📅 Thiết lập cron job chạy hàng ngày lúc 11:30 PM (23:30)..."\n\
echo "🔧 Có thể trigger analysis thủ công bằng lệnh: docker exec analytics_cron_job /app/trigger_analysis.sh"\n\
\n\
# Thêm cron job\n\
echo "30 23 * * * /app/run_analysis.sh >> /app/logs/cron.log 2>&1" > /etc/cron.d/analysis-cron\n\
chmod 0644 /etc/cron.d/analysis-cron\n\
crontab /etc/cron.d/analysis-cron\n\
\n\
# Chạy analysis lần đầu\n\
echo "🔍 Chạy phân tích lần đầu..."\n\
/app/run_analysis.sh\n\
\n\
echo "⏰ Cron job đã được thiết lập. Sẽ chạy hàng ngày lúc 11:30 PM (23:30)."\n\
echo "🔧 Để chạy analysis ngay lập tức, sử dụng:"\n\
echo "   docker exec analytics_cron_job /app/trigger_analysis.sh"\n\
echo "📋 Logs sẽ được lưu tại /app/logs/cron.log"\n\
\n\
# Khởi động cron daemon\n\
cron -f\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Thiết lập entrypoint
ENTRYPOINT ["/app/entrypoint.sh"] 