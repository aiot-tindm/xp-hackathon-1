# 🧠 Customer Analytics System

## 🎯 Overview

Hệ thống phân tích khách hàng toàn diện để hiểu rõ hành vi mua hàng, phân loại khách hàng và đưa ra chiến lược chăm sóc khách hàng hiệu quả. **Note**: Core Business APIs (Products, Orders, Brands, Categories) are documented separately in `docs/API_DOCUMENTATION.md`.

## ✅ Implementation Status

**🎉 Customer Analytics System đã được triển khai hoàn chỉnh với 6 API endpoints!**

### 📊 API Endpoints Implemented
1. **Customer Analytics Overview** - `GET /api/analytics/customers`
2. **Individual Customer Analysis** - `GET /api/analytics/customers/:customerId`
3. **Customer Predictions & Trends** - `POST /api/analytics/customers/predictions` (includes recommendations)
4. **Customer RFM Analysis** - `GET /api/analytics/customers/rfm`
5. **Customer Churn Prediction** - `GET /api/analytics/customers/churn-prediction`
6. **Potential Customer Suggestions & New Inventory Matching** - `GET /api/analytics/customers/new-inventory-matching` (combines both functionalities)


### 🔧 Technical Implementation
- **Controller**: `backend/src/controllers/customerAnalyticsController.ts`
- **Routes**: `backend/src/routes/customerAnalyticsRoutes.ts`
- **Testing**: `backend/test/customer-analytics.test.js`
- **Postman Collection**: `postman/Customer-Analytics-API.postman_collection.json`

## 📊 Customer Segmentation Framework

### 🐋 Whale Customers (Khách hàng VIP cao cấp)
- **Criteria**: 
  - Tổng chi tiêu > 50 triệu VND
  - Số đơn hàng ≥ 10
  - Giá trị đơn hàng trung bình > 3 triệu VND
- **Characteristics**: 
  - Mua sắm thường xuyên, giá trị cao
  - Thích sản phẩm premium
  - Ít quan tâm giá, quan tâm chất lượng
- **Strategy**: 
  - Dịch vụ VIP cá nhân
  - Sản phẩm độc quyền
  - Ưu đãi đặc biệt

### 👑 VIP Customers (Khách hàng VIP)
- **Criteria**:
  - Tổng chi tiêu 10-50 triệu VND
  - Số đơn hàng 5-15
  - Giá trị đơn hàng trung bình 1-3 triệu VND
- **Characteristics**:
  - Mua sắm định kỳ
  - Quan tâm cả giá và chất lượng
  - Trung thành với thương hiệu
- **Strategy**:
  - Chương trình loyalty
  - Ưu đãi theo tier
  - Dịch vụ chăm sóc đặc biệt

### 👥 Regular Customers (Khách hàng thường xuyên)
- **Criteria**:
  - Tổng chi tiêu 2-10 triệu VND
  - Số đơn hàng 3-8
  - Giá trị đơn hàng trung bình 500K-1 triệu VND
- **Characteristics**:
  - Mua sắm theo nhu cầu
  - Quan tâm giá cả
  - Có thể chuyển đổi thương hiệu
- **Strategy**:
  - Khuyến mãi định kỳ
  - Cross-selling
  - Tăng tần suất mua hàng

### 🆕 New Customers (Khách hàng mới)
- **Criteria**:
  - Số đơn hàng 1-2
  - Thời gian mua hàng < 30 ngày
- **Characteristics**:
  - Đang khám phá thương hiệu
  - Chưa có thói quen mua hàng
  - Dễ bị ảnh hưởng bởi marketing
- **Strategy**:
  - Onboarding tốt
  - Ưu đãi chào mừng
  - Tạo trải nghiệm tích cực

### 🚶 Churn Customers (Khách hàng rời đi)
- **Criteria**:
  - Không mua hàng > 90 ngày
  - Có lịch sử mua hàng trước đó
- **Characteristics**:
  - Không hài lòng với sản phẩm/dịch vụ
  - Chuyển sang đối thủ cạnh tranh
  - Giảm nhu cầu mua hàng
- **Strategy**:
  - Win-back campaigns
  - Khảo sát lý do rời đi
  - Ưu đãi đặc biệt

## 📈 Key Metrics & KPIs

### 1. Customer Value Metrics
- **Total Spent**: Tổng chi tiêu của khách hàng
- **Average Order Value (AOV)**: Giá trị đơn hàng trung bình
- **Order Frequency**: Tần suất mua hàng
- **Customer Lifetime Value (CLV)**: Giá trị khách hàng trong suốt thời gian sử dụng
- **Recency**: Thời gian từ lần mua hàng cuối

### 2. Behavioral Metrics
- **Product Category Preference**: Sản phẩm ưa thích
- **Brand Loyalty**: Mức độ trung thành với thương hiệu
- **Seasonal Patterns**: Mô hình mua hàng theo mùa
- **Platform Preference**: Kênh mua hàng ưa thích
- **Time of Purchase**: Thời gian mua hàng

### 3. Engagement Metrics
- **Response to Promotions**: Phản ứng với khuyến mãi
- **Cross-selling Success**: Tỷ lệ mua thêm sản phẩm
- **Return Rate**: Tỷ lệ trả hàng
- **Customer Satisfaction**: Mức độ hài lòng

## 🔧 Technical Implementation

### 🎛️ Dynamic Segmentation Configuration

Hệ thống Customer Analytics hỗ trợ **cấu hình động** cho các tiêu chí phân loại khách hàng, cho phép tùy chỉnh theo từng hệ thống và tệp khách hàng khác nhau.

