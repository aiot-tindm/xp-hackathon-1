# CSV Import Data

Thư mục này chứa các file CSV mẫu để import data vào hệ thống quản lý kho và bán hàng.

## Cấu trúc Data theo Schema Prisma

### 1. Brands (brands.csv)
- **name**: Tên thương hiệu (unique)

### 2. Categories (categories.csv)
- **name**: Tên danh mục sản phẩm (unique)

### 3. Customers (customers.csv)
- **name**: Tên khách hàng
- **email**: Email (unique)
- **phoneNumber**: Số điện thoại (optional)

### 4. Items (items.csv)
- **sku**: Mã sản phẩm (unique)
- **name**: Tên sản phẩm
- **costPrice**: Giá nhập
- **salePrice**: Giá bán
- **stockQuantity**: Số lượng tồn kho
- **brand**: Tên thương hiệu (reference to brands)
- **category**: Tên danh mục (reference to categories)
- **isActive**: Trạng thái hoạt động

### 5. Orders (orders.csv)
- **orderCode**: Mã đơn hàng (unique)
- **customerId**: ID khách hàng (reference to customers)
- **shippingLocation**: Địa chỉ giao hàng
- **platform**: Nền tảng bán hàng (Shopee, Lazada, Website)
- **orderDate**: Ngày đặt hàng
- **status**: Trạng thái đơn hàng (completed, cancelled)
- **refundReason**: Lý do hoàn tiền (optional)

### 6. Order Items (order_items.csv)
- **orderCode**: Mã đơn hàng (reference to orders)
- **sku**: Mã sản phẩm (reference to items)
- **quantity**: Số lượng
- **pricePerUnit**: Giá bán đơn vị
- **discountAmount**: Số tiền giảm giá

## Thời gian Data

Data được tạo trong khoảng thời gian **6 tháng** (từ tháng 1 đến tháng 6 năm 2024) với các pattern đột biến thú vị:

### Pattern Đột Biến theo Tháng:

1. **Tháng 1**: 30 đơn hàng (bình thường)
2. **Tháng 2**: 150 đơn hàng (Tết - cao điểm mua sắm)
3. **Tháng 3**: 80 đơn hàng (giảm sau Tết)
4. **Tháng 4**: 120 đơn hàng (tăng dần)
5. **Tháng 5**: 200 đơn hàng (Black Friday - cao điểm)
6. **Tháng 6**: 150 đơn hàng (cuối năm học)

### Các Sự Kiện Đặc Biệt:
- **Tết Nguyên Đán** (tháng 2): Tăng đột biến 5x so với tháng 1
- **Black Friday** (tháng 5): Tăng đột biến 6.7x so với tháng 1
- **Cuối năm học** (tháng 6): Tăng 5x so với tháng 1

## Đa dạng Data

### Sản phẩm (40 sản phẩm)
- **Electronics**: iPhone, Samsung, MacBook, iPad, AirPods, Headphones, Speakers
- **Footwear**: Nike, Adidas, Puma, Converse, Vans
- **Clothing**: Nike, Adidas, Puma sportswear
- **Sports**: Bags, Balls, Gloves, Water bottles

### Khách hàng (50 khách hàng)
- Phân bố khắp 63 tỉnh thành Việt Nam
- Đa dạng tên và thông tin liên hệ

### Đơn hàng (634 đơn hàng)
- **3 nền tảng**: Shopee, Lazada, Website
- **6 tháng**: Từ tháng 1 đến tháng 6/2024
- **Địa lý**: Khắp các tỉnh thành Việt Nam
- **Pattern đột biến**: Tết, Black Friday, cuối năm học

### Order Items (1,252 items)
- Trung bình 2.0 items/đơn hàng
- Đa dạng sản phẩm và số lượng
- Giảm giá từ 0-20%

## API Import

### Import từng bảng riêng lẻ:

```bash
# Import brands
curl -X POST http://localhost:4001/api/import/brands \
  -F "csv=@database/csv-data/brands.csv"

# Import categories
curl -X POST http://localhost:4001/api/import/categories \
  -F "csv=@database/csv-data/categories.csv"

# Import customers
curl -X POST http://localhost:4001/api/import/customers \
  -F "csv=@database/csv-data/customers.csv"

# Import items
curl -X POST http://localhost:4001/api/import/items \
  -F "csv=@database/csv-data/items.csv"

# Import orders
curl -X POST http://localhost:4001/api/import/orders \
  -F "csv=@database/csv-data/orders.csv"

# Import order items
curl -X POST http://localhost:4001/api/import/order-items \
  -F "csv=@database/csv-data/order_items.csv"
```

### Import tất cả data cùng lúc:

```bash
# Import tất cả data theo thứ tự: brands -> categories -> customers -> items -> orders -> order-items
curl -X POST http://localhost:4001/api/import/all \
  -F "brands=@database/csv-data/brands.csv" \
  -F "categories=@database/csv-data/categories.csv" \
  -F "customers=@database/csv-data/customers.csv" \
  -F "items=@database/csv-data/items.csv" \
  -F "orders=@database/csv-data/orders.csv" \
  -F "order_items=@database/csv-data/order_items.csv"
```

### Sử dụng Postman:

1. **Import từng file riêng lẻ:**
   - Method: POST
   - URL: `http://localhost:4001/api/import/brands`
   - Body: form-data
   - Key: `csv` (File)
   - Value: Chọn file CSV tương ứng

2. **Import tất cả cùng lúc:**
   - Method: POST
   - URL: `http://localhost:4001/api/import/all`
   - Body: form-data
   - Keys: `brands`, `categories`, `customers`, `items`, `orders`, `order_items` (File)
   - Values: Chọn các file CSV tương ứng

## Thứ tự Import

Để đảm bảo tính toàn vẹn dữ liệu, nên import theo thứ tự:

1. **Brands** (trước tiên vì items reference đến brands)
2. **Categories** (trước tiên vì items reference đến categories)
3. **Customers** (trước tiên vì orders reference đến customers)
4. **Items** (reference đến brands và categories)
5. **Orders** (reference đến customers)
6. **Order Items** (reference đến orders và items)

## Lưu ý

- API sẽ tự động skip các record không tìm thấy reference
- Brands và Categories sử dụng upsert (update nếu tồn tại, create nếu chưa có)
- Customers sử dụng upsert dựa trên email
- Items sử dụng upsert dựa trên SKU
- Orders sử dụng upsert dựa trên orderCode
- Order Items sử dụng create (có thể duplicate nếu chạy nhiều lần)
- Tất cả date fields được parse từ string sang Date object
- Decimal fields được parse từ string sang number

## Biểu đồ và Analytics

Sau khi import data, có thể sử dụng các API analytics để tạo biểu đồ:

- **Sales by month**: Phân tích doanh số theo tháng (6 tháng với pattern đột biến)
- **Top products**: Sản phẩm bán chạy nhất
- **Platform performance**: Hiệu suất theo nền tảng (Shopee, Lazada, Website)
- **Geographic distribution**: Phân bố theo địa lý (63 tỉnh thành)
- **Brand performance**: Hiệu suất theo thương hiệu
- **Category performance**: Hiệu suất theo danh mục
- **Customer loyalty**: Phân tích khách hàng thân thiết
- **Inventory turnover**: Tốc độ luân chuyển kho
- **Seasonal trends**: Xu hướng theo mùa (Tết, Black Friday)
- **Peak analysis**: Phân tích các đỉnh cao doanh số 