# 🧪 Test Files Documentation

## 📋 Overview

Test files được tổ chức theo 2 nhóm chính:
- **Core Business APIs**: Brands, Categories, Customers, Items, Orders
- **Customer Analytics APIs**: 6 specialized Customer Analytics endpoints

## 🚀 Quick Start

### 1. Health Check (Nhanh nhất)
```bash
./quick-test.sh
```
**Purpose**: Kiểm tra nhanh server có hoạt động không
**Duration**: ~5 giây
**Coverage**: Health check + basic API availability

### 2. Core Business APIs Testing
```bash
# Option 1: Node.js tests (Recommended)
npm run test:api

# Option 2: Shell script tests
./test-core-apis.sh
```
**Purpose**: Test toàn bộ Core Business APIs
**Duration**: ~30 giây
**Coverage**: CRUD operations cho Brands, Categories, Customers, Items, Orders

### 3. Customer Analytics APIs Testing
```bash
# Option 1: Node.js tests (Recommended)
npm run test:customer-analytics

# Option 2: Shell script tests
./test-customer-analytics.sh
```
**Purpose**: Test 6 Customer Analytics APIs
**Duration**: ~20 giây
**Coverage**: Customer Analytics Overview, Individual Analysis, Predictions, RFM, Churn, Potential Customers

### 4. Full Integration Testing
```bash
# Run all tests
npm run test:all

# CI/CD testing
./ci-test.sh
```
**Purpose**: Test toàn bộ hệ thống
**Duration**: ~60 giây
**Coverage**: Core Business + Customer Analytics + Integration

## 📁 File Structure

```
backend/test/
├── README.md                           # This documentation
├── quick-test.sh                       # Quick health check
├── test-core-apis.sh                   # Core Business APIs (Shell)
├── test-customer-analytics.sh          # Customer Analytics APIs (Shell)
├── core-apis.test.js                   # Core Business APIs (Node.js)
├── customer-analytics.test.js          # Customer Analytics APIs (Node.js)
├── ci-test.sh                          # CI/CD integration tests
└── utils/
    ├── test-helpers.js                 # Common test utilities
    └── test-data.js                    # Test data generators
```

## 🎯 Test Categories

### Core Business APIs
- **Brands**: CRUD operations
- **Categories**: CRUD operations  
- **Customers**: CRUD operations
- **Items**: CRUD operations + statistics
- **Orders**: CRUD operations + statistics
- **Analytics**: Sales, Inventory, Revenue analytics

### Customer Analytics APIs
- **Customer Analytics Overview**: Segmentation, filters, business types
- **Individual Customer Analysis**: Detailed customer metrics
- **Customer Predictions**: CLV, churn risk, recommendations
- **Customer RFM Analysis**: Recency, Frequency, Monetary scoring
- **Customer Churn Prediction**: Risk levels, retention strategies
- **Potential Customer Suggestions**: Marketing insights, sales intelligence

## 🔧 Test Commands

### Package.json Scripts
```json
{
  "scripts": {
    "test:quick": "./test/quick-test.sh",
    "test:core": "node test/core-apis.test.js",
    "test:customer-analytics": "node test/customer-analytics.test.js",
    "test:all": "npm run test:core && npm run test:customer-analytics",
    "test:ci": "./test/ci-test.sh"
  }
}
```

### Manual Commands
```bash
# Quick health check
./test/quick-test.sh

# Core Business APIs
./test/test-core-apis.sh
node test/core-apis.test.js

# Customer Analytics APIs
./test/test-customer-analytics.sh
node test/customer-analytics.test.js

# CI/CD testing
./test/ci-test.sh
```

## 📊 Test Results

### Success Indicators
- ✅ **Health Check**: Server running, basic APIs responding
- ✅ **Core APIs**: All CRUD operations working
- ✅ **Customer Analytics**: All 6 APIs returning correct data
- ✅ **Integration**: End-to-end workflows working

### Common Issues
- ❌ **Server not running**: Run `npm run dev` first
- ❌ **Database connection**: Check MySQL is running
- ❌ **Missing data**: Run `./import-data.sh` to import sample data

## 🚀 Best Practices

### Development Workflow
1. **Start server**: `npm run dev`
2. **Quick check**: `npm run test:quick`
3. **Core APIs**: `npm run test:core`
4. **Customer Analytics**: `npm run test:customer-analytics`

### CI/CD Pipeline
1. **Health check**: `./test/quick-test.sh`
2. **Full testing**: `./test/ci-test.sh`
3. **Integration**: `npm run test:all`

### Debugging
- Check server logs: `tail -f logs/all.log`
- Check test logs: Test output includes detailed error messages
- Verify data: Ensure sample data is imported

## 📈 Test Coverage

### Core Business APIs: 100%
- ✅ Brands: Create, Read, Update, Delete
- ✅ Categories: Create, Read, Update, Delete
- ✅ Customers: Create, Read, Update, Delete
- ✅ Items: Create, Read, Update, Delete, Statistics
- ✅ Orders: Create, Read, Update, Statistics
- ✅ Analytics: Sales, Inventory, Revenue

### Customer Analytics APIs: 100%
- ✅ Customer Analytics Overview: All filters and business types
- ✅ Individual Customer Analysis: Detailed metrics and trends
- ✅ Customer Predictions: CLV, churn, recommendations
- ✅ Customer RFM Analysis: Scoring and segmentation
- ✅ Customer Churn Prediction: Risk assessment
- ✅ Potential Customer Suggestions: Marketing and sales intelligence

## 🔄 Migration from Old Tests

### Removed Files (Trùng lặp)
- `api.test.js` → Replaced by `core-apis.test.js`
- `simple-api-test.js` → Replaced by `core-apis.test.js`
- `curl-api-test.sh` → Replaced by `test-core-apis.sh`
- `test-customer-analytics.sh` → Updated version

### New Structure
- **Clear separation**: Core Business vs Customer Analytics
- **No duplication**: Each API tested once
- **Consistent format**: Standardized test structure
- **Better organization**: Logical grouping and naming 