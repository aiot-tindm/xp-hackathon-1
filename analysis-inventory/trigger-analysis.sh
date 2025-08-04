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

echo "✅ Container đang chạy, trigger analysis..."
docker exec analytics_cron_job /app/trigger_analysis.sh

echo ""
echo "📋 Xem logs:"
echo "   docker logs analytics_cron_job"
echo "   docker exec analytics_cron_job cat /app/logs/cron.log" 