const axios = require('axios');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4001/api';
const TEST_TIMEOUT = 10000; // 10 seconds

// Test data
const testCustomerId = 1; // Assuming customer ID 1 exists

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

// Customer Analytics API Test Functions

// 1. Test Customer Analytics Overview
const testCustomerAnalyticsOverview = async () => {
  await test('GET /api/analytics/customers (Overview)', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/customers`, {
      params: {
        page: 1,
        limit: 10,
        businessType: 'default'
      }
    });

    console.log('✅ Customer Analytics Overview Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Total Customers:', response.data.data.summary.totalCustomers);
    console.log('New Customers:', response.data.data.summary.newCustomers);
    console.log('Segments:', Object.keys(response.data.data.summary.segments));
    console.log('Top Customers:', response.data.data.customers.length);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('summary');
    expect(response.data.data).toHaveProperty('customers');
    
    console.log('✅ Customer Analytics Overview test passed!\n');
  });
};

// 2. Test Customer Analytics with Business Type Filter
const testCustomerAnalyticsBusinessType = async () => {
  await test('GET /api/analytics/customers (Business Type Filter)', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/customers`, {
      params: {
        businessType: 'high_value',
        limit: 5
      }
    });

    console.log('✅ Customer Analytics Business Type Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Total Customers:', response.data.data.summary.totalCustomers);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('summary');
    expect(response.data.data).toHaveProperty('customers');
    
    console.log('✅ Customer Analytics Business Type test passed!\n');
  });
};

// 3. Test Customer Analytics with Segment Filter
const testCustomerAnalyticsSegment = async () => {
  await test('GET /api/analytics/customers (Segment Filter)', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/customers`, {
      params: {
        segment: 'vip',
        limit: 5
      }
    });

    console.log('✅ Customer Analytics Segment Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Total Customers:', response.data.data.summary.totalCustomers);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('summary');
    expect(response.data.data).toHaveProperty('customers');
    
    console.log('✅ Customer Analytics Segment test passed!\n');
  });
};

// 4. Test Individual Customer Analysis
const testIndividualCustomerAnalysis = async () => {
  await test('GET /api/analytics/customers/:customerId', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/customers/1`, {
      params: {
        days: 30
      }
    });

    console.log('✅ Individual Customer Analysis Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Customer ID:', response.data.data.customer.id);
    console.log('Customer Name:', response.data.data.customer.name);
    console.log('Total Orders:', response.data.data.analysis.totalOrders);
    console.log('Segment:', response.data.data.analysis.segment);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('customer');
    expect(response.data.data).toHaveProperty('analysis');
    
    console.log('✅ Individual Customer Analysis test passed!\n');
  });
};

// 5. Test Customer Predictions
const testCustomerPredictions = async () => {
  await test('POST /api/analytics/customers/predictions', async () => {
    const requestBody = {
      customerIds: [1, 2, 3],
      includeRecommendations: true
    };

    const response = await axios.post(`${BASE_URL}/analytics/customers/predictions`, requestBody);

    console.log('✅ Customer Predictions Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Total Predictions:', response.data.data.predictions.length);
    console.log('Overall Metrics:', response.data.data.overallMetrics);

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('predictions');
    expect(response.data.data).toHaveProperty('overallMetrics');
    
    console.log('✅ Customer Predictions test passed!\n');
  });
};

// 6. Test Customer RFM Analysis
const testCustomerRFMAnalysis = async () => {
  await test('GET /api/analytics/customers/rfm', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/customers/rfm`, {
      params: {
        businessType: 'default'
      }
    });

    console.log('✅ Customer RFM Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Total Customers Analyzed:', response.data.data.summary.totalCustomers);
    console.log('Average RFM Score:', response.data.data.summary.avgRFMScore);

    if (response.data.data.customers.length > 0) {
      const sampleCustomer = response.data.data.customers[0];
      console.log('Sample Customer RFM:');
      console.log('  Customer ID:', sampleCustomer.customerId);
      console.log('  RFM Score:', sampleCustomer.rfmScore);
      console.log('  Segment:', sampleCustomer.segment);
    }

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('customers');
    expect(response.data.data).toHaveProperty('summary');
    
    console.log('✅ Customer RFM test passed!\n');
  });
};

// 7. Test Customer Churn Prediction
const testCustomerChurnPrediction = async () => {
  await test('GET /api/analytics/customers/churn-prediction', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/customers/churn-prediction`, {
      params: {
        days: 90,
        businessType: 'default'
      }
    });

    console.log('✅ Customer Churn Prediction Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Total Analyzed:', response.data.data.summary.totalAnalyzed);
    console.log('High Risk:', response.data.data.summary.highRisk);
    console.log('Medium Risk:', response.data.data.summary.mediumRisk);
    console.log('Low Risk:', response.data.data.summary.lowRisk);

    if (response.data.data.predictions.length > 0) {
      const highRiskCustomers = response.data.data.predictions.filter(c => c.riskLevel === 'high');
      console.log('High Risk Customers:', highRiskCustomers.length);
    }

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('predictions');
    expect(response.data.data).toHaveProperty('summary');
    
    console.log('✅ Customer Churn Prediction test passed!\n');
  });
};

