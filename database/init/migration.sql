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

-- Create Analytics Tables
CREATE TABLE `brand_summary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `analysis_by` enum('system','user') COLLATE utf8mb4_unicode_ci NOT NULL,
  `analysis_date` date NOT NULL,
  `platform` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_id` int NOT NULL,
  `total_quantity_sold` int DEFAULT '0',
  `total_revenue` decimal(15,2) DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_summary` (`analysis_date`,`platform`,`brand_id`),
  KEY `brand_id` (`brand_id`),
  CONSTRAINT `brand_summary_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tự động cập nhật: Doanh số chi tiết theo thương hiệu hàng ngày';

CREATE TABLE `category_summary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `analysis_by` enum('system','user') COLLATE utf8mb4_unicode_ci NOT NULL,
  `analysis_date` date NOT NULL,
  `platform` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL,
  `total_quantity_sold` int DEFAULT '0',
  `total_revenue` decimal(15,2) DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_summary` (`analysis_date`,`platform`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `category_summary_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tự động cập nhật: Doanh số chi tiết theo danh mục hàng ngày';

CREATE TABLE `daily_sales_summary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `analysis_by` enum('system','user') COLLATE utf8mb4_unicode_ci NOT NULL,
  `analysis_date` date NOT NULL,
  `platform` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_orders` int DEFAULT '0',
  `total_revenue` decimal(15,2) DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_summary` (`analysis_date`,`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tự động cập nhật: Tổng quan doanh số hàng ngày';

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