#### Configuration Interface
```typescript
interface SegmentationConfig {
  whale: {
    minTotalSpent: number;    // Ngưỡng chi tiêu tối thiểu
    minOrders: number;        // Số đơn hàng tối thiểu
    minAvgOrderValue: number; // Giá trị đơn hàng trung bình tối thiểu
  };
  vip: {
    minTotalSpent: number;    // Ngưỡng chi tiêu tối thiểu
    maxTotalSpent: number;    // Ngưỡng chi tiêu tối đa
    minOrders: number;        // Số đơn hàng tối thiểu
    minAvgOrderValue: number; // Giá trị đơn hàng trung bình tối thiểu
  };
  regular: {
    minTotalSpent: number;    // Ngưỡng chi tiêu tối thiểu
    maxTotalSpent: number;    // Ngưỡng chi tiêu tối đa
    minOrders: number;        // Số đơn hàng tối thiểu
  };
  churn: {
    maxDaysSinceLastOrder: number; // Số ngày tối đa không mua hàng
  };
}
```

#### Default Configuration (Based on CSV Data Analysis)
```typescript
const DEFAULT_SEGMENTATION_CONFIG: SegmentationConfig = {
  whale: {
    minTotalSpent: 600,         // $600 USD - Top 5% customers
    minOrders: 8,               // Above average (12.7/2)
    minAvgOrderValue: 60        // $60 USD per order
  },
  vip: {
    minTotalSpent: 200,         // $200 USD
    maxTotalSpent: 600,         // $600 USD
    minOrders: 5,               // Moderate frequency
    minAvgOrderValue: 32        // $32 USD per order
  },
  regular: {
    minTotalSpent: 40,          // $40 USD
    maxTotalSpent: 200,         // $200 USD
    minOrders: 3                // At least 3 orders in 6 months
  },
  churn: {
    maxDaysSinceLastOrder: 90   // 90 days (3 months) - reasonable for 6-month data
  }
};
```

**CSV Data Analysis:**
- **634 orders** trong 6 tháng (Jan-Jun 2024)
- **50 customers** (trung bình 12.7 orders/customer)
- **Order values**: $50 - $7,000 USD
- **Peak months**: Feb (Tết), May (Black Friday)
- **Products**: Electronics, Fashion, Sports (Apple, Samsung, Nike, Adidas)
- **Currency**: All values in USD ($) to match CSV data format

#### Usage Examples

**1. E-commerce với giá trị cao (hàng xa xỉ):**
```http
GET /api/analytics/customers/segmentation?businessType=high_value
```

**2. E-commerce với tần suất mua hàng cao (nhu yếu phẩm):**
```http
GET /api/analytics/customers/segmentation?businessType=high_frequency
```

**3. E-commerce doanh nghiệp nhỏ:**
```http
GET /api/analytics/customers/segmentation?businessType=small_business
```

**4. E-commerce tổng quát (mặc định):**
```http
GET /api/analytics/customers/segmentation?businessType=default
```

**5. E-commerce điện tử (iPhone, Samsung, MacBook):**
```http
GET /api/analytics/customers/segmentation?businessType=electronics
```

**6. E-commerce thời trang thể thao (Nike, Adidas, Puma):**
```http
GET /api/analytics/customers/segmentation?businessType=fashion
```

### Database Schema Analysis
```sql
-- Customer Analysis Tables
customers: id, name, email, phone, created_at
orders: id, customer_id, order_date, platform, status, total_amount
order_items: id, order_id, item_id, quantity, price_per_unit, discount
items: id, sku, name, brand_id, category_id, price, stock_quantity
brands: id, name
categories: id, name
```

### Analytics Algorithms

#### 1. RFM Analysis (Recency, Frequency, Monetary)
```javascript
// RFM Scoring Algorithm
const calculateRFM = (customer) => {
  const recency = daysSinceLastOrder(customer.lastOrderDate);
  const frequency = customer.totalOrders;
  const monetary = customer.totalSpent;
  
  return {
    recencyScore: scoreRecency(recency),
    frequencyScore: scoreFrequency(frequency),
    monetaryScore: scoreMonetary(monetary),
    rfmScore: recencyScore + frequencyScore + monetaryScore
  };
};
```

#### 2. K-Means Clustering
```python
# Customer Segmentation using K-Means
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

features = ['total_spent', 'total_orders', 'avg_order_value', 'days_since_last_order']
X = StandardScaler().fit_transform(customer_data[features])
kmeans = KMeans(n_clusters=5, random_state=42)
segments = kmeans.fit_predict(X)
```

#### 3. Purchase Pattern Analysis
```javascript
// Analyze purchase patterns
const analyzePatterns = (orders) => {
  return {
    categoryPreference: analyzeCategoryPreference(orders),
    brandLoyalty: analyzeBrandLoyalty(orders),
    seasonalTrends: analyzeSeasonalTrends(orders),
    priceSensitivity: analyzePriceSensitivity(orders)
  };
};
```

## 🚀 API Endpoints Documentation

### 1. Customer Analytics Overview
```http
GET /api/analytics/customers
```

**Mô tả**: Tổng quan phân tích khách hàng với thống kê chi tiết và phân loại khách hàng theo cấu hình động.

