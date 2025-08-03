# 📊 Customer Analytics & Inventory Management System

Hệ thống phân tích khách hàng và quản lý kho hàng toàn diện, được xây dựng bằng Node.js TypeScript và MySQL. Hệ thống tập trung vào **Customer Analytics** với 6 API endpoints chuyên biệt, kết hợp với quản lý sản phẩm và đơn hàng.

## 🎯 Mục tiêu hệ thống

Hệ thống cung cấp phân tích khách hàng toàn diện với 6 API endpoints chuyên biệt, kết hợp với quản lý sản phẩm và đơn hàng. Hệ thống tập trung vào:

- **Customer Analytics**: Phân tích hành vi, phân khúc, dự đoán và gợi ý cho khách hàng
- **Inventory Management**: Quản lý sản phẩm, tồn kho và đơn hàng
- **Advanced Analytics**: Phân tích nâng cao với machine learning algorithms

## 🚀 Features

### Core Features
- ✅ Quản lý sản phẩm (Product Management)
- ✅ Quản lý lô hàng (Lot Management) 
- ✅ Quản lý đơn hàng bán (Sales Order Management)
- ✅ Quản lý sự kiện khuyến mãi (Event Sale Management)
- ✅ Quản lý mã giảm giá (Coupon Management)
- ✅ Phân tích khách hàng (Customer Analytics)

### Customer Analytics Features
- 🧠 Phân tích hành vi khách hàng (Customer Behavior Analysis)
- 📊 Phân khúc khách hàng (Customer Segmentation)
- 💰 Dự đoán Customer Lifetime Value (CLV)
- ⚠️ Dự đoán churn khách hàng (Churn Prediction)
- 📈 Phân tích RFM (Recency, Frequency, Monetary)
- 🎯 Gợi ý khách hàng tiềm năng (Potential Customer Suggestions)
- 🛍️ Gợi ý sản phẩm cá nhân hóa (Personalized Product Recommendations)

## 📊 Customer Analytics System

### Core Analytics APIs

| API | Endpoint | Purpose | Key Features |
|-----|----------|---------|--------------|
| **Customer Analytics Overview** | `GET /api/analytics/customers` | Phân tích tổng quan khách hàng | Segmentation, filters, business types |
| **Individual Customer Analysis** | `GET /api/analytics/customers/:customerId` | Phân tích chi tiết 1 khách hàng | Detailed metrics, trends, preferences |
| **Customer Predictions & Trends** | `POST /api/analytics/customers/predictions` | Dự đoán CLV, churn, recommendations | ML predictions, product recommendations |
| **Customer RFM Analysis** | `GET /api/analytics/customers/rfm` | Phân tích RFM (Recency, Frequency, Monetary) | RFM scoring, segments, insights |
| **Customer Churn Prediction** | `GET /api/analytics/customers/churn-prediction` | Dự đoán khách hàng rời đi | Risk levels, retention strategies |
| **Potential Customer Suggestions** | `GET /api/analytics/customers/new-inventory-matching` | Tìm khách hàng tiềm năng cho sản phẩm | Marketing insights, sales intelligence |

### Customer Segmentation Framework

#### 🐋 Whale Customers (Khách hàng VIP cao cấp)
- **Criteria**: Tổng chi tiêu > $5,000, Số đơn hàng ≥ 10, AOV > $500
- **Strategy**: Dịch vụ VIP cá nhân, sản phẩm độc quyền, ưu đãi đặc biệt

#### 👑 VIP Customers (Khách hàng VIP)
- **Criteria**: Tổng chi tiêu $1,000-$5,000, Số đơn hàng 5-15, AOV $100-$500
- **Strategy**: Chương trình loyalty, ưu đãi theo tier, dịch vụ chăm sóc đặc biệt

#### 👥 Regular Customers (Khách hàng thường xuyên)
- **Criteria**: Tổng chi tiêu $200-$1,000, Số đơn hàng 3-8, AOV $50-$100
- **Strategy**: Khuyến mãi định kỳ, cross-selling, tăng tần suất mua hàng

#### 🆕 New Customers (Khách hàng mới)
- **Criteria**: Số đơn hàng 1-2, Thời gian mua hàng < 30 ngày
- **Strategy**: Onboarding tốt, ưu đãi chào mừng, tạo trải nghiệm tích cực

#### 🚶 Churn Customers (Khách hàng rời đi)
- **Criteria**: Không mua hàng > 90 ngày, có lịch sử mua hàng trước đó
- **Strategy**: Win-back campaigns, khảo sát lý do rời đi, ưu đãi đặc biệt

### Advanced Analytics Features

