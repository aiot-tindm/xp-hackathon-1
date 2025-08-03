#!/bin/bash

# CI/CD API Test Script
# Sử dụng trong GitHub Actions, Docker, hoặc CI/CD pipeline

set -e  # Exit on any error

# Configuration
BASE_URL="${TEST_BASE_URL:-http://localhost:4001}"
API_BASE="$BASE_URL/api"
TIMEOUT=30
RETRIES=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
PASSED=0
FAILED=0
ERRORS=()

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
    ERRORS+=("$1")
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Wait for server to be ready
wait_for_server() {
    log "Waiting for server to be ready..."
    local attempts=0
    while [ $attempts -lt $TIMEOUT ]; do
        if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
            log "Server is ready!"
            return 0
        fi
        sleep 1
        ((attempts++))
    done
    error "Server did not start within $TIMEOUT seconds"
    return 1
}

# Test API with retry
test_api_with_retry() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_status="$5"
    local retry_count=0
    
    while [ $retry_count -lt $RETRIES ]; do
        if test_api "$name" "$method" "$url" "$data" "$expected_status"; then
            return 0
        fi
        ((retry_count++))
        if [ $retry_count -lt $RETRIES ]; then
            warning "Retrying $name (attempt $retry_count/$RETRIES)..."
            sleep 2
        fi
    done
    return 1
}

# Test single API
test_api() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    local expected_status="$5"
    
    log "Testing: $name"
    
    local response
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" --max-time 10 "$url")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" --max-time 10 -X POST -H "Content-Type: application/json" -d "$data" "$url")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" --max-time 10 -X PUT -H "Content-Type: application/json" -d "$data" "$url")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" --max-time 10 -X DELETE "$url")
    fi
    
    # Extract status code (last line)
    local status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    local response_body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        success "PASSED: $name (Status: $status_code)"
        return 0
    else
        error "FAILED: $name (Expected: $expected_status, Got: $status_code)"
        echo "Response: $response_body"
        return 1
    fi
}

# Test data
TIMESTAMP=$(date +%s)
TEST_BRAND="CI Test Brand $TIMESTAMP"
TEST_CATEGORY="CI Test Category $TIMESTAMP"
TEST_CUSTOMER_EMAIL="ci-test$TIMESTAMP@example.com"

# Main test runner
main() {
    log "🚀 Starting CI/CD API Tests..."
    log "Base URL: $BASE_URL"
    log "Timeout: ${TIMEOUT}s"
    log "Retries: $RETRIES"
    echo ""
    
    # Wait for server
    if ! wait_for_server; then
        exit 1
    fi
    
    # Health Check
    test_api_with_retry "Health Check" "GET" "$BASE_URL/health" "" "200"
    
    # Critical APIs (must pass)
    test_api_with_retry "Get All Brands" "GET" "$API_BASE/brands" "" "200"
    test_api_with_retry "Get All Categories" "GET" "$API_BASE/categories" "" "200"
    test_api_with_retry "Get All Customers" "GET" "$API_BASE/customers" "" "200"
    test_api_with_retry "Get All Items" "GET" "$API_BASE/items" "" "200"
    test_api_with_retry "Get All Orders" "GET" "$API_BASE/orders" "" "200"
    
    # Create operations (test data creation)
    test_api_with_retry "Create Brand" "POST" "$API_BASE/brands" "{\"name\":\"$TEST_BRAND\"}" "201"
    test_api_with_retry "Create Category" "POST" "$API_BASE/categories" "{\"name\":\"$TEST_CATEGORY\"}" "201"
    test_api_with_retry "Create Customer" "POST" "$API_BASE/customers" "{\"name\":\"CI Test Customer $TIMESTAMP\",\"email\":\"$TEST_CUSTOMER_EMAIL\",\"phoneNumber\":\"0123456789\"}" "201"
    
    # Analytics APIs
    test_api_with_retry "Get Sales Analytics" "GET" "$API_BASE/analytics/sales" "" "200"
    test_api_with_retry "Get Inventory Analytics" "GET" "$API_BASE/analytics/inventory" "" "200"
    test_api_with_retry "Get Customer Analytics" "GET" "$API_BASE/analytics/customers" "" "200"
    test_api_with_retry "Get Revenue Analytics" "GET" "$API_BASE/analytics/revenue" "" "200"
    
    # Print results
    echo ""
    log "📊 CI/CD Test Results:"
    success "Passed: $PASSED"
    if [ $FAILED -gt 0 ]; then
        error "Failed: $FAILED"
        echo ""
        log "❌ Failed Tests:"
        for error in "${ERRORS[@]}"; do
            echo "  - $error"
        done
    else
        success "Failed: $FAILED"
    fi
    
    # Exit with appropriate code
    if [ $FAILED -gt 0 ]; then
        log "❌ CI/CD Tests failed!"
        exit 1
    else
        log "✅ All CI/CD Tests passed!"
        exit 0
    fi
}

# Run tests
main "$@" 