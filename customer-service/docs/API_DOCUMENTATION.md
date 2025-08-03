# 📚 API Documentation - Core Business APIs

## 🎯 Overview

This API provides comprehensive inventory and sales management functionality with modern features including product management, order processing, and real-time stock management. **Note**: Customer Analytics APIs are documented separately in `docs/CUSTOMER_ANALYTICS.md`.

## 🔗 Base URL

```
http://localhost:4001/api
```

## 📊 Core Business APIs

### 🏷️ Brands Management

#### Get All Brands
```http
GET /brands?page=1&limit=10&search=apple
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in brand name

**Response:**
```json
{
  "success": true,
  "data": {
    "brands": [
      {
        "id": 1,
        "name": "Apple",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "_count": {
          "items": 5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

#### Get Single Brand
```http
GET /brands/1
```

#### Create Brand
```http
POST /brands
Content-Type: application/json

{
  "name": "Samsung"
}
```

#### Update Brand
```http
PUT /brands/1
Content-Type: application/json

{
  "name": "Samsung Electronics"
}
```

#### Delete Brand
```http
DELETE /brands/1
```

### 📂 Categories Management

#### Get All Categories
```http
GET /categories?page=1&limit=10&search=electronics
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in category name

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Electronics",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "_count": {
          "items": 15
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 4,
      "totalPages": 1
    }
  }
}
```

#### Get Single Category
```http
GET /categories/1
```

#### Create Category
```http
POST /categories
Content-Type: application/json

{
  "name": "Footwear"
}
```

#### Update Category
```http
PUT /categories/1
Content-Type: application/json

{
  "name": "Electronic Devices"
}
```

#### Delete Category
```http
DELETE /categories/1
```

### 👥 Customers Management

#### Get All Customers
```http
GET /customers?page=1&limit=10&search=john
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in name and email

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+1234567890",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "loyalCustomer": {
          "customerId": 1,
          "totalOrders": 5,
          "totalSpent": "1500.00",
          "loyaltySegment": "VIP"
        },
        "_count": {
          "orders": 5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### Get Single Customer
```http
GET /customers/1
```

#### Create Customer
```http
POST /customers
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phoneNumber": "+1234567891"
}
```

#### Update Customer
```http
PUT /customers/1
Content-Type: application/json

{
  "name": "Jane Doe",
  "phoneNumber": "+1234567892"
}
```

#### Delete Customer
```http
DELETE /customers/1
```

### 🛍️ Items Management

#### Get All Items
```http
GET /items?page=1&limit=10&brandId=1&categoryId=2&search=phone&isActive=true
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `brandId` (optional): Filter by brand ID
- `categoryId` (optional): Filter by category ID
- `search` (optional): Search in name and SKU
- `isActive` (optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "sku": "IPHONE-15-128",
        "name": "iPhone 15 128GB",
        "costPrice": "800.00",
        "salePrice": "999.00",
        "stockQuantity": 50,
        "brandId": 1,
        "categoryId": 1,
        "isActive": true,
        "brand": {
          "id": 1,
          "name": "Apple"
        },
        "category": {
          "id": 1,
          "name": "Electronics"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### Get Single Item
```http
GET /items/1
```

#### Create Item
```http
POST /items
Content-Type: application/json

{
  "sku": "IPHONE-15-256",
  "name": "iPhone 15 256GB",
  "costPrice": 850.00,
  "salePrice": 1099.00,
  "stockQuantity": 30,
  "brandId": 1,
  "categoryId": 1,
  "isActive": true
}
```

#### Update Item
```http
PUT /items/1
Content-Type: application/json

{
  "salePrice": 1049.00,
  "stockQuantity": 25
}
```

#### Delete Item
```http
DELETE /items/1
```

#### Get Item Statistics
```http
GET /items/1/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "sku": "IPHONE-15-128",
      "name": "iPhone 15 128GB",
      "brand": { "id": 1, "name": "Apple" },
      "category": { "id": 1, "name": "Electronics" }
    },
    "totalOrders": 25,
    "totalSold": 45,
    "totalRevenue": "44955.00",
    "currentStock": 50
  }
}
```

### 📦 Orders Management

#### Get All Orders
```http
GET /orders?page=1&limit=10&customerId=1&platform=Shopee&status=completed&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Orders per page (default: 10)
- `customerId` (optional): Filter by customer ID
- `platform` (optional): Filter by platform
- `status` (optional): Filter by status
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "orderCode": "ORD-2024-001",
        "customerId": 1,
        "shippingLocation": "123 Main St, City",
        "platform": "Shopee",
        "orderDate": "2024-01-15T10:30:00.000Z",
        "status": "completed",
        "refundReason": null,
        "customer": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        },
        "orderItems": [
          {
            "id": 1,
            "quantity": 2,
            "pricePerUnit": "999.00",
            "discountAmount": "50.00",
            "item": {
              "id": 1,
              "sku": "IPHONE-15-128",
              "name": "iPhone 15 128GB"
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

#### Get Single Order
```http
GET /orders/1
```

#### Create Order
```http
POST /orders
Content-Type: application/json

{
  "orderCode": "ORD-2024-002",
  "customerId": 1,
  "shippingLocation": "456 Oak St, City",
  "platform": "Website",
  "status": "pending",
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "pricePerUnit": 999.00,
      "discountAmount": 50.00
    }
  ]
}
```

#### Update Order
```http
PUT /orders/1
Content-Type: application/json

{
  "status": "shipped",
  "shippingLocation": "789 Pine St, City"
}
```

#### Delete Order
```http
DELETE /orders/1
```

#### Get Order Statistics
```http
GET /orders/stats?startDate=2024-01-01&endDate=2024-01-31&platform=Shopee
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "totalRevenue": "149850.00",
    "avgOrderValue": "999.00",
    "platformStats": [
      {
        "platform": "Shopee",
        "orders": 100
      },
      {
        "platform": "Website",
        "orders": 50
      }
    ]
  }
}
```

#### Create Brand
```http
POST /brands
Content-Type: application/json

{
  "name": "Samsung"
}
```

### 📂 Category Management

#### Get All Categories
```http
GET /categories?page=1&limit=10&search=Electronics
```

#### Create Category
```http
POST /categories
Content-Type: application/json

{
  "name": "Smartphones"
}
```

### 👥 Customer Management

#### Get All Customers
```http
GET /customers?page=1&limit=10&search=john
```

#### Create Customer
```http
POST /customers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "0123456789"
}
```

## 📤 Import APIs

### Import Items from CSV
```http
POST /import/items
Content-Type: multipart/form-data

- csv (file): CSV file containing items data
```

**CSV Format:**
```csv
sku,name,costPrice,salePrice,stockQuantity,brand,category,isActive
IPHONE-15-128,iPhone 15 128GB,800.00,999.00,50,Apple,Electronics,true
SAMSUNG-S24,Samsung Galaxy S24,700.00,899.00,30,Samsung,Electronics,true
```

### Import Customers from CSV
```http
POST /import/customers
Content-Type: multipart/form-data

- csv (file): CSV file containing customers data
```

**CSV Format:**
```csv
name,email,phoneNumber
John Doe,john.doe@example.com,0123456789
Jane Smith,jane.smith@example.com,0987654321
```

### Import Orders from CSV
```http
POST /import/orders
Content-Type: multipart/form-data

- csv (file): CSV file containing orders data
```

**CSV Format:**
```csv
orderCode,customerEmail,shippingLocation,platform,status,refundReason
ORD-2024-001,john.doe@example.com,123 Main St,Shopee,pending,
ORD-2024-002,jane.smith@example.com,456 Oak Ave,Website,completed,
```

### Import Order Items from CSV
```http
POST /import/order-items
Content-Type: multipart/form-data

- csv (file): CSV file containing order items data
```

**CSV Format:**
```csv
orderCode,itemSku,quantity,pricePerUnit,discountAmount
ORD-2024-001,IPHONE-15-128,2,999.00,50.00
ORD-2024-002,SAMSUNG-S24,1,899.00,0.00
```

### Import All Data (JSON)
```http
POST /import/all
Content-Type: application/json

{
  "items": [
    {
      "sku": "IPHONE-15-128",
      "name": "iPhone 15 128GB",
      "costPrice": 800.00,
      "salePrice": 999.00,
      "stockQuantity": 50,
      "brand": "Apple",
      "category": "Electronics",
      "isActive": true
    }
  ],
  "customers": [
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "0123456789"
    }
  ],
  "orders": [
    {
      "orderCode": "ORD-2024-001",
      "customerEmail": "john.doe@example.com",
      "shippingLocation": "123 Main St",
      "platform": "Shopee",
      "status": "pending"
    }
  ],
  "orderItems": [
    {
      "orderCode": "ORD-2024-001",
      "itemSku": "IPHONE-15-128",
      "quantity": 2,
      "pricePerUnit": 999.00,
      "discountAmount": 50.00
    }
  ]
}
```

## 🤖 AI APIs

### Customer Classification
```http
POST /ai/customers/classify
Content-Type: application/json