#### Configurable Business Types
- **Default**: Standard thresholds cho general business
- **High Value**: Higher thresholds cho luxury/premium business
- **Small Business**: Lower thresholds cho small business
- **High Frequency**: Focus on purchase frequency
- **Electronics**: Specialized cho electronics retail
- **Fashion/Sports**: Specialized cho fashion/sports retail

#### AI-Powered Insights
- **Customer Lifetime Value (CLV)**: Prediction dựa trên historical data
- **Churn Risk**: Weighted algorithm với multiple factors
- **Product Recommendations**: Collaborative + Content-based filtering
- **Marketing Intelligence**: Target segments, channels, timing
- **Sales Intelligence**: Lead scoring, conversion probability
- **Inventory Optimization**: Demand forecasting, stock recommendations

## 🏗️ Tech Stack

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **MySQL** - Primary database
- **Winston** - Logging
- **Joi** - Validation

### Analytics
- **Machine Learning Algorithms** - Customer segmentation, CLV prediction
- **Statistical Analysis** - RFM analysis, churn prediction
- **Recommendation Systems** - Product recommendations
- **Data Processing** - Real-time analytics

### DevOps
- **Docker** + **Docker Compose**
- **Jest** - Testing
- **ESLint** - Code quality

## 🏗️ Kiến trúc hệ thống

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │
│   (External)    │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   MySQL DB      │
                       │   (Primary)     │
                       └─────────────────┘
```

### Service Responsibilities

#### Backend API Service (Node.js + TypeScript)
- **Port**: 4001
- **Framework**: Express.js + Prisma ORM
- **Database**: MySQL
- **Features**:
  - Customer Analytics APIs (6 endpoints)
  - Inventory Management APIs
  - Business logic validation
  - Configurable segmentation
  - Real-time data processing
  - Comprehensive logging

#### Database Service (MySQL)
- **Port**: 3309
- **Features**:
  - ACID compliance
  - Optimized queries cho analytics
  - Indexing cho performance
  - Backup & Recovery

### Data Models

#### Core Entities
```
Customer (1) ←→ (N) Order
Order (1) ←→ (N) OrderItem
OrderItem (N) ←→ (1) Item
Item (N) ←→ (1) Category
Item (N) ←→ (1) Brand
```

#### Customer Analytics Data
- **Customer Metrics**: totalSpent, totalOrders, avgOrderValue, lastOrderDate
- **Behavioral Data**: category preferences, brand loyalty, purchase patterns
- **Predictive Data**: CLV, churn risk, next purchase date
- **Segmentation Data**: RFM scores, business segments, interest levels

## 📋 Prerequisites

- Node.js 22+
- Docker & Docker Compose
- MySQL (via Docker)

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd demo-ai
```

### 2. Setup Environment
```bash
# Copy environment file
cp backend/env.example backend/.env

# Edit environment variables
nano backend/.env
```

### 3. First Time Setup
```bash
# Run setup script
./setup.sh
```

### 4. Start Development
```bash
# Start development servers
./start.sh
```

