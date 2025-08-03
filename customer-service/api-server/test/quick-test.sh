#!/bin/bash

# Quick API Test - Kiểm tra nhanh server có hoạt động không
BASE_URL="http://localhost:4001"

echo "🚀 Quick API Test - $(date)"
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Test health check
echo "1. Testing Health Check..."
if curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi

# Test basic APIs
echo ""
echo "2. Testing Basic APIs..."

# Health check
if curl -s "$BASE_URL/health" | grep -q "OK"; then
    echo -e "${GREEN}✅ Health Check${NC}"
else
    echo -e "${RED}❌ Health Check${NC}"
fi

# Brands API
if curl -s "$BASE_URL/api/brands" | grep -q "success"; then
    echo -e "${GREEN}✅ Brands API${NC}"
else
    echo -e "${RED}❌ Brands API${NC}"
fi

# Categories API
if curl -s "$BASE_URL/api/categories" | grep -q "success"; then
    echo -e "${GREEN}✅ Categories API${NC}"
else
    echo -e "${RED}❌ Categories API${NC}"
fi

# Customers API
if curl -s "$BASE_URL/api/customers" | grep -q "success"; then
    echo -e "${GREEN}✅ Customers API${NC}"
else
    echo -e "${RED}❌ Customers API${NC}"
fi

# Items API
if curl -s "$BASE_URL/api/items" | grep -q "success"; then
    echo -e "${GREEN}✅ Items API${NC}"
else
    echo -e "${RED}❌ Items API${NC}"
fi

# Orders API
if curl -s "$BASE_URL/api/orders" | grep -q "success"; then
    echo -e "${GREEN}✅ Orders API${NC}"
else
    echo -e "${RED}❌ Orders API${NC}"
fi

# Analytics API
if curl -s "$BASE_URL/api/analytics/sales" | grep -q "success"; then
    echo -e "${GREEN}✅ Analytics API${NC}"
else
    echo -e "${RED}❌ Analytics API${NC}"
fi

echo ""
echo "🎯 Quick test completed!"
echo "For detailed tests, run: npm run test:curl" 