[
  {
    "buyer": "John Doe",
    "totalOrders": 5,
    "totalSpent": 5000,
    "avgOrderValue": 1000,
    "lastOrderDate": "2024-01-15T00:00:00.000Z"
  }
]
```

## 📈 Analytics APIs

### Sales Analytics
```http
GET /analytics/sales?startDate=2024-01-01&endDate=2024-01-31&platform=Shopee
```

### Inventory Analytics
```http
GET /analytics/inventory
```

### Customer Analytics
```http
GET /analytics/customers?days=30
```

### Revenue Analytics
```http
GET /analytics/revenue?period=month
```

## ⚠️ Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "error": "SKU is required and must be 1-100 characters"
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Item not found"
}
```

### File Upload Error
```json
{
  "success": false,
  "message": "CSV file is required"
}
```

### File Type Error
```json
{
  "success": false,
  "message": "Only CSV files are allowed"
}
```

### File Size Error
```json
{
  "success": false,
  "message": "File too large"
}
```

## 📋 File Requirements

### CSV Files
- **Format**: CSV (Comma Separated Values)
- **Extension**: `.csv`
- **MIME Type**: `text/csv`
- **Size Limit**: 10MB
- **Encoding**: UTF-8
- **Delimiter**: Comma (,)
- **Header Row**: Required
- **Field Name**: `csv`