### 5. Alternative Manual Setup
```bash
# Install dependencies
cd backend
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

### 6. Import Sample Data
```bash
# Import sample data (requires backend to be running)
./import-data.sh
```

**Note**: This script imports sample data from `database/csv-data/` including:
- Brands, Categories, Customers
- Items, Orders, Order Items

## 📊 Database Schema

### Core Tables

#### `customers`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Customer ID |
| name | VARCHAR | Customer name |
| email | VARCHAR | Email address |
| phoneNumber | VARCHAR | Phone number |
| createdAt | DATETIME | Registration date |

#### `orders`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Order ID |
| customerId | INT FK | Customer reference |
| orderDate | DATETIME | Order date |
| totalAmount | DECIMAL | Total order value |
| status | VARCHAR | Order status |

#### `order_items`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Order item ID |
| orderId | INT FK | Order reference |
| itemId | INT FK | Item reference |
| quantity | INT | Quantity ordered |
| pricePerUnit | DECIMAL | Unit price |
| totalPrice | DECIMAL | Total price |

#### `items`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Item ID |
| sku | VARCHAR | Stock keeping unit |
| name | VARCHAR | Item name |
| categoryId | INT FK | Category reference |
| brandId | INT FK | Brand reference |
| salePrice | DECIMAL | Sale price |
| stockQuantity | INT | Available stock |

#### `categories`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Category ID |
| name | VARCHAR | Category name |
| description | TEXT | Category description |

#### `brands`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Brand ID |
| name | VARCHAR | Brand name |
| description | TEXT | Brand description |

### Analytics Tables

#### `loyal_customers`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Record ID |
| customerId | INT FK | Customer reference |
| loyaltySegment | VARCHAR | Segment (whale/vip/regular/new/churn) |
| totalOrders | INT | Total orders count |
| totalSpent | DECIMAL | Total amount spent |
| lastOrderDate | DATETIME | Last order date |

## 🔌 API Endpoints

### Customer Analytics APIs

#### 1. Customer Analytics Overview
```
GET /api/analytics/customers
```
**Purpose**: Phân tích tổng quan khách hàng với segmentation và filters
**Query Parameters**:
- `page` - Số trang (default: 1)
- `limit` - Số lượng item/trang (default: 10)
- `businessType` - Loại business cho segmentation

#### 2. Individual Customer Analysis
```
GET /api/analytics/customers/:customerId
```
**Purpose**: Phân tích chi tiết 1 khách hàng cụ thể
**Parameters**:
- `customerId` - ID khách hàng (path parameter)
- `days` - Số ngày cho trend analysis (query parameter)

#### 3. Customer Predictions & Trends
```
POST /api/analytics/customers/predictions
```
**Purpose**: Dự đoán CLV, churn risk, và product recommendations
**Request Body**:
```json
{
  "customerIds": [1, 2, 3],
  "includeRecommendations": true
}
```

#### 4. Customer RFM Analysis
```
GET /api/analytics/customers/rfm
```
**Purpose**: Phân tích RFM (Recency, Frequency, Monetary)
**Query Parameters**:
- `customerId` - ID khách hàng cụ thể (optional)
- `businessType` - Loại business cho RFM thresholds

#### 5. Customer Churn Prediction
```
GET /api/analytics/customers/churn-prediction
```
**Purpose**: Dự đoán khách hàng có khả năng rời đi
**Query Parameters**:
- `days` - Ngưỡng ngày cho churn prediction (default: 90)
- `businessType` - Loại business cho churn thresholds

#### 6. Potential Customer Suggestions
```
GET /api/analytics/customers/new-inventory-matching
```
**Purpose**: Tìm khách hàng tiềm năng cho sản phẩm/category
**Query Parameters**:
- `productIds` - Danh sách product IDs (comma-separated)
- `categoryIds` - Danh sách category IDs (comma-separated)
- `limit` - Số lượng khách hàng trả về (default: 10)
- `businessType` - Loại business cho scoring

### Core Business APIs

#### Products
```
GET    /api/products                    # Lấy danh sách sản phẩm (với pagination & filtering)
GET    /api/products/:sku              # Lấy chi tiết sản phẩm
GET    /api/products/:sku/stats        # Thống kê sản phẩm (tổng lô, đã bán, tồn kho)
POST   /api/products                   # Tạo sản phẩm mới
PUT    /api/products/:sku              # Cập nhật sản phẩm
DELETE /api/products/:sku              # Xóa sản phẩm (nếu không có lô hàng liên quan)
```

#### Orders
```
GET    /api/orders                      # Lấy danh sách đơn hàng (với pagination & filtering)
GET    /api/orders/:id                  # Lấy chi tiết đơn hàng
POST   /api/orders                      # Tạo đơn hàng mới
PUT    /api/orders/:id                  # Cập nhật đơn hàng
```

#### Categories & Brands
```
GET    /api/categories                  # Lấy danh sách categories
GET    /api/brands                      # Lấy danh sách brands
```

## 📈 Key Metrics & KPIs

### Customer Value Metrics
- **Total Spent**: Tổng chi tiêu của khách hàng
- **Average Order Value (AOV)**: Giá trị đơn hàng trung bình
- **Order Frequency**: Tần suất mua hàng
- **Customer Lifetime Value (CLV)**: Giá trị khách hàng trong suốt thời gian sử dụng
- **Recency**: Thời gian từ lần mua hàng cuối

### Business Intelligence
- **Customer Segmentation**: Distribution across segments
- **Churn Rate**: Percentage of customers who stopped purchasing
- **Retention Rate**: Percentage of customers who continue purchasing
- **Revenue Growth**: Month-over-month revenue growth
- **Inventory Turnover**: How quickly inventory is sold

### Predictive Analytics
- **Churn Prediction**: Probability of customer churn
- **CLV Prediction**: Predicted customer lifetime value
- **Next Purchase Date**: Predicted next purchase timing
- **Product Recommendations**: Personalized product suggestions
- **Demand Forecasting**: Predicted inventory demand

## 📋 Request/Response Examples

### Customer Analytics Overview
```bash
GET /api/analytics/customers?page=1&limit=10&businessType=default
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCustomers": 150,
      "newCustomers": 25,
      "segments": {
        "whale": 5,
        "vip": 15,
        "regular": 80,
        "new": 25,
        "churn": 25
      }
    },
    "customers": [
      {
        "id": 1,
        "name": "John Smith",
        "totalSpent": 5000,
        "totalOrders": 15,
        "avgOrderValue": 333.33,
        "lastOrderDate": "2024-01-15T10:30:00.000Z",
        "segment": "vip",
        "clv": 7500,
        "clvRank": 3
      }
    ]
  }
}
```

### Customer Predictions
```bash
POST /api/analytics/customers/predictions
Content-Type: application/json

