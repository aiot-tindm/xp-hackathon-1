#!/bin/bash

# Script để đợi MySQL sẵn sàng trước khi chạy analysis
# Sử dụng: ./wait-for-mysql.sh

echo "⏳ Đợi MySQL sẵn sàng..."

# Đợi tối đa 60 giây
max_attempts=60
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "   Thử kết nối MySQL lần $attempt/$max_attempts..."
    
    # Thử kết nối MySQL
    if docker exec analytics_mysql mysql -u analytics -panalytics123 -e "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ MySQL đã sẵn sàng!"
        exit 0
    fi
    
    echo "   MySQL chưa sẵn sàng, đợi 1 giây..."
    sleep 1
    attempt=$((attempt + 1))
done

echo "❌ Không thể kết nối MySQL sau $max_attempts lần thử!"
exit 1 