**Query Parameters:**
- `days` (optional): Số ngày phân tích (mặc định: 30)
- `start` (optional): Ngày bắt đầu (format: YYYY-MM-DD)
- `end` (optional): Ngày kết thúc (format: YYYY-MM-DD)
- `category` (optional): Filter theo danh mục sản phẩm
- `limit` (optional): Số lượng khách hàng chi tiết (mặc định: 10)
- `segment` (optional): Filter theo phân loại khách hàng (whale, vip, regular, new, churn)
- `order_count_gte` (optional): Số lượng order tối thiểu
- `order_count_lte` (optional): Số lượng order tối đa
- `total_spent_gte` (optional): Tổng chi tiêu tối thiểu (USD)
- `total_spent_lte` (optional): Tổng chi tiêu tối đa (USD)
- `avg_order_value_gte` (optional): Giá trị đơn hàng trung bình tối thiểu (USD)
- `avg_order_value_lte` (optional): Giá trị đơn hàng trung bình tối đa (USD)
- `daysSinceLastOrder_gte` (optional): Số ngày từ lần mua cuối tối thiểu
- `daysSinceLastOrder_lte` (optional): Số ngày từ lần mua cuối tối đa
- `previousLastOrder_gte` (optional): Ngày mua hàng gần nhất thứ 2 từ ngày (format: YYYY-MM-DD)
- `previousLastOrder_lte` (optional): Ngày mua hàng gần nhất thứ 2 đến ngày (format: YYYY-MM-DD)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCustomers": 150,
      "newCustomers": 25,
      "segments": {
        "whale": 5,
        "vip": 20,
        "regular": 80,
        "new": 25,
        "churn": 20
      }
    },
    "customers": [
      {
        "id": 1,
        "name": "John Smith",
        "email": "john.smith@email.com",
        "totalSpent": 2500,
        "totalOrders": 12,
        "totalItems": 25,
        "avgOrderValue": 208.33,
        "lastOrderDate": "2024-06-15T10:30:00Z",
        "previousLastOrder": "2024-05-20T14:15:00Z",
        "daysSinceLastOrder": 30,
        "segment": "vip",
        "topCategories": ["Electronics", "Footwear", "Clothing"],
        "categoryBreakdown": {
          "Electronics": { "orders": 5, "spent": 1200, "items": 8 },
          "Footwear": { "orders": 4, "spent": 600, "items": 6 },
          "Clothing": { "orders": 3, "spent": 700, "items": 11 }
        },
        "clv": 45000,
        "clvRank": 1
      }
    ]
  }
}
```

**Usage Examples:**
```bash
# Phân tích 30 ngày gần nhất
GET /api/analytics/customers

# Phân tích theo khoảng thời gian cụ thể
GET /api/analytics/customers?start=2024-01-01&end=2024-06-30

# Filter theo danh mục Electronics
GET /api/analytics/customers?category=Electronics

# Hiển thị top 20 khách hàng
GET /api/analytics/customers?limit=20

# Kết hợp nhiều filter
GET /api/analytics/customers?start=2024-01-01&end=2024-06-30&category=Electronics&limit=15

# Filter theo segment VIP
GET /api/analytics/customers?segment=vip&limit=20

# Filter theo số lượng order
GET /api/analytics/customers?order_count_gte=5&order_count_lte=20&limit=15

# Filter theo tổng chi tiêu
GET /api/analytics/customers?total_spent_gte=1000&total_spent_lte=10000&limit=10

# Filter theo giá trị đơn hàng trung bình
GET /api/analytics/customers?avg_order_value_gte=100&avg_order_value_lte=500&limit=10

# Kết hợp nhiều filter phức tạp
GET /api/analytics/customers?segment=vip&order_count_gte=3&total_spent_gte=5000&limit=10

# Filter theo số ngày từ lần mua cuối
GET /api/analytics/customers?daysSinceLastOrder_gte=60&limit=20

# Khách hàng VIP có nguy cơ churn (không mua > 60 ngày)
GET /api/analytics/customers?segment=vip&daysSinceLastOrder_gte=60&limit=20

# Khách hàng hoạt động gần đây (mua trong 30 ngày qua)
GET /api/analytics/customers?daysSinceLastOrder_lte=30&order_count_gte=3&limit=15

# Khách hàng có pattern mua hàng ổn định
GET /api/analytics/customers?previousLastOrder_gte=2024-01-01&limit=10

# Khách hàng không hoạt động 30-60 ngày (cần reactivation)
GET /api/analytics/customers?daysSinceLastOrder_gte=30&daysSinceLastOrder_lte=60&limit=50
```

### 2. Individual Customer Analysis
```http
GET /api/analytics/customers/:customerId
```

**Mô tả**: Phân tích chi tiết một khách hàng cụ thể dựa trên ID, bao gồm thông tin mua hàng, phân loại, và đề xuất.

**Path Parameters:**
- `customerId` (required): ID của khách hàng cần phân tích

**Query Parameters:**
- `days` (optional): Thời gian phân tích (mặc định: 365 ngày)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 1,
      "name": "John Smith",
      "email": "john.smith@email.com",
      "phoneNumber": "0123456789",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "analysis": {
      "totalOrders": 12,
      "totalSpent": 2500,
      "totalItems": 25,
      "avgOrderValue": 208.33,
      "lastOrderDate": "2024-06-15T10:30:00Z",
      "daysSinceLastOrder": 30,
      "segment": "vip",
      "categoryBreakdown": {
        "Electronics": { "spent": 1200, "orders": 5, "items": 8 },
        "Footwear": { "spent": 600, "orders": 4, "items": 6 },
        "Clothing": { "spent": 700, "orders": 3, "items": 11 }
      },
      "brandBreakdown": {
        "Apple": { "spent": 800, "orders": 3, "items": 4 },
        "Nike": { "spent": 400, "orders": 2, "items": 3 }
      },
      "monthlyTrends": {
        "2024-06": { "orders": 3, "spent": 600, "items": 8 },
        "2024-05": { "orders": 2, "spent": 400, "items": 5 }
      }
    }
  }
}
```

**Response Fields Explanation:**

**📊 Customer Information:**
- `customer.id`: ID duy nhất của khách hàng
- `customer.name`: Tên khách hàng
- `customer.email`: Email liên hệ
- `customer.phoneNumber`: Số điện thoại
- `customer.createdAt`: Ngày tạo tài khoản

**📈 Basic Metrics:**
- `totalOrders`: Tổng số đơn hàng đã thực hiện
- `totalSpent`: Tổng số tiền đã chi tiêu (USD)
- `totalItems`: Tổng số sản phẩm đã mua
- `avgOrderValue`: Giá trị đơn hàng trung bình (USD)
- `lastOrderDate`: Ngày đặt đơn hàng gần nhất
- `daysSinceLastOrder`: Số ngày từ đơn hàng cuối đến hiện tại
- `segment`: Phân loại khách hàng (whale/vip/regular/new/churn)