{
  "customerIds": [1, 2, 3],
  "includeRecommendations": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "customerId": 1,
        "customerName": "John Smith",
        "currentCLV": 5000,
        "predictedCLV": 7500,
        "churnRisk": 0.2,
        "nextPurchaseDate": "2024-02-15T10:30:00.000Z",
        "recommendedActions": ["engagement_campaign", "personalized_offers"],
        "recommendations": {
          "products": [...],
          "promotions": [...],
          "strategies": [...]
        }
      }
    ],
    "overallMetrics": {
      "totalPredictedRevenue": 15000,
      "avgChurnRisk": 0.25,
      "avgRetentionRate": 0.85
    }
  }
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test:quick      # Quick health check
npm run test:curl       # Full API tests
npm run test:api        # Python test suite
```

### Build & Test
```bash
# Build and run tests
cd backend
npm run build
npm test
```

### Test Coverage
- ✅ **Customer Analytics APIs**: 6 endpoints với comprehensive testing
- ✅ **Core Business APIs**: CRUD operations, Import, Analytics
- ✅ **Integration**: Service communication
- ✅ **Error Handling**: Graceful error responses
- ✅ **Performance**: Response time monitoring

### Manual Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- customerAnalyticsController.test.ts
```

## 🏗️ Project Structure

```
demo-ai/
├── backend/                    # Node.js Backend API
│   ├── src/
│   │   ├── controllers/        # API Controllers
│   │   ├── routes/            # API Routes
│   │   ├── config/            # Configuration files (Swagger, etc.)
│   │   ├── utils/             # Utility functions
│   │   ├── models/            # Database models
│   │   └── app.ts             # Main application
│   ├── test/                  # Test files
│   ├── prisma/                # Database schema & migrations
│   ├── docs/                  # Backend documentation
│   └── logs/                  # Application logs
├── database/                  # Database initialization
│   ├── init/                  # SQL scripts
│   └── seeds/                 # Sample data
├── docs/                      # Project documentation
│   ├── CUSTOMER_ANALYTICS.md  # Detailed customer analytics docs
│   ├── API_DOCUMENTATION.md   # API documentation
│   └── postman/               # Postman collections
├── logs/                      # Application logs
├── docker-compose.yml         # Development environment
├── setup.sh                   # First-time setup script
├── start.sh                   # Development start script
├── import-data.sh             # Data import script
└── README.md                  # This documentation
```

## 🚀 Deployment & Operations

### Development Setup
```bash
# First time setup
./setup.sh

# Start development servers
./start.sh
```

### Production Deployment
```bash
# Build application
cd backend
npm run build

# Start production server
npm start
```

### Health Checks
- `GET /health` - Backend API health
- Database connection monitoring

### Monitoring & Logging
- Request/Response logging với Winston
- Error tracking với stack traces
- Performance metrics
- Business metrics (sales, inventory, customer analytics)

## 📊 API Documentation

### Swagger UI
- **URL**: `http://localhost:4001/api-docs`
- **Features**: Interactive API documentation với 6 Customer Analytics endpoints
- **Schemas**: Detailed response schemas cho tất cả APIs
- **Testing**: Try out APIs directly từ browser

### Postman Collection
- **File**: `docs/postman/Inventory-Sales-API.postman_collection.json`
- **Features**: Pre-configured requests cho tất cả APIs
- **Environment**: Development và production environments

### Additional Documentation
- **Customer Analytics**: `docs/CUSTOMER_ANALYTICS.md` - Detailed customer analytics documentation
- **API Documentation**: `docs/API_DOCUMENTATION.md` - Comprehensive API reference

## 🎯 Future Enhancements

### Advanced Analytics
- **Real-time Analytics**: Live customer behavior tracking
- **A/B Testing**: Experimentation framework
- **Advanced ML Models**: Deep learning cho predictions
- **Natural Language Processing**: Chatbot cho reports

### Integration Capabilities
- **CRM Integration**: Salesforce, HubSpot integration
- **Marketing Automation**: Email, SMS campaign integration
- **E-commerce Platforms**: Shopify, WooCommerce integration
- **Payment Gateways**: Stripe, PayPal integration

### Mobile & Web Applications
- **Customer Portal**: Self-service customer analytics
- **Mobile App**: iOS/Android apps cho customers
- **Admin Dashboard**: Real-time business intelligence
- **API Gateway**: Unified API access

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@example.com or create an issue in the repository.

---

**🎉 Customer Analytics System đã được triển khai hoàn chỉnh với 6 API endpoints chuyên biệt, cung cấp phân tích khách hàng toàn diện và actionable insights cho business growth!**