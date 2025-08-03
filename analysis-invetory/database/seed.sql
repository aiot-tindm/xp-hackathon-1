-- Fake Data Complete cho Analytics System
-- Tạo dữ liệu mẫu cho tất cả các bảng bao gồm customers

-- Xóa dữ liệu cũ (nếu có) - Thứ tự quan trọng để tránh foreign key constraint
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM batches;
DELETE FROM items;
DELETE FROM categories;
DELETE FROM brands;
DELETE FROM customers;

-- Reset auto increment
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE batches AUTO_INCREMENT = 1;
ALTER TABLE items AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE brands AUTO_INCREMENT = 1;
ALTER TABLE customers AUTO_INCREMENT = 1;

-- 0. INSERT CUSTOMERS (PHẢI INSERT TRƯỚC TIÊN)
INSERT INTO customers (id, name, email) VALUES
(1, 'Nguyễn Văn An', 'nguyen.van.an@email.com'),
(2, 'Trần Thị Bình', 'tran.thi.binh@email.com'),
(3, 'Lê Văn Cường', 'le.van.cuong@email.com'),
(4, 'Phạm Thị Dung', 'pham.thi.dung@email.com'),
(5, 'Hoàng Văn Em', 'hoang.van.em@email.com'),
(6, 'Vũ Thị Phương', 'vu.thi.phuong@email.com'),
(7, 'Đặng Văn Giang', 'dang.van.giang@email.com'),
(8, 'Bùi Thị Hoa', 'bui.thi.hoa@email.com'),
(9, 'Ngô Văn Inh', 'ngo.van.inh@email.com'),
(10, 'Hồ Thị Kim', 'ho.thi.kim@email.com'),
(11, 'Lý Văn Lan', 'ly.van.lan@email.com'),
(12, 'Mai Thị Minh', 'mai.thi.minh@email.com'),
(13, 'Tô Văn Nam', 'to.van.nam@email.com'),
(14, 'Võ Thị Oanh', 'vo.thi.oanh@email.com'),
(15, 'Đinh Văn Phúc', 'dinh.van.phuc@email.com'),
(16, 'Lâm Thị Quỳnh', 'lam.thi.quynh@email.com'),
(17, 'Trịnh Văn Rạng', 'trinh.van.rang@email.com'),
(18, 'Châu Thị Sinh', 'chau.thi.sinh@email.com'),
(19, 'Tạ Văn Tân', 'ta.van.tan@email.com'),
(20, 'Huỳnh Thị Uyên', 'huynh.thi.uyen@email.com'),
(21, 'Nguyễn Văn Vinh', 'nguyen.van.vinh@email.com'),
(22, 'Trần Thị Xuân', 'tran.thi.xuan@email.com'),
(23, 'Lê Văn Yến', 'le.van.yen@email.com'),
(24, 'Phạm Thị Zương', 'pham.thi.zuong@email.com'),
(25, 'Hoàng Văn Anh', 'hoang.van.anh@email.com'),
(26, 'Vũ Thị Bảo', 'vu.thi.bao@email.com'),
(27, 'Đặng Văn Cảnh', 'dang.van.canh@email.com'),
(28, 'Bùi Thị Duyên', 'bui.thi.duyen@email.com');

-- 1. INSERT BRANDS
INSERT INTO brands (name, created_at, updated_at) VALUES
('Nike', NOW(), NOW()),
('Adidas', NOW(), NOW()),
('Puma', NOW(), NOW()),
('Under Armour', NOW(), NOW()),
('New Balance', NOW(), NOW()),
('Reebok', NOW(), NOW()),
('Converse', NOW(), NOW()),
('Vans', NOW(), NOW()),
('ASICS', NOW(), NOW()),
('Saucony', NOW(), NOW());

-- 2. INSERT CATEGORIES
INSERT INTO categories (name, created_at, updated_at) VALUES
('Running Shoes', NOW(), NOW()),
('Basketball Shoes', NOW(), NOW()),
('Casual Shoes', NOW(), NOW()),
('Training Shoes', NOW(), NOW());