**🏷️ Category Breakdown:**
- `categoryBreakdown`: Phân tích theo danh mục sản phẩm
  - `spent`: Tổng chi tiêu cho danh mục này (USD)
  - `orders`: Số đơn hàng có sản phẩm thuộc danh mục
  - `items`: Tổng số sản phẩm thuộc danh mục đã mua

**🏭 Brand Breakdown:**
- `brandBreakdown`: Phân tích theo thương hiệu
  - `spent`: Tổng chi tiêu cho thương hiệu này (USD)
  - `orders`: Số đơn hàng có sản phẩm của thương hiệu
  - `items`: Tổng số sản phẩm của thương hiệu đã mua

**📅 Monthly Trends:**
- `monthlyTrends`: Xu hướng mua hàng theo tháng (format: YYYY-MM)
  - `orders`: Số đơn hàng trong tháng
  - `spent`: Tổng chi tiêu trong tháng (USD)
  - `items`: Tổng số sản phẩm mua trong tháng

**💡 Business Insights:**
- **Segment Analysis**: Hiểu được giá trị khách hàng để áp dụng chiến lược phù hợp
- **Category Preference**: Xác định danh mục sản phẩm khách hàng quan tâm nhất
- **Brand Loyalty**: Đánh giá mức độ trung thành với thương hiệu
- **Purchase Frequency**: Phân tích tần suất mua hàng theo thời gian
- **Recency**: Đánh giá mức độ hoạt động gần đây của khách hàng

**Usage Examples:**
```bash
# Phân tích khách hàng ID 1 trong 365 ngày gần nhất
GET /api/analytics/customers/1

# Phân tích khách hàng ID 5 trong 90 ngày gần nhất
GET /api/analytics/customers/5?days=90
```



### 3. Customer Predictions & Trends
```http
POST /api/analytics/customers/predictions
```

**Mô tả**: Phân tích và dự đoán chi tiết cho danh sách khách hàng cụ thể, bao gồm CLV, churn risk, và recommended actions.

**Request Body:**
```json
{
  "customerIds": [1, 2, 3, 4, 5],
  "predictionType": "all",
  "months": 12,
  "businessType": "default",
  "includeRecommendations": true
}
```

**Query Parameters:**
- `customerIds` (required): Array các ID khách hàng cần phân tích
- `predictionType` (optional): Loại dự đoán ("clv", "churn", "purchase", "all") - mặc định: "all"
- `months` (optional): Số tháng để dự đoán - mặc định: 12
- `businessType` (optional): Loại business ("default", "high_value", "electronics", "fashion", "small_business") - mặc định: "default"
- `includeRecommendations` (optional): Bao gồm recommendations - mặc định: true

**Response Example:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "customerId": 1,
        "customerName": "John Smith",
        "currentCLV": 45000,
        "predictedCLV": 52000,
        "churnRisk": 0.08,
        "nextPurchaseDate": "2024-02-15T00:00:00.000Z",
        "recommendedActions": ["loyalty_program", "cross_selling"],
        "purchaseFrequency": 1.2,
        "avgOrderValue": 3750,
        "customerLifespan": 18,
        "acquisitionCost": 4500,
        "retentionRate": 0.85,
        "recommendations": {
          "products": [
            {
              "sku": "IPHONE15-PRO",
              "name": "iPhone 15 Pro",
              "reason": "Based on your preference for Electronics products",
              "confidence": 0.92,
              "algorithm": "content_based",
              "category": "Electronics",
              "brand": "Apple",
              "price": 999,
              "stockQuantity": 50
            }
          ],
          "promotions": [
            {
              "type": "loyalty_discount",
              "description": "15% off on your next purchase",
              "validUntil": "2024-02-15",
              "targetAmount": 5000,
              "discountRate": 0.15,
              "segment": "vip",
              "priority": "high"
            }
          ],
          "strategies": [
            {
              "type": "cross_selling",
              "description": "Recommend complementary products from different categories",
              "priority": "high",
              "expectedImpact": 0.15,
              "implementationCost": 0.05
            }
          ]
        }
      },
      {
        "customerId": 2,
        "customerName": "Jane Doe",
        "currentCLV": 28000,
        "predictedCLV": 32000,
        "churnRisk": 0.22,
        "nextPurchaseDate": "2024-03-01T00:00:00.000Z",
        "recommendedActions": ["retention_campaign", "discount_offer"],
        "purchaseFrequency": 0.8,
        "avgOrderValue": 2800,
        "customerLifespan": 12,
        "acquisitionCost": 3200,
        "retentionRate": 0.72,
        "recommendations": {
          "products": [
            {
              "sku": "NIKE-AIR-MAX",
              "name": "Nike Air Max",
              "reason": "Popular among customers with similar preferences",
              "confidence": 0.85,
              "algorithm": "collaborative_filtering",
              "category": "Footwear",
              "brand": "Nike",
              "price": 120,
              "stockQuantity": 25
            }
          ],
          "promotions": [
            {
              "type": "retention_offer",
              "description": "Special comeback offer",
              "validUntil": "2024-02-01",
              "targetAmount": 1500,
              "discountRate": 0.25,
              "segment": "churn",
              "priority": "high"
            }
          ],
          "strategies": [
            {
              "type": "personalization",
              "description": "Create personalized product bundles based on brand preferences",
              "priority": "medium",
              "expectedImpact": 0.12,
              "implementationCost": 0.06
            }
          ]
        }
      }
    ],
    "overallMetrics": {
      "totalPredictedRevenue": 84000,
      "avgChurnRisk": 0.15,
      "avgRetentionRate": 0.79,
      "totalCustomers": 2,
      "highValueCustomers": 1,
      "atRiskCustomers": 0
    }
  }
}
```

**Response Fields Explanation:**
- **currentCLV**: Giá trị khách hàng hiện tại (USD)
- **predictedCLV**: Giá trị khách hàng dự đoán (USD)
- **churnRisk**: Rủi ro khách hàng rời bỏ (0-1)
- **nextPurchaseDate**: Ngày mua hàng tiếp theo dự đoán
- **recommendedActions**: Các hành động khuyến nghị
- **purchaseFrequency**: Tần suất mua hàng (orders/tháng)
- **avgOrderValue**: Giá trị đơn hàng trung bình (USD)
- **customerLifespan**: Tuổi thọ khách hàng (tháng)
- **acquisitionCost**: Chi phí thu hút khách hàng (USD)
- **retentionRate**: Tỷ lệ giữ chân khách hàng (0-1)

**Usage Examples:**
```bash
# Dự đoán cho danh sách khách hàng cụ thể
curl -X POST /api/analytics/customers/predictions \
  -H "Content-Type: application/json" \
  -d '{"customerIds": [1, 2, 3, 4, 5]}'

