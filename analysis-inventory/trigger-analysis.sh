#!/bin/bash

# Script để trigger analysis ngay lập tức
# Sử dụng: ./trigger-analysis.sh

echo "🔧 Trigger Analysis ngay lập tức..."
echo "=================================="

# Kiểm tra container có đang chạy không
if ! docker ps | grep -q analytics_cron_job; then
    echo "❌ Container analytics_cron_job không đang chạy!"
    echo "   Hãy chạy: docker-compose up -d"
    exit 1
fi

# Đợi MySQL sẵn sàng
echo "⏳ Đợi MySQL sẵn sàng..."
max_attempts=60
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "   Thử kết nối MySQL lần $attempt/$max_attempts..."
    
    # Thử kết nối MySQL
    if docker exec analytics_mysql mysql -u analytics -panalytics123 -e "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ MySQL đã sẵn sàng!"
        break
    fi
    
    echo "   MySQL chưa sẵn sàng, đợi 1 giây..."
    sleep 1
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Không thể kết nối MySQL sau $max_attempts lần thử!"
    exit 1
fi

echo "✅ Container đang chạy, trigger analysis..."
docker exec analytics_cron_job /app/trigger_analysis.sh

echo ""
echo "📋 Xem logs:"
echo "   docker logs analytics_cron_job"
echo "   docker exec analytics_cron_job cat /app/logs/cron.log" 