-- 3. INSERT ITEMS
INSERT INTO items (sku, name, cost_price, sale_price, stock_quantity, brand_id, category_id, is_active, created_at, updated_at) VALUES
-- Nike Running Shoes
('NIKE-001', 'Nike Air Zoom Pegasus 38', 1200000, 1800000, 50, 1, 1, 1, NOW(), NOW()),
('NIKE-002', 'Nike ZoomX Vaporfly NEXT%', 2500000, 3500000, 30, 1, 1, 1, NOW(), NOW()),
('NIKE-003', 'Nike Air Max 270', 1400000, 2000000, 45, 1, 3, 1, NOW(), NOW()),
('NIKE-004', 'Nike LeBron 18', 1800000, 2500000, 35, 1, 2, 1, NOW(), NOW()),
('NIKE-005', 'Nike Metcon 6', 1600000, 2200000, 40, 1, 4, 1, NOW(), NOW()),

-- Adidas Running Shoes
('ADIDAS-001', 'Adidas Ultraboost 21', 1500000, 2200000, 55, 2, 1, 1, NOW(), NOW()),
('ADIDAS-002', 'Adidas Solarboost 3', 1300000, 1900000, 40, 2, 1, 1, NOW(), NOW()),
('ADIDAS-003', 'Adidas Harden Vol. 5', 1700000, 2400000, 30, 2, 2, 1, NOW(), NOW()),
('ADIDAS-004', 'Adidas Cloudfoam Pure', 800000, 1200000, 60, 2, 3, 1, NOW(), NOW()),
('ADIDAS-005', 'Adidas Powerlift 4', 1400000, 2000000, 25, 2, 4, 1, NOW(), NOW()),

-- Puma Shoes
('PUMA-001', 'Puma RS-X 3D', 1000000, 1500000, 50, 3, 3, 1, NOW(), NOW()),
('PUMA-002', 'Puma Future Rider', 900000, 1300000, 45, 3, 3, 1, NOW(), NOW()),
('PUMA-003', 'Puma Clyde Court', 1600000, 2200000, 35, 3, 2, 1, NOW(), NOW()),
('PUMA-004', 'Puma Ignite Pro', 1200000, 1800000, 40, 3, 1, 1, NOW(), NOW()),
('PUMA-005', 'Puma Fierce', 1100000, 1600000, 30, 3, 4, 1, NOW(), NOW()),

-- Under Armour Shoes
('UA-001', 'Under Armour HOVR Phantom', 1400000, 2000000, 40, 4, 1, 1, NOW(), NOW()),
('UA-002', 'Under Armour Curry 8', 1800000, 2500000, 30, 4, 2, 1, NOW(), NOW()),
('UA-003', 'Under Armour Charged Bandit', 1200000, 1700000, 45, 4, 1, 1, NOW(), NOW()),
('UA-004', 'Under Armour Project Rock', 1600000, 2200000, 35, 4, 4, 1, NOW(), NOW()),
('UA-005', 'Under Armour Slingflex', 1000000, 1400000, 50, 4, 3, 1, NOW(), NOW()),

-- New Balance Shoes
('NB-001', 'New Balance Fresh Foam 1080v11', 1300000, 1900000, 40, 5, 1, 1, NOW(), NOW()),
('NB-002', 'New Balance 990v5', 1600000, 2200000, 35, 5, 3, 1, NOW(), NOW()),
('NB-003', 'New Balance FuelCell Elite', 2000000, 2800000, 25, 5, 1, 1, NOW(), NOW()),
('NB-004', 'New Balance 574', 1100000, 1600000, 55, 5, 3, 1, NOW(), NOW()),
('NB-005', 'New Balance Minimus TR', 1400000, 2000000, 30, 5, 4, 1, NOW(), NOW()),

