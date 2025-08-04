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
DROP TABLE IF EXISTS system_config;
CREATE TABLE system_config (
  config_type VARCHAR(50) NOT NULL, -- 'segmentation', 'churn', 'rfm', 'recommendation', 'potential_customers'
  business_type VARCHAR(191) DEFAULT 'default',
  config JSON,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_config (config_type, business_type)
);

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

-- Insert default configurations
INSERT INTO system_config (config_type, business_type, config, is_active, created_at, updated_at) VALUES
-- Segmentation Config
(
  'segmentation',
  'default',
  JSON_OBJECT(
    'whale', JSON_OBJECT(
      'minTotalSpent', 80000,
      'minOrders', 15,
      'minAvgOrderValue', 4000
    ),
    'vip', JSON_OBJECT(
      'minTotalSpent', 40000,
      'maxTotalSpent', 80000,
      'minOrders', 10,
      'minAvgOrderValue', 2000
    ),
    'regular', JSON_OBJECT(
      'minTotalSpent', 10000,
      'maxTotalSpent', 40000,
      'minOrders', 5
    ),
    'churn', JSON_OBJECT(
      'maxDaysSinceLastOrder', 500
    )
  ),
  true,
  NOW(),
  NOW()
),

-- Churn Config
(
  'churn',
  'default',
  JSON_OBJECT(
    'riskFactors', JSON_OBJECT(
      'inactivity', JSON_OBJECT(
        'thresholds', JSON_ARRAY(30, 60, 90, 180, 365),
        'weights', JSON_ARRAY(0.1, 0.2, 0.3, 0.5, 0.8)
      ),
      'orderFrequency', JSON_OBJECT(
        'thresholds', JSON_ARRAY(1, 2, 3, 5, 10),
        'weights', JSON_ARRAY(0.4, 0.3, 0.2, 0.1, 0.05)
      ),
      'orderValue', JSON_OBJECT(
        'thresholds', JSON_ARRAY(100, 500, 1000, 5000, 10000),
        'weights', JSON_ARRAY(0.3, 0.2, 0.15, 0.1, 0.05)
      ),
      'engagement', JSON_OBJECT(
        'thresholds', JSON_ARRAY(0.2, 0.4, 0.6, 0.8, 1.0),
        'weights', JSON_ARRAY(0.8, 0.6, 0.4, 0.2, 0.1)
      )
    ),
    'riskLevels', JSON_OBJECT(
      'high', JSON_OBJECT('minRisk', 0.7, 'maxRisk', 1.0),
      'medium', JSON_OBJECT('minRisk', 0.4, 'maxRisk', 0.69),
      'low', JSON_OBJECT('minRisk', 0.0, 'maxRisk', 0.39)
    ),
    'retentionStrategies', JSON_OBJECT(
      'immediate', JSON_ARRAY('personal_contact', 'special_offer', 'account_review', 'feedback_survey'),
      'shortTerm', JSON_ARRAY('loyalty_program', 'product_recommendations', 'exclusive_access', 'early_bird_offers'),
      'longTerm', JSON_ARRAY('relationship_building', 'value_proposition', 'community_engagement', 'referral_program')
    ),
    'insights', JSON_OBJECT(
      'reasons', JSON_OBJECT(
        'price_sensitivity', 'Customer shows signs of price sensitivity and may be comparing with competitors',
        'lack_of_engagement', 'Customer has low engagement with brand communications and promotions',
        'poor_experience', 'Customer may have had negative experiences with products or service',
        'competitor_switch', 'Customer behavior suggests they may be exploring competitor offerings',
        'seasonal_pattern', 'Customer follows seasonal purchasing patterns',
        'life_change', 'Customer behavior change may indicate life circumstances have changed'
      ),
      'difficulty', JSON_OBJECT(
        'easy', 'High probability of retention with targeted engagement',
        'medium', 'Moderate effort required for retention, focus on value proposition',
        'hard', 'Low probability of retention, may require aggressive win-back strategies'
      )
    )
  ),
  true,
  NOW(),
  NOW()
),

-- RFM Config
(
  'rfm',
  'default',
  JSON_OBJECT(
    'scoring', JSON_OBJECT(
      'recency', JSON_OBJECT(
        'thresholds', JSON_ARRAY(30, 60, 90, 180),
        'weights', JSON_ARRAY(5, 4, 3, 2, 1)
      ),
      'frequency', JSON_OBJECT(
        'thresholds', JSON_ARRAY(2, 3, 5, 10),
        'weights', JSON_ARRAY(1, 2, 3, 4, 5)
      ),
      'monetary', JSON_OBJECT(
        'thresholds', JSON_ARRAY(500, 2000, 10000, 50000),
        'weights', JSON_ARRAY(1, 2, 3, 4, 5)
      )
    ),
    'segments', JSON_OBJECT(
      'champions', JSON_OBJECT('minScore', 13, 'maxScore', 15),
      'loyal', JSON_OBJECT('minScore', 11, 'maxScore', 12),
      'atRisk', JSON_OBJECT('minScore', 8, 'maxScore', 10),
      'cantLose', JSON_OBJECT('minScore', 6, 'maxScore', 7),
      'lost', JSON_OBJECT('minScore', 3, 'maxScore', 5)
    ),
    'insights', JSON_OBJECT(
      'recency', JSON_OBJECT(
        'excellent', 'Customer purchased very recently (within 30 days)',
        'good', 'Customer purchased recently (within 60 days)',
        'average', 'Customer purchased within 90 days',
        'poor', 'Customer purchased within 180 days',
        'critical', 'Customer hasn''t purchased for over 180 days'
      ),
      'frequency', JSON_OBJECT(
        'excellent', 'Customer orders very frequently (10+ orders)',
        'good', 'Customer orders frequently (5-9 orders)',
        'average', 'Customer orders moderately (3-4 orders)',
        'poor', 'Customer orders occasionally (2 orders)',
        'critical', 'Customer has only 1 order'
      ),
      'monetary', JSON_OBJECT(
        'excellent', 'Customer spends very high amounts ($50K+)',
        'good', 'Customer spends high amounts ($10K-$50K)',
        'average', 'Customer spends moderate amounts ($2K-$10K)',
        'poor', 'Customer spends low amounts ($500-$2K)',
        'critical', 'Customer spends very low amounts (<$500)'
      )
    )
  ),
  true,
  NOW(),
  NOW()
),

