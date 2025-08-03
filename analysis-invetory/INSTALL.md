# Hướng dẫn cài đặt Analytics API System

## Yêu cầu hệ thống
- Python 3.8 trở lên
- MySQL/MariaDB database
- pip (Python package manager)

## Cách 1: Cài đặt từ requirements.txt (Khuyến nghị)

### 1. Tạo virtual environment (Khuyến nghị)
```bash
# Tạo virtual environment
python3 -m venv venv

# Kích hoạt virtual environment
# Trên macOS/Linux:
source venv/bin/activate

# Trên Windows:
# venv\Scripts\activate
```

### 2. Cài đặt dependencies
```bash
# Cài đặt tất cả packages từ requirements.txt
pip install -r requirements.txt
```

### 3. Kiểm tra cài đặt
```bash
# Kiểm tra Python version
python --version

# Kiểm tra các packages đã cài
pip list
```

## Cách 2: Cài đặt từng package riêng lẻ

```bash
# Flask và extensions
pip install Flask==2.3.3
pip install Flask-CORS==4.0.0

# Database
pip install SQLAlchemy==2.0.21
pip install PyMySQL==1.1.0

# Environment variables
pip install python-dotenv==1.0.0

# Data processing
pip install pandas==2.0.3
pip install numpy==1.24.3

# Date handling
pip install python-dateutil==2.8.2

# Logging
pip install colorlog==6.7.0
```

## Cấu hình Database

### 1. Tạo file .env
```bash
# Tạo file .env trong thư mục cron-summary
touch .env
```

### 2. Thêm thông tin database vào .env
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=inventory-sale-ai
DB_PORT=3306
```

### 3. Tạo database
```sql
CREATE DATABASE `inventory-sale-ai` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Kiểm tra cài đặt

### 1. Test import các modules
```bash
python3 -c "
import flask
import flask_cors
import sqlalchemy
import pymysql
import pandas
import numpy
import dotenv
print('✅ Tất cả modules đã được cài đặt thành công!')
"
```

### 2. Test kết nối database
```bash
python3 -c "
from models import create_db_engine
try:
    engine = create_db_engine()
    print('✅ Kết nối database thành công!')
except Exception as e:
    print(f'❌ Lỗi kết nối database: {e}')
"
```

### 3. Chạy API server
```bash
python3 api.py
```

Nếu thành công, bạn sẽ thấy:
```
🚀 Khởi động Analytics API Server...
📊 Các endpoints có sẵn:
   - GET /api/daily-sales
   - GET /api/daily-sales/<date>
   - GET /api/daily-sales/period/<period>
   - GET /api/top-selling-items
   - GET /api/category-summary
   - GET /api/brand-summary
   - GET /api/refund-analysis
   - GET /api/low-stock-alerts
   - GET /api/batch-analysis

🌐 Server đang chạy tại: http://localhost:5000
```