-- Reebok Shoes
('REE-001', 'Reebok Classic Leather', 900000, 1300000, 60, 6, 3, 1, NOW(), NOW()),
('REE-002', 'Reebok Nano X1', 1500000, 2100000, 35, 6, 4, 1, NOW(), NOW()),
('REE-003', 'Reebok Zig Kinetica', 1200000, 1800000, 40, 6, 1, 1, NOW(), NOW()),
('REE-004', 'Reebok Question Mid', 1400000, 2000000, 30, 6, 2, 1, NOW(), NOW()),
('REE-005', 'Reebok Floatride Energy', 1300000, 1900000, 45, 6, 1, 1, NOW(), NOW()),

-- Converse Shoes
('CON-001', 'Converse Chuck Taylor All Star', 800000, 1200000, 70, 7, 3, 1, NOW(), NOW()),
('CON-002', 'Converse One Star', 900000, 1300000, 50, 7, 3, 1, NOW(), NOW()),
('CON-003', 'Converse Pro Leather', 1000000, 1500000, 40, 7, 2, 1, NOW(), NOW()),
('CON-004', 'Converse Jack Purcell', 850000, 1250000, 55, 7, 3, 1, NOW(), NOW()),
('CON-005', 'Converse Fastbreak', 1100000, 1600000, 35, 7, 2, 1, NOW(), NOW()),

-- Vans Shoes
('VANS-001', 'Vans Old Skool', 700000, 1100000, 65, 8, 3, 1, NOW(), NOW()),
('VANS-002', 'Vans Authentic', 600000, 1000000, 70, 8, 3, 1, NOW(), NOW()),
('VANS-003', 'Vans Sk8-Hi', 800000, 1200000, 55, 8, 3, 1, NOW(), NOW()),
('VANS-004', 'Vans ComfyCush Era', 750000, 1150000, 60, 8, 3, 1, NOW(), NOW()),
('VANS-005', 'Vans Ultrarange', 1200000, 1800000, 40, 8, 1, 1, NOW(), NOW()),

-- ASICS Shoes
('ASI-001', 'ASICS Gel-Kayano 28', 1400000, 2000000, 40, 9, 1, 1, NOW(), NOW()),
('ASI-002', 'ASICS Gel-Nimbus 23', 1500000, 2100000, 35, 9, 1, 1, NOW(), NOW()),
('ASI-003', 'ASICS Gel-Quantum 360', 1600000, 2200000, 30, 9, 1, 1, NOW(), NOW()),
('ASI-004', 'ASICS Gel-Cumulus 23', 1300000, 1900000, 45, 9, 1, 1, NOW(), NOW()),
('ASI-005', 'ASICS Gel-Contend 7', 1000000, 1500000, 50, 9, 3, 1, NOW(), NOW()),

-- Saucony Shoes
('SAU-001', 'Saucony Ride 14', 1300000, 1900000, 40, 10, 1, 1, NOW(), NOW()),
('SAU-002', 'Saucony Kinvara 12', 1200000, 1800000, 35, 10, 1, 1, NOW(), NOW()),
('SAU-003', 'Saucony Triumph 18', 1500000, 2100000, 30, 10, 1, 1, NOW(), NOW()),
('SAU-004', 'Saucony Guide 14', 1400000, 2000000, 35, 10, 1, 1, NOW(), NOW()),
('SAU-005', 'Saucony Freedom 4', 1600000, 2200000, 25, 10, 1, 1, NOW(), NOW());

-- 4. INSERT BATCHES
INSERT INTO batches (sku, import_date, total_quantity, remain_quantity) VALUES
-- Nike batches
('NIKE-001', '2024-06-01', 50, 30),
('NIKE-002', '2024-06-05', 30, 15),
('NIKE-003', '2024-06-10', 45, 25),
('NIKE-004', '2024-06-15', 35, 20),
('NIKE-005', '2024-06-20', 40, 30),

-- Adidas batches
('ADIDAS-001', '2024-06-02', 55, 35),
('ADIDAS-002', '2024-06-08', 40, 25),
('ADIDAS-003', '2024-06-12', 30, 15),
('ADIDAS-004', '2024-06-18', 60, 40),
('ADIDAS-005', '2024-06-25', 25, 10),

