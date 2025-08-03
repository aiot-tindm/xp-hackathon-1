#!/bin/bash

echo "�� Customer Analytics APIs Testing Script"
echo "=========================================="
echo ""

BASE_URL="http://localhost:4001/api"

# Check if server is running
echo "🔍 Checking if server is running..."
if curl -s $BASE_URL/../health > /dev/null 2>&1; then
    echo "✅ Server is running on port 4001"
else
    echo "❌ Server is not running on port 4001"
    echo "Please start the server first: npm run dev"
    exit 1
fi

echo ""

# Test Customer Analytics APIs
echo "🚀 Testing Customer Analytics APIs..."
echo ""

# 1. Test Customer Analytics Overview
echo "📊 Testing Customer Analytics Overview..."
curl -s "$BASE_URL/analytics/customers?page=1&limit=10&businessType=default" | jq '.'
echo ""

# 1.1. Test Customer Analytics with Business Type Filter
echo "🏢 Testing Customer Analytics with Business Type Filter..."
curl -s "$BASE_URL/analytics/customers?businessType=high_value&limit=5" | jq '.'
echo ""

# 1.2. Test Customer Analytics with Segment Filter
echo "🏷️ Testing Customer Analytics with Segment Filter..."
curl -s "$BASE_URL/analytics/customers?segment=vip&limit=5" | jq '.'
echo ""

# 1.3. Test Customer Analytics with Order Count Filter
echo "📦 Testing Customer Analytics with Order Count Filter..."
curl -s "$BASE_URL/analytics/customers?order_count_gte=3&order_count_lte=10&limit=5" | jq '.'
echo ""

# 1.4. Test Customer Analytics with Total Spent Filter
echo "💰 Testing Customer Analytics with Total Spent Filter..."
curl -s "$BASE_URL/analytics/customers?total_spent_gte=1000&total_spent_lte=10000&limit=5" | jq '.'
echo ""

# 1.5. Test Customer Analytics with Complex Filters
echo "🔍 Testing Customer Analytics with Complex Filters..."
curl -s "$BASE_URL/analytics/customers?segment=vip&order_count_gte=2&total_spent_gte=5000&limit=3" | jq '.'
echo ""

# 1.6. Test Customer Analytics with Days Since Last Order Filter
echo "⏰ Testing Customer Analytics with Days Since Last Order Filter..."
curl -s "$BASE_URL/analytics/customers?daysSinceLastOrder_gte=30&daysSinceLastOrder_lte=90&limit=5" | jq '.'
echo ""

# 1.7. Test Customer Analytics with Previous Last Order Filter
echo "📅 Testing Customer Analytics with Previous Last Order Filter..."
curl -s "$BASE_URL/analytics/customers?previousLastOrder_gte=2024-01-01&limit=5" | jq '.'
echo ""

# 2. Test Individual Customer Analysis
echo "👤 Testing Individual Customer Analysis..."
curl -s "$BASE_URL/analytics/customers/1?days=30" | jq '.'
echo ""

# 3. Test Customer Predictions & Trends
echo "💰 Testing Customer Predictions & Trends..."
curl -s -X POST "$BASE_URL/analytics/customers/predictions" \
  -H "Content-Type: application/json" \
  -d '{"customerIds": [1, 2, 3], "includeRecommendations": true}' | jq '.'
echo ""

# 4. Test Customer RFM Analysis
echo "📈 Testing Customer RFM Analysis..."
curl -s "$BASE_URL/analytics/customers/rfm?businessType=default" | jq '.'
echo ""

# 5. Test Customer Churn Prediction
echo "⚠️ Testing Customer Churn Prediction..."
curl -s "$BASE_URL/analytics/customers/churn-prediction?days=90&businessType=default" | jq '.'
echo ""

# 6. Test Potential Customer Suggestions
echo "🎯 Testing Potential Customer Suggestions..."
curl -s "$BASE_URL/analytics/customers/new-inventory-matching?productIds=1,2&categoryIds=1&limit=10&businessType=default" | jq '.'
echo ""

# Test Error Handling
echo "🚫 Testing Error Handling - Invalid Customer ID..."
curl -s "$BASE_URL/analytics/customers/999999?days=30" | jq '.'
echo ""

echo "✅ Customer Analytics APIs Testing Completed!"
echo ""
echo "📋 Summary of APIs tested:"
echo "1. GET /api/analytics/customers (Overview)"
echo "1.1. GET /api/analytics/customers (Business Type Filter)"
echo "1.2. GET /api/analytics/customers (Segment Filter)"
echo "1.3. GET /api/analytics/customers (Order Count Filter)"
echo "1.4. GET /api/analytics/customers (Total Spent Filter)"
echo "1.5. GET /api/analytics/customers (Complex Filters)"
echo "1.6. GET /api/analytics/customers (Days Since Last Order Filter)"
echo "1.7. GET /api/analytics/customers (Previous Last Order Filter)"
echo "2. GET /api/analytics/customers/:customerId (Individual Analysis)"
echo "3. POST /api/analytics/customers/predictions (Predictions & Trends)"
echo "4. GET /api/analytics/customers/rfm (RFM Analysis)"
echo "5. GET /api/analytics/customers/churn-prediction (Churn Prediction)"
echo "6. GET /api/analytics/customers/new-inventory-matching (Potential Customers)"
echo ""
echo "🎯 All APIs should return success: true if working correctly"
echo "📊 These are the 6 specialized Customer Analytics APIs" 