#!/bin/bash

# Core Business APIs Test Script
# Tests: Brands, Categories, Customers, Items, Orders, Analytics

# Configuration
BASE_URL="http://localhost:4001"
API_BASE="$BASE_URL/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Helper functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_status="$5"
    
    log "Testing: $name"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT -H "Content-Type: application/json" -d "$data" "$url")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$url")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        success "PASSED: $name (Status: $status_code)"
        echo "Response: $response_body" | head -c 200
        echo ""
    else
        error "FAILED: $name (Expected: $expected_status, Got: $status_code)"
        echo "Response: $response_body"
    fi
    
    echo ""
}

# Test data
TIMESTAMP=$(date +%s)
TEST_BRAND="Core Test Brand $TIMESTAMP"
TEST_CATEGORY="Core Test Category $TIMESTAMP"
TEST_CUSTOMER_EMAIL="core-test$TIMESTAMP@example.com"

# Main test runner
main() {
    log "🚀 Starting Core Business APIs Tests..."
    log "Base URL: $BASE_URL"
    echo ""
    
    # Health Check
    test_api "Health Check" "GET" "$BASE_URL/health" "" "200"
    
    # Brands API Tests
    test_api "Get All Brands" "GET" "$API_BASE/brands" "" "200"
    test_api "Create Brand" "POST" "$API_BASE/brands" "{\"name\":\"$TEST_BRAND\"}" "201"
    test_api "Get All Brands (after create)" "GET" "$API_BASE/brands" "" "200"
    
    # Categories API Tests
    test_api "Get All Categories" "GET" "$API_BASE/categories" "" "200"
    test_api "Create Category" "POST" "$API_BASE/categories" "{\"name\":\"$TEST_CATEGORY\"}" "201"
    test_api "Get All Categories (after create)" "GET" "$API_BASE/categories" "" "200"
    
    # Customers API Tests
    test_api "Get All Customers" "GET" "$API_BASE/customers" "" "200"
    test_api "Create Customer" "POST" "$API_BASE/customers" "{\"name\":\"Core Test Customer $TIMESTAMP\",\"email\":\"$TEST_CUSTOMER_EMAIL\",\"phoneNumber\":\"0123456789\"}" "201"
    test_api "Get All Customers (after create)" "GET" "$API_BASE/customers" "" "200"
    
    # Items API Tests
    test_api "Get All Items" "GET" "$API_BASE/items" "" "200"
    
    # Orders API Tests
    test_api "Get All Orders" "GET" "$API_BASE/orders" "" "200"
    test_api "Get Order Statistics" "GET" "$API_BASE/orders/stats" "" "200"
    
    # Core Analytics API Tests (not Customer Analytics)
    test_api "Get Sales Analytics" "GET" "$API_BASE/analytics/sales" "" "200"
    test_api "Get Inventory Analytics" "GET" "$API_BASE/analytics/inventory" "" "200"
    test_api "Get Revenue Analytics" "GET" "$API_BASE/analytics/revenue" "" "200"
    
    # Print results
    echo ""
    log "📊 Core Business APIs Test Results:"
    success "Passed: $PASSED"
    if [ $FAILED -gt 0 ]; then
        error "Failed: $FAILED"
    else
        success "Failed: $FAILED"
    fi
    
    # Exit with appropriate code
    if [ $FAILED -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run tests
main "$@" 