// 8. Test Potential Customer Suggestions
const testPotentialCustomerSuggestions = async () => {
  await test('GET /api/analytics/customers/new-inventory-matching', async () => {
    const response = await axios.get(`${BASE_URL}/analytics/customers/new-inventory-matching`, {
      params: {
        productIds: '1,2',
        categoryIds: '1',
        limit: 10,
        businessType: 'default'
      }
    });

    console.log('✅ Potential Customer Suggestions Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Total Analyzed:', response.data.data.summary.totalAnalyzed);
    console.log('High Interest:', response.data.data.summary.highInterestCustomers);
    console.log('Medium Interest:', response.data.data.summary.mediumInterestCustomers);
    console.log('Low Interest:', response.data.data.summary.lowInterestCustomers);
    console.log('Avg Interest Score:', response.data.data.summary.avgInterestScore);
    console.log('Total Potential Revenue:', response.data.data.summary.totalPotentialRevenue);

    if (response.data.data.potentialCustomers.length > 0) {
      const sampleCustomer = response.data.data.potentialCustomers[0];
      console.log('Sample Customer:');
      console.log('  Customer ID:', sampleCustomer.customerId);
      console.log('  Interest Score:', sampleCustomer.interestScore);
      console.log('  Interest Level:', sampleCustomer.interestLevel);
      console.log('  Target Segment:', sampleCustomer.marketingInsights.targetSegment);
      console.log('  Lead Score:', sampleCustomer.salesIntelligence.leadScore);
      console.log('  Conversion Probability:', sampleCustomer.salesIntelligence.conversionProbability);
      console.log('  Demand Forecast:', sampleCustomer.inventoryInsights.demandForecast);
    }

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('potentialCustomers');
    expect(response.data.data).toHaveProperty('summary');
    
    if (response.data.data.potentialCustomers.length > 0) {
      const customer = response.data.data.potentialCustomers[0];
      expect(customer).toHaveProperty('customerId');
      expect(customer).toHaveProperty('customer');
      expect(customer).toHaveProperty('totalSpent');
      expect(customer).toHaveProperty('similarProducts');
      expect(customer).toHaveProperty('interestScore');
      expect(customer).toHaveProperty('interestLevel');
      expect(customer).toHaveProperty('marketingInsights');
      expect(customer).toHaveProperty('salesIntelligence');
      expect(customer).toHaveProperty('inventoryInsights');
      expect(customer).toHaveProperty('demographics');
      
      // Check marketing insights structure
      expect(customer.marketingInsights).toHaveProperty('targetSegment');
      expect(customer.marketingInsights).toHaveProperty('preferredChannels');
      expect(customer.marketingInsights).toHaveProperty('optimalTiming');
      expect(customer.marketingInsights).toHaveProperty('priceRange');
      expect(customer.marketingInsights).toHaveProperty('campaignSuggestions');
      
      // Check sales intelligence structure
      expect(customer.salesIntelligence).toHaveProperty('leadScore');
      expect(customer.salesIntelligence).toHaveProperty('conversionProbability');
      expect(customer.salesIntelligence).toHaveProperty('salesCycle');
      expect(customer.salesIntelligence).toHaveProperty('dealSize');
      expect(customer.salesIntelligence).toHaveProperty('followUpActions');
      
      // Check inventory insights structure
      expect(customer.inventoryInsights).toHaveProperty('demandForecast');
      expect(customer.inventoryInsights).toHaveProperty('stockRecommendation');
      expect(customer.inventoryInsights).toHaveProperty('seasonalFactor');
      expect(customer.inventoryInsights).toHaveProperty('supplyChainImpact');
    }
    
    // Check summary structure
    expect(response.data.data.summary).toHaveProperty('totalAnalyzed');
    expect(response.data.data.summary).toHaveProperty('avgInterestScore');
    expect(response.data.data.summary).toHaveProperty('highInterestCustomers');
    expect(response.data.data.summary).toHaveProperty('mediumInterestCustomers');
    expect(response.data.data.summary).toHaveProperty('lowInterestCustomers');
    expect(response.data.data.summary).toHaveProperty('totalPotentialRevenue');
    expect(response.data.data.summary).toHaveProperty('config');
    
    console.log('✅ Potential Customer Suggestions test passed!\n');
  });
};

// Main test runner
const runAllTests = async () => {
  log('🧠 Starting Customer Analytics APIs Tests...', 'info');
  log(`Base URL: ${BASE_URL}`, 'info');

  const startTime = Date.now();

  try {
    // Run tests in order
    await testCustomerAnalyticsOverview();
    await testCustomerAnalyticsBusinessType();
    await testCustomerAnalyticsSegment();
    await testIndividualCustomerAnalysis();
    await testCustomerPredictions();
    await testCustomerRFMAnalysis();
    await testCustomerChurnPrediction();
    await testPotentialCustomerSuggestions();

  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  // Print results
  log('\n📊 Customer Analytics APIs Test Results:', 'info');
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