-- Puma batches
('PUMA-001', '2024-06-03', 50, 30),
('PUMA-002', '2024-06-09', 45, 25),
('PUMA-003', '2024-06-14', 35, 20),
('PUMA-004', '2024-06-19', 40, 30),
('PUMA-005', '2024-06-26', 30, 15),

-- Under Armour batches
('UA-001', '2024-06-04', 40, 25),
('UA-002', '2024-06-11', 30, 15),
('UA-003', '2024-06-16', 45, 30),
('UA-004', '2024-06-21', 35, 20),
('UA-005', '2024-06-27', 50, 35),

-- New Balance batches
('NB-001', '2024-06-06', 40, 25),
('NB-002', '2024-06-13', 35, 20),
('NB-003', '2024-06-17', 25, 10),
('NB-004', '2024-06-22', 55, 35),
('NB-005', '2024-06-28', 30, 15);

-- 5. INSERT ORDERS (cho tháng 6/2024) - SAU KHI ĐÃ CÓ CUSTOMERS
INSERT INTO orders (order_code, customer_id, shipping_location, platform, order_date, status, refund_reason, created_at, updated_at) VALUES
-- Orders ngày 30/6/2024
('ORD-20240630-001', 1, 'Hà Nội', 'Shopee', '2024-06-30 09:15:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240630-002', 2, 'TP.HCM', 'Lazada', '2024-06-30 10:30:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240630-003', 3, 'Đà Nẵng', 'Tiki', '2024-06-30 11:45:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240630-004', 4, 'Hà Nội', 'Shopee', '2024-06-30 12:20:00', 'refunded', 'Khách đổi ý', NOW(), NOW()),
('ORD-20240630-005', 5, 'TP.HCM', 'Lazada', '2024-06-30 13:10:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240630-006', 6, 'Hải Phòng', 'Tiki', '2024-06-30 14:25:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240630-007', 7, 'Cần Thơ', 'Shopee', '2024-06-30 15:40:00', 'refunded', 'Không đúng mô tả', NOW(), NOW()),
('ORD-20240630-008', 8, 'Hà Nội', 'Lazada', '2024-06-30 16:55:00', 'completed', NULL, NOW(), NOW()),

-- Orders ngày 29/6/2024
('ORD-20240629-001', 9, 'TP.HCM', 'Shopee', '2024-06-29 08:30:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240629-002', 10, 'Hà Nội', 'Lazada', '2024-06-29 09:45:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240629-003', 11, 'Đà Nẵng', 'Tiki', '2024-06-29 10:20:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240629-004', 12, 'TP.HCM', 'Shopee', '2024-06-29 11:35:00', 'refunded', 'Hư hỏng', NOW(), NOW()),
('ORD-20240629-005', 13, 'Hà Nội', 'Lazada', '2024-06-29 12:50:00', 'completed', NULL, NOW(), NOW()),

-- Orders ngày 28/6/2024
('ORD-20240628-001', 14, 'Hải Phòng', 'Shopee', '2024-06-28 09:10:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240628-002', 15, 'TP.HCM', 'Lazada', '2024-06-28 10:25:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240628-003', 16, 'Cần Thơ', 'Tiki', '2024-06-28 11:40:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240628-004', 17, 'Hà Nội', 'Shopee', '2024-06-28 12:55:00', 'refunded', 'Kích thước không phù hợp', NOW(), NOW()),
('ORD-20240628-005', 18, 'Đà Nẵng', 'Lazada', '2024-06-28 13:20:00', 'completed', NULL, NOW(), NOW()),

-- Orders ngày 27/6/2024
('ORD-20240627-001', 19, 'TP.HCM', 'Shopee', '2024-06-27 08:45:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240627-002', 20, 'Hà Nội', 'Lazada', '2024-06-27 09:30:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240627-003', 21, 'Hải Phòng', 'Tiki', '2024-06-27 10:15:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240627-004', 22, 'Cần Thơ', 'Shopee', '2024-06-27 11:00:00', 'refunded', 'Màu sắc không đúng', NOW(), NOW()),
('ORD-20240627-005', 23, 'Đà Nẵng', 'Lazada', '2024-06-27 12:45:00', 'completed', NULL, NOW(), NOW()),

