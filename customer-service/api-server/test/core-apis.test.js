const axios = require('axios');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4001/api';
const TEST_TIMEOUT = 10000; // 10 seconds

// Test data
const testData = {
  brand: {
    name: 'Test Brand ' + Date.now()
  },
  category: {
    name: 'Test Category ' + Date.now()
  },
  customer: {
    name: 'Test Customer ' + Date.now(),
    email: `test${Date.now()}@example.com`,
    phoneNumber: '0123456789'
  },
  item: {
    sku: 'TEST-SKU-' + Date.now(),
    name: 'Test Item ' + Date.now(),
    costPrice: 100.00,
    salePrice: 150.00,
    stockQuantity: 50,
    isActive: true
  },
  order: {
    orderCode: 'TEST-ORD-' + Date.now(),
    customerId: 1, // Will be updated after customer creation
    shippingLocation: 'Test Address',
    platform: 'Test Platform',
    status: 'pending',
    items: [
      {
        itemId: 1, // Will be updated after item creation
        quantity: 2,
        pricePerUnit: 150.00,
        discountAmount: 10.00
      }
    ]
  }
};

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const test = async (name, testFunction) => {
  try {
    log(`Testing: ${name}`);
    await testFunction();
    testResults.passed++;
    log(`PASSED: ${name}`, 'success');
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({ name, error: error.message });
    log(`FAILED: ${name} - ${error.message}`, 'error');
  }
};

// Simple expect function for basic assertions
const expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to be ${expected}`);
    }
  },
  toBeGreaterThanOrEqual: (expected) => {
    if (actual < expected) {
      throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
    }
  },
  toHaveProperty: (property) => {
    if (!(property in actual)) {
      throw new Error(`Expected object to have property ${property}`);
    }
  }
});

// Core Business API Test Functions

// Brands API Tests
const testBrandsAPI = async () => {
  let brandId;

  await test('Create Brand', async () => {
    const response = await axios.post(`${BASE_URL}/brands`, testData.brand);
    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.name).toBe(testData.brand.name);
    brandId = response.data.data.id;
  });

  await test('Get All Brands', async () => {
    const response = await axios.get(`${BASE_URL}/brands`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.brands)).toBe(true);
  });

  await test('Get Single Brand', async () => {
    const response = await axios.get(`${BASE_URL}/brands/${brandId}`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.id).toBe(brandId);
  });

  await test('Update Brand', async () => {
    const updateData = { name: 'Updated Test Brand' };
    const response = await axios.put(`${BASE_URL}/brands/${brandId}`, updateData);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.name).toBe(updateData.name);
  });

  await test('Delete Brand', async () => {
    const response = await axios.delete(`${BASE_URL}/brands/${brandId}`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });
};

// Categories API Tests
const testCategoriesAPI = async () => {
  let categoryId;

  await test('Create Category', async () => {
    const response = await axios.post(`${BASE_URL}/categories`, testData.category);
    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.name).toBe(testData.category.name);
    categoryId = response.data.data.id;
  });

  await test('Get All Categories', async () => {
    const response = await axios.get(`${BASE_URL}/categories`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.categories)).toBe(true);
  });

  await test('Get Single Category', async () => {
    const response = await axios.get(`${BASE_URL}/categories/${categoryId}`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.id).toBe(categoryId);
  });

  await test('Update Category', async () => {
    const updateData = { name: 'Updated Test Category' };
    const response = await axios.put(`${BASE_URL}/categories/${categoryId}`, updateData);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.name).toBe(updateData.name);
  });

  await test('Delete Category', async () => {
    const response = await axios.delete(`${BASE_URL}/categories/${categoryId}`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });
};

// Customers API Tests
const testCustomersAPI = async () => {
  let customerId;

  await test('Create Customer', async () => {
    const response = await axios.post(`${BASE_URL}/customers`, testData.customer);
    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.email).toBe(testData.customer.email);
    customerId = response.data.data.id;
    testData.order.customerId = customerId; // Update for order test
  });

  await test('Get All Customers', async () => {
    const response = await axios.get(`${BASE_URL}/customers`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.customers)).toBe(true);
  });

  await test('Get Single Customer', async () => {
    const response = await axios.get(`${BASE_URL}/customers/${customerId}`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.id).toBe(customerId);
  });

  await test('Update Customer', async () => {
    const updateData = { phoneNumber: '0987654321' };
    const response = await axios.put(`${BASE_URL}/customers/${customerId}`, updateData);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.phoneNumber).toBe(updateData.phoneNumber);
  });
};

// Items API Tests
const testItemsAPI = async () => {
  let itemId;

  // First create brand and category for item
  const brandResponse = await axios.post(`${BASE_URL}/brands`, { name: 'Test Brand for Item' });
  const categoryResponse = await axios.post(`${BASE_URL}/categories`, { name: 'Test Category for Item' });

  await test('Create Item', async () => {
    const itemData = {
      ...testData.item,
      brandId: brandResponse.data.data.id,
      categoryId: categoryResponse.data.data.id
    };
    const response = await axios.post(`${BASE_URL}/items`, itemData);
    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.sku).toBe(testData.item.sku);
    itemId = response.data.data.id;
    testData.order.items[0].itemId = itemId; // Update for order test
  });

  await test('Get All Items', async () => {
    const response = await axios.get(`${BASE_URL}/items`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.items)).toBe(true);
  });

  await test('Get Single Item', async () => {
    const response = await axios.get(`${BASE_URL}/items/${itemId}`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.id).toBe(itemId);
  });

  await test('Get Item Statistics', async () => {
    const response = await axios.get(`${BASE_URL}/items/${itemId}/stats`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.item.id).toBe(itemId);
  });

  await test('Update Item', async () => {
    const updateData = { salePrice: 160.00, stockQuantity: 45 };
    const response = await axios.put(`${BASE_URL}/items/${itemId}`, updateData);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.salePrice).toBe(updateData.salePrice.toString());
  });
};

// Orders API Tests
const testOrdersAPI = async () => {
  let orderId;

  await test('Create Order', async () => {
    const response = await axios.post(`${BASE_URL}/orders`, testData.order);
    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data.orderCode).toBe(testData.order.orderCode);
    orderId = response.data.data.id;
  });

  await test('Get All Orders', async () => {
    const response = await axios.get(`${BASE_URL}/orders`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data.orders)).toBe(true);
  });

  await test('Get Single Order', async () => {
    const response = await axios.get(`${BASE_URL}/orders/${orderId}`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.id).toBe(orderId);
  });

  await test('Get Order Statistics', async () => {
    const response = await axios.get(`${BASE_URL}/orders/stats`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.totalOrders).toBeGreaterThanOrEqual(1);
  });

  await test('Update Order', async () => {
    const updateData = { status: 'completed' };
    const response = await axios.put(`${BASE_URL}/orders/${orderId}`, updateData);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.status).toBe(updateData.status);
  });
};

// Analytics API Tests (Core Business Analytics)
const testAnalyticsAPI = async () => {
  await test('Get Sales Analytics', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/sales`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('totalSales');
  });

  await test('Get Inventory Analytics', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/inventory`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('totalItems');
  });

  await test('Get Revenue Analytics', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/revenue`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('totalRevenue');
  });
};

