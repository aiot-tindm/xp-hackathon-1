# 📚 Postman Collection - Inventory Sales API (New Schema)

## 🎯 Overview

This Postman collection provides comprehensive API testing for the new inventory and sales management system with modern features including AI-powered analytics, customer loyalty tracking, and real-time stock management.

## 📦 Collection Structure

### 🛍️ Items Management
- **Get All Items**: Retrieve items with pagination and filtering
- **Get Single Item**: Get item details by ID
- **Create Item**: Create new items with brand/category relationships
- **Update Item**: Modify existing items
- **Delete Item**: Remove items (with validation)
- **Get Item Statistics**: View item performance metrics

### 📦 Orders Management
- **Get All Orders**: Retrieve orders with advanced filtering
- **Get Order Statistics**: View order analytics
- **Get Single Order**: Get order details by ID
- **Create Order**: Create orders with items and stock management
- **Update Order**: Modify order status and details
- **Delete Order**: Remove orders (with stock restoration)

### 🏷️ Brand Management
- **Get All Brands**: Retrieve brands with search functionality
- **Get Single Brand**: Get brand details by ID
- **Create Brand**: Add new brands
- **Update Brand**: Modify brand information
- **Delete Brand**: Remove brands (with validation)

### 📂 Category Management
- **Get All Categories**: Retrieve categories with search functionality
- **Get Single Category**: Get category details by ID
- **Create Category**: Add new categories
- **Update Category**: Modify category information
- **Delete Category**: Remove categories (with validation)

### 👥 Customer Management
- **Get All Customers**: Retrieve customers with search functionality
- **Get Single Customer**: Get customer details by ID
- **Create Customer**: Add new customers
- **Update Customer**: Modify customer information
- **Delete Customer**: Remove customers (with validation)

### 📤 Import APIs
- **Import Brands**: Bulk import brands from CSV
- **Import Categories**: Bulk import categories from CSV
- **Import Customers**: Bulk import customers from CSV
- **Import Items**: Bulk import items from CSV
- **Import Orders**: Bulk import orders from CSV
- **Import Order Items**: Bulk import order items from CSV
- **Import All Data (CSV)**: Import all data types using CSV files

### 🤖 AI Service
- **Health Check**: Check if AI service is running
- **Customer Classification**: AI-powered customer segmentation using K-means clustering
- **Sales Prediction**: Predict sales for specific SKU with time series analysis
- **Inventory Optimization**: Get smart inventory optimization recommendations
- **Product Recommendations**: Get personalized product recommendations for customers
- **Chatbot - Sales Question**: Ask chatbot about sales data and trends
- **Chatbot - Inventory Question**: Ask chatbot about inventory status and alerts
- **Chatbot - Customer Question**: Ask chatbot about customer data and insights
- **Chatbot - Revenue Question**: Ask chatbot about revenue predictions and analysis

### 📈 Analytics APIs
- **Sales Analytics**: Sales performance insights
- **Inventory Analytics**: Stock management analytics
- **Customer Analytics**: Customer behavior insights
- **Revenue Analytics**: Revenue trend analysis

## 🚀 Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select the `Inventory-Sales-API.postman_collection.json` file
4. The collection will be imported with all requests

### 2. Configure Environment Variables
Create a new environment in Postman with these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:4001/api` | Backend API base URL |
| `aiServiceUrl` | `http://localhost:5001` | AI Service base URL |

### 3. Test the APIs
1. Select the environment you created
2. Start with "Get All Items" to verify connection
3. Test other endpoints as needed

## 📋 CSV Import Setup

### File Requirements
- **Format**: CSV (Comma Separated Values)
- **Extension**: `.csv`
- **MIME Type**: `text/csv`
- **Size Limit**: 10MB
- **Encoding**: UTF-8
- **Delimiter**: Comma (,)
- **Header Row**: Required
- **Field Name**: `csv`

### CSV Headers

#### Brands CSV
```csv
name
Apple
Samsung
Nike
Adidas
```

#### Categories CSV
```csv
name
Electronics
Footwear
Clothing
Sports
```

#### Items CSV
```csv
sku,name,costPrice,salePrice,stockQuantity,brand,category,isActive
IPHONE-15-128,iPhone 15 128GB,800.00,999.00,50,Apple,Electronics,true
SAMSUNG-S24,Samsung Galaxy S24,700.00,899.00,30,Samsung,Electronics,true
```