# Dự đoán CLV cho 12 tháng tới
curl -X POST /api/analytics/customers/predictions \
  -H "Content-Type: application/json" \
  -d '{"customerIds": [1, 2, 3], "predictionType": "clv", "months": 12}'

# Dự đoán churn risk cho khách hàng VIP
curl -X POST /api/analytics/customers/predictions \
  -H "Content-Type: application/json" \
  -d '{"customerIds": [10, 15, 20], "predictionType": "churn"}'

# Dự đoán toàn diện cho top 100 khách hàng
curl -X POST /api/analytics/customers/predictions \
  -H "Content-Type: application/json" \
  -d '{"customerIds": [1,2,3,4,5,6,7,8,9,10], "predictionType": "all", "months": 24}'

# Dự đoán với recommendations cho business electronics
curl -X POST /api/analytics/customers/predictions \
  -H "Content-Type: application/json" \
  -d '{"customerIds": [1,2,3], "businessType": "electronics", "includeRecommendations": true}'

# Dự đoán chỉ CLV không bao gồm recommendations
curl -X POST /api/analytics/customers/predictions \
  -H "Content-Type: application/json" \
  -d '{"customerIds": [1,2,3], "predictionType": "clv", "includeRecommendations": false}'

# Dự đoán cho high-value business với recommendations
curl -X POST /api/analytics/customers/predictions \
  -H "Content-Type: application/json" \
  -d '{"customerIds": [10,15,20], "businessType": "high_value", "includeRecommendations": true}'
```



### 4. Customer RFM Analysis
```http
GET /api/analytics/customers/rfm
```

**Mô tả**: Phân tích RFM (Recency, Frequency, Monetary) chi tiết cho từng khách hàng với configurable thresholds và actionable insights.

**Query Parameters:**
- `customerId` (optional): ID khách hàng cụ thể
- `businessType` (optional): Loại business (default, high_value, small_business)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "customerId": 1,
        "customerName": "John Smith",
        "customerEmail": "john.smith@email.com",
        "recency": 15,
        "frequency": 8,
        "monetary": 2500,
        "recencyScore": 5,
        "frequencyScore": 4,
        "monetaryScore": 3,
        "rfmScore": 12,
        "rfmSegment": "loyal",
        "businessSegment": "vip",
        "insights": {
          "recencyInsight": "Customer purchased very recently (within 30 days)",
          "frequencyInsight": "Customer orders frequently (5-9 orders)",
          "monetaryInsight": "Customer spends moderate amounts ($2K-$10K)",
          "overallInsight": "Loyal customer with good engagement patterns"
        },
        "recommendations": [
          "Cross-selling opportunities and product recommendations",
          "Loyalty program enrollment and tier benefits",
          "Regular engagement campaigns and personalized offers"
        ],
        "lastOrderDate": "2024-01-15T10:30:00Z",
        "firstOrderDate": "2023-06-01T09:15:00Z",
        "avgOrderValue": 312.5
      }
    ],
    "summary": {
      "totalCustomers": 50,
      "avgRFMScore": 8.5,
      "segmentBreakdown": {
        "champions": 5,
        "loyal": 15,
        "at_risk": 20,
        "cant_lose": 8,
        "lost": 2
      },
      "config": {
        "businessType": "default",
        "recencyThresholds": [30, 60, 90, 180],
        "frequencyThresholds": [2, 3, 5, 10],
        "monetaryThresholds": [500, 2000, 10000, 50000]
      }
    }
  }
}
```

**Response Fields Explanation:**

**📊 Customer Information:**
- `customerId`: ID duy nhất của khách hàng
- `customerName`: Tên khách hàng
- `customerEmail`: Email liên hệ

**📈 RFM Metrics:**
- `recency`: Số ngày từ lần mua hàng cuối (days)
- `frequency`: Tổng số đơn hàng
- `monetary`: Tổng chi tiêu (USD)
- `avgOrderValue`: Giá trị đơn hàng trung bình (USD)

**🎯 RFM Scores (1-5):**
- `recencyScore`: Điểm Recency (1-5, 5 = gần đây nhất)
- `frequencyScore`: Điểm Frequency (1-5, 5 = mua nhiều nhất)
- `monetaryScore`: Điểm Monetary (1-5, 5 = chi tiêu cao nhất)
- `rfmScore`: Tổng điểm RFM (3-15)

**🏷️ Segmentation:**
- `rfmSegment`: Phân loại RFM (champions, loyal, at_risk, cant_lose, lost)
- `businessSegment`: Phân loại business (whale, vip, regular, new, churn)