-- Recommendation Config
(
  'recommendation',
  'default',
  JSON_OBJECT(
    'confidence', JSON_OBJECT(
      'high', 0.8,
      'medium', 0.6,
      'low', 0.4
    ),
    'discountRates', JSON_OBJECT(
      'whale', 0.20,
      'vip', 0.15,
      'regular', 0.10,
      'new', 0.05,
      'churn', 0.25
    ),
    'targetAmounts', JSON_OBJECT(
      'whale', 10000,
      'vip', 5000,
      'regular', 2000,
      'new', 1000,
      'churn', 1500
    ),
    'limits', JSON_OBJECT(
      'products', 5,
      'promotions', 3,
      'strategies', 2
    ),
    'algorithmWeights', JSON_OBJECT(
      'collaborativeFiltering', 0.4,
      'contentBased', 0.3,
      'popularity', 0.2,
      'recency', 0.1
    ),
    'performance', JSON_OBJECT(
      'minClickRate', 0.05,
      'minConversionRate', 0.02,
      'minRevenueImpact', 100
    ),
    'seasonalFactors', JSON_OBJECT(
      'spring', 1.1,
      'summer', 1.0,
      'autumn', 1.05,
      'winter', 1.15
    ),
    'priceSensitivity', JSON_OBJECT(
      'high', 0.8,
      'medium', 0.5,
      'low', 0.2
    )
  ),
  true,
  NOW(),
  NOW()
),

-- Potential Customers Config
(
  'potential_customers',
  'default',
  JSON_OBJECT(
    'scoring', JSON_OBJECT(
      'purchaseFrequency', JSON_OBJECT(
        'thresholds', JSON_ARRAY(1, 3, 5, 10, 20),
        'weights', JSON_ARRAY(1, 2, 3, 4, 5)
      ),
      'totalSpent', JSON_OBJECT(
        'thresholds', JSON_ARRAY(100, 500, 1000, 5000, 10000),
        'weights', JSON_ARRAY(1, 2, 3, 4, 5)
      ),
      'recency', JSON_OBJECT(
        'thresholds', JSON_ARRAY(30, 60, 90, 180, 365),
        'weights', JSON_ARRAY(5, 4, 3, 2, 1)
      ),
      'diversity', JSON_OBJECT(
        'categoryThresholds', JSON_ARRAY(1, 2, 3, 5, 10),
        'brandThresholds', JSON_ARRAY(1, 2, 3, 5, 10),
        'weights', JSON_ARRAY(1, 2, 3, 4, 5)
      )
    ),
    'interestLevels', JSON_OBJECT(
      'high', JSON_OBJECT('minScore', 7, 'maxScore', 10),
      'medium', JSON_OBJECT('minScore', 4, 'maxScore', 6),
      'low', JSON_OBJECT('minScore', 1, 'maxScore', 3)
    ),
    'marketingInsights', JSON_OBJECT(
      'segments', JSON_OBJECT(
        'tech_enthusiasts', 'Customers who frequently purchase technology products and show high engagement with tech categories',
        'value_seekers', 'Customers who focus on price-performance ratio and look for deals',
        'premium_buyers', 'Customers who prefer high-end products and are less price-sensitive',
        'casual_shoppers', 'Customers with occasional purchases and varied interests'
      ),
      'channels', JSON_OBJECT(
        'email', 'Most effective for detailed product information and personalized offers',
        'social_media', 'Best for brand awareness and product discovery',
        'sms', 'Effective for time-sensitive offers and quick updates',
        'push_notifications', 'Good for app users and immediate engagement'
      ),
      'timing', JSON_OBJECT(
        'weekend_mornings', 'Optimal for leisurely browsing and major purchases',
        'weekday_evenings', 'Good for after-work shopping and research',
        'lunch_breaks', 'Effective for quick purchases and mobile shopping',
        'late_night', 'Suitable for impulse purchases and mobile users'
      )
    ),
    'salesIntelligence', JSON_OBJECT(
      'leadScoring', JSON_OBJECT(
        'high', JSON_OBJECT('minScore', 8, 'maxScore', 10),
        'medium', JSON_OBJECT('minScore', 5, 'maxScore', 7),
        'low', JSON_OBJECT('minScore', 1, 'maxScore', 4)
      ),
      'conversionProbability', JSON_OBJECT(
        'high', JSON_OBJECT('minScore', 0.7, 'maxScore', 1.0),
        'medium', JSON_OBJECT('minScore', 0.4, 'maxScore', 0.69),
        'low', JSON_OBJECT('minScore', 0.0, 'maxScore', 0.39)
      )
    )
  ),
  true,
  NOW(),
  NOW()
);
