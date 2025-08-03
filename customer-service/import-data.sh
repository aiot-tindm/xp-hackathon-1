#! /bin/bash

# Check if backend is running
if ! curl -s http://localhost:4001/health > /dev/null; then
  echo "❌ Backend is not running"
  exit 1
fi

# Import data
echo "🗄️ Importing data..."
result=$(curl -X POST http://localhost:4001/api/import/all \
  -F "brands=@database/csv-data/brands.csv" \
  -F "categories=@database/csv-data/categories.csv" \
  -F "customers=@database/csv-data/customers.csv" \
  -F "items=@database/csv-data/items.csv" \
  -F "orders=@database/csv-data/orders.csv" \
  -F "order_items=@database/csv-data/order_items.csv"
)

# show result
echo "🔍 Result: $result"

echo "✅ Data imported successfully"