-- Orders ngày 26/6/2024
('ORD-20240626-001', 24, 'Hà Nội', 'Shopee', '2024-06-26 09:20:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240626-002', 25, 'TP.HCM', 'Lazada', '2024-06-26 10:35:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240626-003', 26, 'Đà Nẵng', 'Tiki', '2024-06-26 11:50:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240626-004', 27, 'Hải Phòng', 'Shopee', '2024-06-26 12:05:00', 'completed', NULL, NOW(), NOW()),
('ORD-20240626-005', 28, 'Cần Thơ', 'Lazada', '2024-06-26 13:20:00', 'refunded', 'Vấn đề giao hàng', NOW(), NOW());

-- 6. INSERT ORDER_ITEMS
INSERT INTO order_items (order_id, item_id, quantity, price_per_unit, discount_amount, created_at, updated_at) VALUES
-- Order 1 (ORD-20240630-001) - Nike Air Zoom Pegasus 38
(1, 1, 1, 1800000, 0, NOW(), NOW()),

-- Order 2 (ORD-20240630-002) - Adidas Ultraboost 21
(2, 6, 1, 2200000, 100000, NOW(), NOW()),

-- Order 3 (ORD-20240630-003) - Puma RS-X 3D
(3, 11, 1, 1500000, 0, NOW(), NOW()),

-- Order 4 (ORD-20240630-004) - Nike LeBron 18 (refunded)
(4, 4, 1, 2500000, 0, NOW(), NOW()),

-- Order 5 (ORD-20240630-005) - Under Armour HOVR Phantom
(5, 16, 1, 2000000, 150000, NOW(), NOW()),

-- Order 6 (ORD-20240630-006) - New Balance Fresh Foam 1080v11
(6, 21, 1, 1900000, 0, NOW(), NOW()),

-- Order 7 (ORD-20240630-007) - Reebok Classic Leather (refunded)
(7, 26, 1, 1300000, 0, NOW(), NOW()),

-- Order 8 (ORD-20240630-008) - Converse Chuck Taylor All Star
(8, 31, 1, 1200000, 50000, NOW(), NOW()),

-- Order 9 (ORD-20240629-001) - Vans Old Skool
(9, 36, 1, 1100000, 0, NOW(), NOW()),

-- Order 10 (ORD-20240629-002) - ASICS Gel-Kayano 28
(10, 41, 1, 2000000, 100000, NOW(), NOW()),

-- Order 11 (ORD-20240629-003) - Saucony Ride 14
(11, 46, 1, 1900000, 0, NOW(), NOW()),

-- Order 12 (ORD-20240629-004) - Nike ZoomX Vaporfly NEXT% (refunded)
(12, 2, 1, 3500000, 0, NOW(), NOW()),

-- Order 13 (ORD-20240629-005) - Adidas Solarboost 3
(13, 7, 1, 1900000, 0, NOW(), NOW()),

-- Order 14 (ORD-20240628-001) - Puma Future Rider
(14, 12, 1, 1300000, 50000, NOW(), NOW()),

-- Order 15 (ORD-20240628-002) - Under Armour Curry 8
(15, 17, 1, 2500000, 200000, NOW(), NOW()),

-- Order 16 (ORD-20240628-003) - New Balance 990v5
(16, 22, 1, 2200000, 0, NOW(), NOW()),

-- Order 17 (ORD-20240628-004) - Reebok Nano X1 (refunded)
(17, 27, 1, 2100000, 0, NOW(), NOW()),

-- Order 18 (ORD-20240628-005) - Converse One Star
(18, 32, 1, 1300000, 0, NOW(), NOW()),

-- Order 19 (ORD-20240627-001) - Vans Authentic
(19, 37, 1, 1000000, 0, NOW(), NOW()),