**💡 Insights & Recommendations:**
- `insights`: Phân tích chi tiết cho từng component RFM
- `recommendations`: 3 hành động được đề xuất dựa trên RFM scores

**📅 Order History:**
- `lastOrderDate`: Ngày đặt hàng gần nhất
- `firstOrderDate`: Ngày đặt hàng đầu tiên

**📊 Summary Statistics:**
- `totalCustomers`: Tổng số khách hàng được phân tích
- `avgRFMScore`: Điểm RFM trung bình
- `segmentBreakdown`: Phân bố theo RFM segments
- `config`: Cấu hình thresholds được sử dụng

**💡 Business Insights:**
- **RFM Scoring**: Hệ thống điểm 1-5 cho từng component với thresholds có thể config
- **Dual Segmentation**: RFM segments (behavioral) + Business segments (value-based)
- **Actionable Insights**: Phân tích chi tiết và recommendations cụ thể
- **Configurable Thresholds**: Có thể điều chỉnh theo loại business

**Usage Examples:**
```bash
# RFM analysis cho tất cả customers với default config
GET /api/analytics/customers/rfm

# RFM analysis cho customer cụ thể
GET /api/analytics/customers/rfm?customerId=1

# RFM analysis với high-value business config
GET /api/analytics/customers/rfm?businessType=high_value

# RFM analysis với small business config
GET /api/analytics/customers/rfm?businessType=small_business
```

### 5. Customer Churn Prediction
```http
GET /api/analytics/customers/churn-prediction
```

**Mô tả**: Dự đoán khách hàng có nguy cơ rời đi với configurable risk factors và actionable retention strategies.

**Query Parameters:**
- `days` (optional): Thời gian không hoạt động (mặc định: 90 ngày)
- `businessType` (optional): Loại business (default, high_value, small_business)
- `includeAllCustomers` (optional): Phân tích tất cả customers thay vì chỉ inactive (mặc định: false)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "customerId": 1,
        "customerName": "John Smith",
        "customerEmail": "john.smith@email.com",
        "daysSinceLastOrder": 120,
        "totalOrders": 3,
        "totalSpent": 1500,
        "avgOrderValue": 500,
        "churnRisk": 0.75,
        "riskLevel": "high",
        "churnFactors": {
          "inactivity": 0.5,
          "orderFrequency": 0.3,
          "orderValue": 0.2,
          "engagement": 0.8
        },
        "insights": {
          "primaryReason": "lack_of_engagement",
          "secondaryReason": "price_sensitivity",
          "retentionProbability": 0.25,
          "winbackDifficulty": "hard",
          "estimatedRevenueLoss": 375
        },
        "retentionStrategies": {
          "immediate": [
            "personal_contact",
            "special_offer",
            "re_engagement_campaign"
          ],
          "shortTerm": [
            "loyalty_program",
            "product_recommendations",
            "frequency_incentives"
          ],
          "longTerm": [
            "relationship_building",
            "value_proposition",
            "community_engagement"
          ]
        },
        "lastOrderDate": "2023-09-15T10:30:00Z",
        "firstOrderDate": "2023-06-01T09:15:00Z",
        "orderDecline": 0.5,
        "valueDecline": 0.3,
        "engagementScore": 0.2
      }
    ],
    "summary": {
      "totalAnalyzed": 50,
      "highRisk": 15,
      "mediumRisk": 20,
      "lowRisk": 15,
      "avgChurnRisk": 0.45,
      "totalRevenueAtRisk": 12500,
      "config": {
        "businessType": "default",
        "inactivityThresholds": [30, 60, 90, 180, 365],
        "frequencyThresholds": [1, 2, 3, 5, 10],
        "valueThresholds": [100, 500, 1000, 5000, 10000]
      }
    }
  }
}
```

**Response Fields Explanation:**

**📊 Customer Information:**
- `customerId`: ID duy nhất của khách hàng
- `customerName`: Tên khách hàng
- `customerEmail`: Email liên hệ

**📈 Churn Metrics:**
- `daysSinceLastOrder`: Số ngày từ lần mua hàng cuối (days)
- `totalOrders`: Tổng số đơn hàng
- `totalSpent`: Tổng chi tiêu (USD)
- `avgOrderValue`: Giá trị đơn hàng trung bình (USD)
- `engagementScore`: Điểm engagement (0-1)

**🎯 Churn Analysis:**
- `churnRisk`: Điểm churn risk (0-1, cao = nguy cơ cao)
- `riskLevel`: Mức độ rủi ro (high/medium/low)
- `churnFactors`: Phân tích chi tiết các yếu tố rủi ro

**💡 Insights & Strategies:**
- `insights`: Phân tích nguyên nhân và khả năng retention
- `retentionStrategies`: Chiến lược giữ chân theo timeline
- `orderDecline`: Tỷ lệ giảm đơn hàng
- `valueDecline`: Tỷ lệ giảm giá trị đơn hàng

**📅 Order History:**
- `lastOrderDate`: Ngày đặt hàng gần nhất
- `firstOrderDate`: Ngày đặt hàng đầu tiên

**📊 Summary Statistics:**
- `totalAnalyzed`: Tổng số khách hàng được phân tích
- `highRisk/mediumRisk/lowRisk`: Phân bố theo mức độ rủi ro
- `avgChurnRisk`: Điểm churn risk trung bình
- `totalRevenueAtRisk`: Tổng doanh thu có nguy cơ mất
- `config`: Cấu hình thresholds được sử dụng

**💡 Business Insights:**
- **Configurable Risk Factors**: Inactivity, frequency, value, engagement với thresholds có thể điều chỉnh
- **Actionable Insights**: Nguyên nhân churn và khả năng retention
- **Retention Strategies**: Chiến lược giữ chân theo timeline (immediate/short-term/long-term)
- **Revenue Impact**: Ước tính doanh thu có nguy cơ mất
- **Trend Analysis**: Phân tích xu hướng giảm đơn hàng và giá trị

**Usage Examples:**
```bash
# Churn prediction cho inactive customers với default config
GET /api/analytics/customers/churn-prediction

