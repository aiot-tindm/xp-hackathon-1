-- Setup New Database Schema
-- This script creates a fresh database with the new schema
-- Run this to start with a clean slate

-- Drop existing database if exists
DROP DATABASE IF EXISTS `inventory_sales_db`;

-- Create new database
CREATE DATABASE `inventory_sales_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE `inventory_sales_db`;

-- Create Management Tables
CREATE TABLE `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `loyal_customers` (
  `customer_id` int NOT NULL,
  `total_orders` int DEFAULT '0',
  `total_spent` decimal(15,2) DEFAULT '0.00',
  `last_purchase_date` date DEFAULT NULL,
  `loyalty_segment` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Mới' COMMENT 'AI: Phân khúc khách hàng (Vàng, Bạc, Đồng)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  CONSTRAINT `loyal_customers_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Core Business Tables
CREATE TABLE `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã định danh sản phẩm (SKU)',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên sản phẩm',
  `cost_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Giá nhập kho',
  `sale_price` decimal(10,2) NOT NULL COMMENT 'Giá bán niêm yết',
  `stock_quantity` int NOT NULL DEFAULT '0' COMMENT 'Số lượng tồn kho hiện tại',
  `brand_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Sản phẩm có đang được bán hay không',
  `is_adult_content` tinyint(1) DEFAULT NULL COMMENT 'AI: Cờ đánh dấu sản phẩm 18+',
  `nudity_detection_score` decimal(3,2) DEFAULT NULL COMMENT 'AI: Điểm tin cậy về nội dung nhạy cảm (0-1)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `brand_id` (`brand_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `items_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  CONSTRAINT `items_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý chi tiết thông tin sản phẩm';

CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã đơn hàng từ các nền tảng',
  `customer_id` int NOT NULL,
  `shipping_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Địa chỉ giao hàng',
  `platform` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Kênh bán hàng: Shopee, Website,...',
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày khách đặt hàng',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ví dụ: Đã xác nhận, Đang giao, Hoàn thành, Đã hủy',
  `refund_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Lý do hoàn hàng (nếu có)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý thông tin chung của mỗi đơn hàng';

CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL COMMENT 'Số lượng bán',
  `price_per_unit` decimal(10,2) NOT NULL COMMENT 'Giá bán thực tế mỗi sản phẩm',
  `discount_amount` decimal(10,2) DEFAULT '0.00' COMMENT 'Số tiền giảm giá cho sản phẩm này',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết các sản phẩm và giá trị trong một đơn hàng';
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

DROP TABLE IF EXISTS `batches`;
CREATE TABLE `batches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `import_date` date NOT NULL,
  `total_quantity` int NOT NULL DEFAULT '0',
  `remain_quantity` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `batches_sku_fkey` (`sku`),
  CONSTRAINT `batches_sku_fkey` FOREIGN KEY (`sku`) REFERENCES `items` (`sku`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
 -- CreateTable
CREATE TABLE `segmentation_config` (
  `id` VARCHAR(191) NOT NULL,
  `business_type` VARCHAR(191) NOT NULL DEFAULT 'default',
  `config` JSON NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `segmentation_config_business_type_key` ON `segmentation_config`(`business_type`);

-- Create indexes for better performance
CREATE INDEX `idx_items_sku` ON `items` (`sku`);
CREATE INDEX `idx_items_brand` ON `items` (`brand_id`);
CREATE INDEX `idx_items_category` ON `items` (`category_id`);
CREATE INDEX `idx_items_active` ON `items` (`is_active`);

CREATE INDEX `idx_orders_customer` ON `orders` (`customer_id`);
CREATE INDEX `idx_orders_date` ON `orders` (`order_date`);
CREATE INDEX `idx_orders_platform` ON `orders` (`platform`);
CREATE INDEX `idx_orders_status` ON `orders` (`status`);

CREATE INDEX `idx_order_items_order` ON `order_items` (`order_id`);
CREATE INDEX `idx_order_items_item` ON `order_items` (`item_id`);

-- Insert default configuration
INSERT INTO `segmentation_config` (`id`, `business_type`, `config`, `is_active`, `created_at`, `updated_at`) VALUES
('default-config', 'default', '{
  "whale": {
    "minTotalSpent": 80000,
    "minOrders": 15,
    "minAvgOrderValue": 4000
  },
  "vip": {
    "minTotalSpent": 40000,
    "maxTotalSpent": 80000,
    "minOrders": 10,
    "minAvgOrderValue": 2000
  },
  "regular": {
    "minTotalSpent": 10000,
    "maxTotalSpent": 40000,
    "minOrders": 5
  },
  "churn": {
    "maxDaysSinceLastOrder": 500
  }
}', true, NOW(), NOW()); 