-- Order 20 (ORD-20240627-002) - ASICS Gel-Nimbus 23
(20, 42, 1, 2100000, 100000, NOW(), NOW()),

-- Order 21 (ORD-20240627-003) - Saucony Kinvara 12
(21, 47, 1, 1800000, 0, NOW(), NOW()),

-- Order 22 (ORD-20240627-004) - Nike Air Max 270 (refunded)
(22, 3, 1, 2000000, 0, NOW(), NOW()),

-- Order 23 (ORD-20240627-005) - Adidas Harden Vol. 5
(23, 8, 1, 2400000, 150000, NOW(), NOW()),

-- Order 24 (ORD-20240626-001) - Puma Clyde Court
(24, 13, 1, 2200000, 0, NOW(), NOW()),

-- Order 25 (ORD-20240626-002) - Under Armour Charged Bandit
(25, 18, 1, 1700000, 0, NOW(), NOW()),

-- Order 26 (ORD-20240626-003) - New Balance FuelCell Elite
(26, 23, 1, 2800000, 200000, NOW(), NOW()),

-- Order 27 (ORD-20240626-004) - Reebok Zig Kinetica
(27, 28, 1, 1800000, 0, NOW(), NOW()),

-- Order 28 (ORD-20240626-005) - Converse Pro Leather (refunded)
(28, 33, 1, 1500000, 0, NOW(), NOW()),

-- Thêm một số order items với số lượng > 1
-- Order 29 - Multiple items
(29, 1, 2, 1800000, 100000, NOW(), NOW()), -- 2 Nike Air Zoom
(29, 6, 1, 2200000, 0, NOW(), NOW()),     -- 1 Adidas Ultraboost

-- Order 30 - Multiple items
(30, 11, 1, 1500000, 0, NOW(), NOW()),    -- 1 Puma RS-X
(30, 16, 2, 2000000, 150000, NOW(), NOW()), -- 2 Under Armour HOVR

-- Order 31 - Multiple items
(31, 21, 1, 1900000, 0, NOW(), NOW()),    -- 1 New Balance
(31, 26, 1, 1300000, 0, NOW(), NOW()),    -- 1 Reebok Classic
(31, 31, 1, 1200000, 50000, NOW(), NOW()), -- 1 Converse Chuck

-- Order 32 - Multiple items
(32, 36, 2, 1100000, 0, NOW(), NOW()),    -- 2 Vans Old Skool
(32, 41, 1, 2000000, 100000, NOW(), NOW()), -- 1 ASICS Gel-Kayano

-- Order 33 - Multiple items
(33, 46, 1, 1900000, 0, NOW(), NOW()),    -- 1 Saucony Ride
(33, 2, 1, 3500000, 200000, NOW(), NOW()), -- 1 Nike ZoomX
(33, 7, 1, 1900000, 0, NOW(), NOW());      -- 1 Adidas Solarboost

-- Cập nhật stock_quantity cho items dựa trên số lượng đã bán
-- UPDATE items SET stock_quantity = stock_quantity - (
--     SELECT COALESCE(SUM(oi.quantity), 0)
--     FROM order_items oi
--     JOIN orders o ON oi.order_id = o.id
--     WHERE oi.item_id = items.id AND o.status = 'completed'
-- );

-- Cập nhật remain_quantity cho batches
UPDATE batches b SET remain_quantity = b.total_quantity - (
    SELECT COALESCE(SUM(oi.quantity), 0)
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN items i ON oi.item_id = i.id
    WHERE i.sku = b.sku AND o.status = 'completed'
);

-- Hiển thị thống kê
SELECT 'CUSTOMERS' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'BRANDS', COUNT(*) FROM brands
UNION ALL
SELECT 'CATEGORIES', COUNT(*) FROM categories
UNION ALL
SELECT 'ITEMS', COUNT(*) FROM items
UNION ALL
SELECT 'BATCHES', COUNT(*) FROM batches
UNION ALL
SELECT 'ORDERS', COUNT(*) FROM orders
UNION ALL
SELECT 'ORDER_ITEMS', COUNT(*) FROM order_items;