# Churn prediction cho tất cả customers với high-value config
GET /api/analytics/customers/churn-prediction?businessType=high_value&includeAllCustomers=true

# Churn prediction cho customers inactive 60+ days với small business config
GET /api/analytics/customers/churn-prediction?days=60&businessType=small_business
```

## 🎯 Business Intelligence

### 1. Customer Journey Mapping
- **Awareness**: How customers discover the brand
- **Consideration**: Research and comparison phase
- **Purchase**: First-time buying decision
- **Retention**: Repeat purchase behavior
- **Advocacy**: Word-of-mouth and referrals

### 2. Predictive Analytics
- **Churn Prediction**: Identify customers likely to leave
- **Purchase Prediction**: Forecast next purchase timing
- **Value Prediction**: Predict customer lifetime value
- **Response Prediction**: Predict response to marketing campaigns

### 3. Personalization Engine
- **Product Recommendations**: Suggest relevant products
- **Price Optimization**: Dynamic pricing based on customer segment
- **Content Personalization**: Tailored marketing messages
- **Timing Optimization**: Best time to contact customers

## 📊 Data Processing Pipeline

### 1. Data Collection
```javascript
// Real-time data collection
const collectCustomerData = async (order) => {
  const customerData = {
    customerId: order.customerId,
    orderValue: order.totalAmount,
    orderDate: order.orderDate,
    products: order.items,
    platform: order.platform
  };
  
  await analyticsService.processOrder(customerData);
};
```

### 2. Data Processing
```python
# Batch processing for analytics
def process_customer_analytics():
    # Extract customer data
    customers = extract_customer_data()
    
    # Transform and calculate metrics
    customer_metrics = calculate_customer_metrics(customers)
    
    # Load into analytics database
    load_analytics_data(customer_metrics)
```

### 3. Real-time Analytics
```javascript
// Real-time customer scoring
const updateCustomerScore = async (customerId) => {
  const customer = await getCustomerData(customerId);
  const score = calculateRFMScore(customer);
  const segment = classifyCustomer(score);
  
  await updateCustomerSegment(customerId, segment);
};
```

## 🔄 Integration with AI Service

### 1. Data Export for AI Analysis
```javascript
// Export customer data for AI processing
const exportForAI = async (segment) => {
  const customers = await getCustomersBySegment(segment);
  
  const aiData = customers.map(customer => ({
    buyer: customer.id,
    totalOrders: customer.totalOrders,
    totalSpent: customer.totalSpent,
    avgOrderValue: customer.avgOrderValue,
    lastOrderDate: customer.lastOrderDate,
    categoryPreference: customer.categoryPreference,
    brandLoyalty: customer.brandLoyalty
  }));
  
  return aiData;
};
```

### 2. AI Service Integration
```javascript
// Send data to AI service for advanced analysis
const analyzeWithAI = async (customerData) => {
  const response = await axios.post('http://localhost:5001/customers/classify', customerData);
  
  return {
    segment: response.data.segment,
    confidence: response.data.confidence,
    recommendations: response.data.recommendations
  };
};
```

## 📈 Performance Optimization

### 1. Caching Strategy
- **Redis Cache**: Cache frequently accessed analytics
- **TTL**: 1 hour for real-time data, 24 hours for historical data
- **Cache Keys**: `customer_analytics:{customerId}`, `segment_analytics:{segment}`

### 2. Database Optimization
- **Indexing**: Index on customer_id, order_date, total_amount
- **Partitioning**: Partition by date for large datasets
- **Materialized Views**: Pre-calculated analytics views

### 3. Query Optimization
- **Aggregation**: Use database aggregation functions
- **Batch Processing**: Process analytics in batches
- **Async Processing**: Non-blocking analytics updates

## 🎯 Success Metrics

### 1. Business KPIs
- **Customer Retention Rate**: Target > 85%
- **Customer Lifetime Value**: Increase by 20%
- **Cross-selling Success**: Target > 40%
- **Churn Rate**: Reduce by 50%

### 2. Technical KPIs
- **API Response Time**: < 200ms
- **Data Accuracy**: > 99%
- **System Uptime**: > 99.9%
- **Real-time Processing**: < 5 seconds

## 🚀 Next Steps

1. **Implementation**: Develop APIs according to specifications
2. **Testing**: Comprehensive testing with real data
3. **Integration**: Connect with AI service for advanced analytics
4. **Monitoring**: Set up monitoring and alerting
5. **Optimization**: Performance tuning and optimization
6. **Documentation**: Complete API documentation and user guides

## 🧪 Testing & Implementation

### Running Tests
```bash
# Test tất cả APIs
cd backend
npm test test/customer-analytics.test.js

