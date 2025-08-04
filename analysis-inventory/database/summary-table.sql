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
    `data_range` ENUM('1_day_ago', '7_days_ago', '1_month_ago', '3_months_ago', '6_months_ago', '1_year_ago', 'all_time') NOT NULL COMMENT 'Khoảng thời gian phân tích',
    `sort_type` ENUM('no_sales', 'low_sales', 'high_stock_low_sales', 'aging_stock') NOT NULL COMMENT 'Loại phân tích hàng bán ế',
    `sku` VARCHAR(100) NOT NULL COMMENT 'Mã SKU của sản phẩm (Stock Keeping Unit)',
    `item_name` VARCHAR(200) NOT NULL COMMENT 'Tên sản phẩm',
    `brand_name` VARCHAR(200) NULL COMMENT 'Tên thương hiệu',
    `category_name` VARCHAR(200) NULL COMMENT 'Tên danh mục sản phẩm',
    `current_stock` INT DEFAULT 0 COMMENT 'Số lượng tồn kho hiện tại',
    `total_quantity_sold` INT DEFAULT 0 COMMENT 'Tổng số lượng đã bán trong khoảng thời gian phân tích',
    `avg_daily_sales` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Trung bình số lượng bán hàng ngày',
    `days_without_sales` INT DEFAULT 0 COMMENT 'Số ngày không có bán hàng',
    `stock_value` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Giá trị tồn kho (cost_price * current_stock)',
    `potential_loss` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Tiềm năng mất mát nếu không bán được hàng',
    `rank_position` INT DEFAULT 0 COMMENT 'Vị trí xếp hạng trong danh sách',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo bản ghi',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật bản ghi',
    PRIMARY KEY (`analysis_date`, `data_range`, `sort_type`, `sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ phân tích hàng bán ế';