### Data Validation

#### Items CSV
- `sku`: Required, unique, 1-100 characters
- `name`: Required, non-empty
- `costPrice`: Optional, numeric, default 0
- `salePrice`: Required, numeric, positive
- `stockQuantity`: Optional, integer, default 0
- `brand`: Optional, will create if not exists
- `category`: Optional, will create if not exists
- `isActive`: Optional, boolean, default true

#### Customers CSV
- `name`: Required, non-empty
- `email`: Required, valid email format, unique
- `phoneNumber`: Optional, string

#### Orders CSV
- `orderCode`: Required, unique
- `customerEmail`: Required, must exist in customers
- `shippingLocation`: Optional, string
- `platform`: Required, non-empty
- `status`: Required, non-empty
- `refundReason`: Optional, string

#### Order Items CSV
- `orderCode`: Required, must exist in orders
- `itemSku`: Required, must exist in items
- `quantity`: Required, positive integer
- `pricePerUnit`: Required, numeric, positive
- `discountAmount`: Optional, numeric, default 0

## 🔄 Import Order

For data integrity, import in this order:
1. **Items** (creates brands/categories automatically)
2. **Customers**
3. **Orders** (requires customers)
4. **Order Items** (requires orders and items)

## 📝 Usage Examples

### cURL Examples

#### Import Items CSV
```bash
curl -X POST http://localhost:4001/api/import/items \
  -F "csv=@items.csv"
```

#### Create Item
```bash
curl -X POST http://localhost:4001/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "IPHONE-15-256",
    "name": "iPhone 15 256GB",
    "costPrice": 850.00,
    "salePrice": 1099.00,
    "stockQuantity": 30,
    "brandId": 1,
    "categoryId": 1,
    "isActive": true
  }'
```

### JavaScript/Fetch Examples