# Hoặc sử dụng script
chmod +x test/test-customer-analytics.sh
./test/test-customer-analytics.sh
```

### Test Coverage
- ✅ Customer Segmentation Analysis
- ✅ Customer Behavior Analysis
- ✅ Customer Lifetime Value Analysis
- ✅ Customer Recommendations
- ✅ Customer RFM Analysis
- ✅ Customer Churn Prediction
- ✅ Error Handling

### Implementation Files
- **Controller**: `backend/src/controllers/customerAnalyticsController.ts`
- **Routes**: `backend/src/routes/customerAnalyticsRoutes.ts`
- **Test File**: `backend/test/customer-analytics.test.js`
- **Test Script**: `backend/test/test-customer-analytics.sh`
- **Postman Collection**: `postman/Customer-Analytics-API.postman_collection.json`

### Database Integration
- Sử dụng Prisma ORM với MySQL
- Tối ưu hóa queries với aggregation functions
- Relationship-based data retrieval
- Performance-optimized analytics processing

### 7. Potential Customer Suggestions for Specific Products
```http
GET /api/analytics/customers/new-inventory-matching
```

**Mô tả**: Tìm kiếm khách hàng có khả năng quan tâm đến sản phẩm hoặc danh mục cụ thể dựa trên lịch sử mua hàng, với insights marketing, sales intelligence và inventory optimization chi tiết.

**Query Parameters:**
- `productIds` (optional): Danh sách ID sản phẩm (comma-separated)
- `categoryIds` (optional): Danh sách ID danh mục (comma-separated)
- `limit` (optional): Số lượng khách hàng (mặc định: 10)
- `businessType` (optional): Loại cấu hình business - "default", "high_value", "small_business" (mặc định: "default")

**Response Example:**
```json
{
  "success": true,
  "data": {
    "potentialCustomers": [
      {
        "customerId": 1,
        "customer": {
          "id": 1,
          "name": "Nguyễn Văn A",
          "email": "nguyenvana@email.com",
          "phoneNumber": "0123456789"
        },
        "totalSpent": 2500,
        "similarProducts": 5,
        "categories": ["Electronics", "Accessories"],
        "brands": ["Apple", "Samsung"],
        "lastPurchaseDate": "2024-01-15T10:30:00Z",
        "firstPurchaseDate": "2023-06-10T14:20:00Z",
        "purchaseFrequency": 2.5,
        "avgOrderValue": 500,
        "interestScore": 8.5,
        "interestLevel": "high",
        "marketingInsights": {
          "targetSegment": "tech_enthusiasts",
          "preferredChannels": ["email", "social_media", "sms"],
          "optimalTiming": "weekend_mornings",
          "priceRange": "$500-$1000",
          "campaignSuggestions": ["early_bird_discount", "product_demo", "exclusive_access"]
        },
        "salesIntelligence": {
          "leadScore": 8.5,
          "conversionProbability": 0.75,
          "salesCycle": "short",
          "dealSize": "medium",
          "followUpActions": ["product_demo", "pricing_negotiation", "contract_discussion"]
        },
        "inventoryInsights": {
          "demandForecast": 85,
          "stockRecommendation": "increase",
          "seasonalFactor": 1.3,
          "supplyChainImpact": "moderate"
        },
        "demographics": {
          "segment": "VIP",
          "totalOrders": 12
        }
      }
    ],
    "summary": {
      "totalAnalyzed": 150,
      "avgInterestScore": 6.5,
      "highInterestCustomers": 25,
      "mediumInterestCustomers": 30,
      "lowInterestCustomers": 20,
      "totalPotentialRevenue": 18750,
      "config": {
        "businessType": "default",
        "purchaseFrequencyThresholds": [1, 3, 5, 10, 20],
        "totalSpentThresholds": [100, 500, 1000, 5000, 10000],
        "recencyThresholds": [30, 60, 90, 180, 365]
      }
    }
  }
}
```

**Tính năng chính:**
- **Scoring có thể cấu hình**: Điểm quan tâm dựa trên tần suất mua, tổng chi tiêu, thời gian gần đây và đa dạng
- **Marketing Intelligence**: Phân khúc mục tiêu, kênh ưa thích, thời gian tối ưu, gợi ý chiến dịch
- **Sales Intelligence**: Lead scoring, xác suất chuyển đổi, chu kỳ bán hàng, hành động follow-up
- **Inventory Optimization**: Dự báo nhu cầu, khuyến nghị tồn kho, yếu tố theo mùa
- **Business Type Configurations**: Ngưỡng khác nhau cho Default, High Value và Small Business

**Use Cases:**
- Product launch targeting với marketing insights chi tiết
- Inventory optimization với demand forecasting
- Marketing campaign planning với channel và timing recommendations
- Sales team lead generation với conversion probability và follow-up actions
- Business intelligence cho strategic decision making

### 8. New Inventory and Customer Matching
```http
GET /api/analytics/customers/new-inventory-matching
```

**Mô tả**: Phân tích hàng mới nhập kho và matching với khách hàng quan tâm.

**Query Parameters:**
- `days` (optional): Số ngày phân tích (mặc định: 7 ngày)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "newItems": [
      {
        "sku": "IPHONE15-PRO",
        "name": "iPhone 15 Pro",
        "category": "Electronics",
        "brand": "Apple",
        "stockQuantity": 50,
        "addedDate": "2024-01-20T09:00:00Z"
      }
    ],
    "customerMatches": [
      {
        "newItem": {
          "id": 1,
          "sku": "IPHONE15-PRO",
          "name": "iPhone 15 Pro",
          "category": "Electronics",
          "brand": "Apple",
          "stockQuantity": 50,
          "salePrice": 25000000
        },
        "interestedCustomers": [
          {
            "customerId": 1,
            "customer": {
              "id": 1,
              "name": "Nguyễn Văn A",
              "email": "nguyenvana@email.com",
              "phoneNumber": "0123456789"
            },
            "totalSpent": 25000000,
            "similarItems": 3,
            "lastPurchaseDate": "2024-01-15T10:30:00Z",
            "segment": "VIP",
            "matchReason": "Category Match"
          }
        ],
        "totalInterestedCustomers": 15
      }
    ],
    "emailCampaigns": [
      {
        "product": {
          "sku": "IPHONE15-PRO",
          "name": "iPhone 15 Pro"
        },
        "targetCustomers": 15,
        "campaignType": "Bulk Email",
        "suggestedContent": "New Electronics from Apple: iPhone 15 Pro",
        "priority": "High"
      }
    ],
    "summary": {
      "totalNewItems": 5,
      "totalInterestedCustomers": 45,
      "avgCustomersPerItem": 9.0
    }
  }
}
```



---

**🎯 Goal**: Build a comprehensive customer analytics system that provides deep insights for better customer relationship management and business growth. 