#### Customers CSV
```csv
name,email,phoneNumber
John Doe,john.doe@example.com,0123456789
Jane Smith,jane.smith@example.com,0987654321
```

#### Orders CSV
```csv
orderCode,customerId,shippingLocation,platform,orderDate,status,refundReason
ORD-2024-001,1,123 Main St, Ho Chi Minh City,Shopee,2024-01-15 10:30:00,completed,
ORD-2024-002,2,456 Oak Ave, Hanoi,Lazada,2024-01-16 14:20:00,completed,
```

#### Order Items CSV
```csv
orderCode,sku,quantity,pricePerUnit,discountAmount
ORD-2024-001,IPHONE-15-128,2,999.00,50.00
ORD-2024-002,SAMSUNG-S24,1,899.00,0.00
```

### Using Postman for File Upload

#### Single File Import
1. Select the import request (e.g., "Import Items")
2. Go to the "Body" tab
3. Select "form-data"
4. Add key: `csv`, type: `File`
5. Select your CSV file
6. Send the request

#### Multiple Files Import (Import All Data)
1. Select "Import All Data (CSV)" request
2. Go to the "Body" tab
3. Select "form-data"
4. Add multiple keys with type `File`:
   - `brands`: brands.csv
   - `categories`: categories.csv
   - `customers`: customers.csv
   - `items`: items.csv
   - `orders`: orders.csv
   - `order_items`: order_items.csv
5. Select all CSV files
6. Send the request

### Using cURL for File Upload
```bash
# Import brands
curl -X POST http://localhost:4001/api/import/brands \
  -F "csv=@brands.csv"

# Import categories
curl -X POST http://localhost:4001/api/import/categories \
  -F "csv=@categories.csv"

# Import customers
curl -X POST http://localhost:4001/api/import/customers \
  -F "csv=@customers.csv"

# Import items
curl -X POST http://localhost:4001/api/import/items \
  -F "csv=@items.csv"

# Import orders
curl -X POST http://localhost:4001/api/import/orders \
  -F "csv=@orders.csv"

# Import order items
curl -X POST http://localhost:4001/api/import/order-items \
  -F "csv=@order_items.csv"

# Import all data at once
curl -X POST http://localhost:4001/api/import/all \
  -F "brands=@brands.csv" \
  -F "categories=@categories.csv" \
  -F "customers=@customers.csv" \
  -F "items=@items.csv" \
  -F "orders=@orders.csv" \
  -F "order_items=@order_items.csv"
```

## 🔄 Import Order

For data integrity, import in this order:
1. **Brands** (required for items)
2. **Categories** (required for items)
3. **Customers** (required for orders)
4. **Items** (requires brands and categories)
5. **Orders** (requires customers)
6. **Order Items** (requires orders and items)

**Note**: You can also use "Import All Data (CSV)" to import everything at once in the correct order.

## 📊 Sample Data

### Create Sample Items
```json
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

### Create Sample Order
```json
{
  "orderCode": "ORD-2024-001",
  "customerId": 1,
  "shippingLocation": "123 Main St, City",
  "platform": "Shopee",
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

### AI Customer Classification
```json
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

## ⚠️ Common Errors

### File Upload Errors
- **"CSV file is required"**: Make sure you're using form-data with key `csv`
- **"Only CSV files are allowed"**: Check file extension and MIME type
- **"File too large"**: Reduce file size (max 10MB)

### Validation Errors
- **"SKU is required"**: Ensure all required fields are provided
- **"Item not found"**: Check if referenced items exist
- **"Customer not found"**: Verify customer exists before creating orders

### Data Integrity Errors
- **"Cannot delete item with existing orders"**: Remove related orders first
- **"Insufficient stock"**: Check item stock before creating order items

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

## 🔧 Testing Tips

1. **Start with GET requests** to verify data structure
2. **Use pagination** for large datasets
3. **Test validation** with invalid data
4. **Check error responses** for proper handling
5. **Verify relationships** between entities
6. **Test file uploads** with different file types
7. **Monitor stock changes** when creating orders
8. **Test AI features** with various customer data

## 📞 Support

For issues or questions:
1. Check the API documentation
2. Verify environment variables
3. Test with cURL for file uploads
4. Review error messages carefully
5. Ensure proper import order 