#### Import CSV File
```javascript
const formData = new FormData();
formData.append('csv', fileInput.files[0]);

fetch('/api/import/items', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

#### Create Item
```javascript
fetch('/api/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sku: 'IPHONE-15-256',
    name: 'iPhone 15 256GB',
    costPrice: 850.00,
    salePrice: 1099.00,
    stockQuantity: 30,
    brandId: 1,
    categoryId: 1,
    isActive: true
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🎯 Features

- ✅ **Modern Schema**: Clean, normalized database structure
- ✅ **Real-time Stock**: Automatic stock management
- ✅ **Brand/Category Management**: Organized product hierarchy
- ✅ **Customer Loyalty**: Built-in loyalty tracking
- ✅ **AI Analytics**: Customer classification and insights
- ✅ **CSV Import**: Bulk data import with validation
- ✅ **RESTful APIs**: Standard HTTP methods
- ✅ **Pagination**: Efficient data loading
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Data Validation**: Input validation and sanitization

## 🤖 AI Service APIs

### 🔗 AI Service Base URL

```
http://localhost:5001
```

### 🧠 Customer Classification

#### Classify Customers
```http
POST /customers/classify
Content-Type: application/json

[
  {
    "buyer": "customer1",
    "totalOrders": 15,
    "totalSpent": 50000000,
    "avgOrderValue": 3333333,
    "lastOrderDate": "2024-01-15"
  },
  {
    "buyer": "customer2",
    "totalOrders": 5,
    "totalSpent": 10000000,
    "avgOrderValue": 2000000,
    "lastOrderDate": "2024-01-10"
  }
]
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "buyer": "customer1",
      "customer_type": "whale",
      "cluster": 0,
      "cluster_rank": 0,
      "total_orders": 15,
      "total_spent": 50000000,
      "avg_order_value": 3333333,
      "last_order_date": "2024-01-15",
      "cluster_characteristics": {
        "avg_spending": 50000000,
        "avg_orders": 15,
        "avg_order_value": 3333333,
        "cluster_size": 1
      }
    }
  ],
  "message": "Classified 2 customers"
}
```

### 📈 Sales Prediction

#### Predict Sales
```http
POST /sales/predict
Content-Type: application/json

{
  "sku": "SKU001",
  "days_ahead": 30,
  "platform": "shopee"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sku": "SKU001",
    "predictions": [
      {
        "date": "2024-01-16",
        "predicted_quantity": 5,
        "confidence": 0.85
      },
      {
        "date": "2024-01-17",
        "predicted_quantity": 7,
        "confidence": 0.82
      }
    ],
    "total_predicted": 150,
    "avg_confidence": 0.82
  }
}
```

### 📦 Inventory Optimization

#### Get Optimization Recommendations
```http
GET /inventory/optimize
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sku": "SKU001",
      "current_stock": 150,
      "recommended_stock": 200,
      "reorder_point": 50,
      "urgency": "medium",
      "reason": "High demand trend detected"
    },
    {
      "sku": "SKU002",
      "current_stock": 20,
      "recommended_stock": 100,
      "reorder_point": 30,
      "urgency": "high",
      "reason": "Low stock with high sales velocity"
    }
  ],
  "message": "Generated 2 optimization recommendations"
}
```

### 🎯 Product Recommendations

#### Get Recommendations
```http
GET /products/recommend?buyer=customer1&limit=5
```

**Query Parameters:**
- `buyer` (required): Customer ID
- `limit` (optional): Number of recommendations (default: 5)

**Response:**
```json
{
  "success": true,
  "data": {
    "buyer": "customer1",
    "recommendations": [
      {
        "sku": "SKU001",
        "score": 0.95,
        "reason": "Frequently bought together with your recent purchases"
      },
      {
        "sku": "SKU002",
        "score": 0.87,
        "reason": "Popular among customers with similar preferences"
      }
    ]
  }
}
```

### 💬 AI Chatbot

#### Ask Chatbot
```http
POST /chatbot
Content-Type: application/json

{
  "question": "Tổng doanh số tháng này là bao nhiêu?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "Tổng doanh số tháng này là bao nhiêu?",
    "answer": "Tổng doanh số tháng này là 150 triệu VND, tăng 15% so với tháng trước.",
    "confidence": 0.85
  }
}
```

### ✅ Health Check

#### Check AI Service Status
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "ai-service",
  "version": "1.0.0"
}
```

## 🔄 AI Service Integration

### Backend Integration
The backend can call AI service APIs directly:

```javascript
// Customer classification
const response = await axios.post('http://localhost:5001/customers/classify', customerData);

// Sales prediction
const prediction = await axios.post('http://localhost:5001/sales/predict', {
  sku: 'SKU001',
  days_ahead: 30,
  platform: 'shopee'
});

// Chatbot
const answer = await axios.post('http://localhost:5001/chatbot', {
  question: 'Tổng doanh số tháng này?'
});
```

### Environment Variables
```bash
# Backend environment
BACKEND_URL=http://localhost:4001
AI_SERVICE_URL=http://localhost:5001
``` 