// Import API Tests
const testImportAPI = async () => {
  // Create test CSV files
  const csvData = {
    brands: 'name\nTest Brand Import',
    categories: 'name\nTest Category Import',
    customers: 'name,email,phoneNumber\nTest Customer,test@import.com,0123456789',
    items: 'sku,name,costPrice,salePrice,stockQuantity,brand,category,isActive\nTEST-IMPORT,Test Import Item,100.00,150.00,50,Test Brand Import,Test Category Import,true',
    orders: 'orderCode,customerId,shippingLocation,platform,orderDate,status,refundReason\nTEST-ORD-IMPORT,1,Test Address,Test Platform,2024-01-01 10:00:00,pending,',
    order_items: 'orderCode,sku,quantity,pricePerUnit,discountAmount\nTEST-ORD-IMPORT,TEST-IMPORT,1,150.00,0.00'
  };

  await test('Import Brands', async () => {
    const formData = new FormData();
    const blob = new Blob([csvData.brands], { type: 'text/csv' });
    formData.append('csv', blob, 'brands.csv');
    
    const response = await axios.post(`${BASE_URL}/import/brands`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  await test('Import Categories', async () => {
    const formData = new FormData();
    const blob = new Blob([csvData.categories], { type: 'text/csv' });
    formData.append('csv', blob, 'categories.csv');
    
    const response = await axios.post(`${BASE_URL}/import/categories`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });
};

// Health Check
const testHealthCheck = async () => {
  await test('Health Check - Server Running', async () => {
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    expect(response.status).toBe(200);
  });
};

// Main test runner
const runAllTests = async () => {
  log('🚀 Starting Core Business APIs Tests...', 'info');
  log(`Base URL: ${BASE_URL}`, 'info');

  const startTime = Date.now();

  try {
    // Run tests in order (dependencies matter)
    await testHealthCheck();
    await testBrandsAPI();
    await testCategoriesAPI();
    await testCustomersAPI();
    await testItemsAPI();
    await testOrdersAPI();
    await testAnalyticsAPI();
    await testImportAPI();

  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  // Print results
  log('\n📊 Core Business APIs Test Results:', 'info');
  log(`✅ Passed: ${testResults.passed}`, 'success');
  log(`❌ Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'info');
  log(`⏱️  Duration: ${duration}s`, 'info');

  if (testResults.errors.length > 0) {
    log('\n❌ Failed Tests:', 'error');
    testResults.errors.forEach(error => {
      log(`  - ${error.name}: ${error.error}`, 'error');
    });
  }

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  test,
  expect,
  testResults
}; 