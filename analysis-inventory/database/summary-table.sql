-- 1. Create TopSellingItem table with composite primary key
CREATE TABLE top_selling_items (
    analysis_date DATE NOT NULL,
    data_range ENUM('1_day_ago', '7_days_ago', '1_month_ago', '3_months_ago', '6_months_ago', '1_year_ago', 'all_time') NOT NULL,
    sort_type ENUM('revenue', 'profit', 'quantity') NOT NULL,
    sku VARCHAR(100) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    total_quantity_sold INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_profit DECIMAL(10,2) DEFAULT 0,
    rank_position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (analysis_date, data_range, sort_type, sku)
);

-- 2. Create CategorySummary table with composite primary key
CREATE TABLE category_summary (
    analysis_date DATE NOT NULL,
    data_range ENUM('1_day_ago', '7_days_ago', '1_month_ago', '3_months_ago', '6_months_ago', '1_year_ago', 'all_time') NOT NULL,
    sort_type ENUM('revenue', 'quantity') NOT NULL,
    category_id INTEGER NOT NULL,
    category_name VARCHAR(200) NOT NULL,
    total_quantity_sold INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_profit DECIMAL(10,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    rank_position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (analysis_date, data_range, sort_type, category_id)
);

-- 3. Create BrandSummary table with composite primary key
CREATE TABLE brand_summary (
    analysis_date DATE NOT NULL,
    data_range ENUM('1_day_ago', '7_days_ago', '1_month_ago', '3_months_ago', '6_months_ago', '1_year_ago', 'all_time') NOT NULL,
    sort_type ENUM('revenue', 'quantity', 'profit') NOT NULL,
    brand_id INTEGER NOT NULL,
    brand_name VARCHAR(200) NOT NULL,
    total_quantity_sold INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_profit DECIMAL(10,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    rank_position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (analysis_date, data_range, sort_type, brand_id)
);

-- 4. Create RefundAnalysis table with composite primary key
CREATE TABLE refund_analysis (
    analysis_date DATE NOT NULL,
    data_range ENUM('1_day_ago', '7_days_ago', '1_month_ago', '3_months_ago', '6_months_ago', '1_year_ago', 'all_time') NOT NULL,
    sort_type ENUM('refund_count', 'refund_rate', 'refund_quantity', 'refund_reason') NOT NULL,
    sku VARCHAR(100) NOT NULL,
    item_name VARCHAR(200),
    total_orders INTEGER DEFAULT 0,
    refund_orders INTEGER DEFAULT 0,
    refund_rate DECIMAL(5,2) DEFAULT 0,
    refund_reason VARCHAR(200),
    refund_quantity INTEGER DEFAULT 0,
    items_affected INTEGER DEFAULT 0,
    rank_position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (analysis_date, data_range, sort_type, sku)
);

-- 5. Create DailySalesSummary table with composite primary key
CREATE TABLE daily_sales_summary (
    analysis_date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_profit DECIMAL(10,2) DEFAULT 0,
    total_refunds INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (analysis_date)
);

-- 6. Create LowStockAlert table with composite primary key
CREATE TABLE low_stock_alerts (
    analysis_date DATE NOT NULL,
    sku VARCHAR(100) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    current_stock INTEGER DEFAULT 0,
    avg_daily_sales DECIMAL(10,2) DEFAULT 0.00,
    days_left DECIMAL(10,2) DEFAULT 0.00,
    alert_type ENUM('out_of_stock', 'low_stock', 'expiring_soon') DEFAULT 'low_stock',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (analysis_date, sku)
);

CREATE TABLE `slow_moving_items` (
    `analysis_date` DATE NOT NULL COMMENT 'Ngày thực hiện phân tích (YYYY-MM-DD)',
    `sort_type` ENUM('no_sales', 'low_sales', 'high_stock_low_sales', 'aging_stock') NOT NULL COMMENT 'Loại phân tích hàng bán ế',
    `sku` VARCHAR(100) NOT NULL COMMENT 'Mã SKU của sản phẩm (Stock Keeping Unit)',
    `item_name` VARCHAR(200) NOT NULL COMMENT 'Tên sản phẩm',
    `brand_name` VARCHAR(200) NULL COMMENT 'Tên thương hiệu',
    `category_name` VARCHAR(200) NULL COMMENT 'Tên danh mục sản phẩm',
    `current_stock` INT DEFAULT 0 COMMENT 'Số lượng tồn kho hiện tại',
    `total_quantity_sold` INT DEFAULT 0 COMMENT 'Tổng số lượng đã bán trong khoảng thời gian phân tích',
    `total_revenue` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Tổng doanh thu từ sản phẩm',
    `total_profit` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Tổng lợi nhuận từ sản phẩm',
    `profit_margin` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Tỷ lệ lợi nhuận (%)',
    `stock_to_sales_ratio` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Tỷ lệ tồn kho / bán hàng',
    `stock_value` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Giá trị tồn kho (cost_price * current_stock)',
    `potential_loss` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Tiềm năng mất mát nếu không bán được hàng',
    `cost_price` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Giá vốn sản phẩm',
    `sale_price` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Giá bán sản phẩm',
    `days_in_stock` INT DEFAULT 0 COMMENT 'Số ngày tồn kho (tính từ lô hàng cũ nhất)',
    `rank_position` INT DEFAULT 0 COMMENT 'Vị trí xếp hạng trong danh sách',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo bản ghi',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật bản ghi',
    PRIMARY KEY (`analysis_date`, `sort_type`, `sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ phân tích hàng bán ế';

-- Bảng dự đoán doanh thu
CREATE TABLE `revenue_predictions` (
    `analysis_date` DATE NOT NULL COMMENT 'Ngày thực hiện phân tích (YYYY-MM-DD)',
    `prediction_period` VARCHAR(50) NOT NULL COMMENT 'Khoảng thời gian dự đoán (next_month, next_quarter, etc.)',
    `prediction_days` INT DEFAULT 30 COMMENT 'Số ngày dự đoán',
    
    -- Historical data
    `total_historical_revenue` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Tổng doanh thu lịch sử',
    `avg_daily_revenue` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Trung bình doanh thu hàng ngày',
    `std_daily_revenue` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Độ lệch chuẩn doanh thu hàng ngày',
    `data_days` INT DEFAULT 0 COMMENT 'Số ngày có dữ liệu',
    `trend_percentage` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Tỷ lệ tăng trưởng (%)',
    `r2_score` DECIMAL(5,4) DEFAULT 0.0000 COMMENT 'Độ chính xác của model (R-squared)',
    `mape` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Mean Absolute Percentage Error',
    
    -- Predictions
    `total_predicted_revenue` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Tổng doanh thu dự đoán',
    `avg_daily_prediction` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Trung bình doanh thu dự đoán hàng ngày',
    `confidence_interval` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Khoảng tin cậy',
    `lower_bound` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Giới hạn dưới',
    `upper_bound` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Giới hạn trên',
    
    -- Model info
    `algorithm` VARCHAR(100) DEFAULT 'Linear Regression' COMMENT 'Thuật toán sử dụng',
    `features_used` TEXT COMMENT 'Danh sách features sử dụng (JSON)',
    `data_points` INT DEFAULT 0 COMMENT 'Số điểm dữ liệu',
    `confidence_level` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Mức độ tin cậy (%)',
    
    -- Risk assessment
    `high_volatility` BOOLEAN DEFAULT FALSE COMMENT 'Độ biến động cao',
    `negative_trend` BOOLEAN DEFAULT FALSE COMMENT 'Xu hướng giảm',
    `low_confidence` BOOLEAN DEFAULT FALSE COMMENT 'Độ tin cậy thấp',
    `insufficient_data` BOOLEAN DEFAULT FALSE COMMENT 'Dữ liệu không đủ',
    
    -- JSON data
    `daily_predictions` TEXT COMMENT 'Dự đoán từng ngày (JSON)',
    `weekday_analysis` TEXT COMMENT 'Phân tích theo ngày trong tuần (JSON)',
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo bản ghi',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật bản ghi',
    PRIMARY KEY (`analysis_date`, `prediction_period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ dự đoán doanh thu';