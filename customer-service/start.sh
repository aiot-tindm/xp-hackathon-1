#!/bin/bash

echo "🚀 Starting Customer Analytics & Inventory Management System (Development Mode)..."

# Check if services are running
echo "🔍 Checking if required services are running..."

# Check MySQL
if ! docker-compose exec mysql mysqladmin ping -h localhost -u root -proot123 &> /dev/null; then
    echo "❌ MySQL is not running. Please run './setup.sh' first."
    exit 1
fi

echo "✅ Required services are running"

# Start Backend API in development mode
echo "📦 Starting Backend API (Development Mode)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check Backend API
if curl -f http://localhost:4001/health &> /dev/null; then
    echo "✅ Backend API is healthy (http://localhost:4001)"
else
    echo "❌ Backend API is not healthy"
fi



echo ""
echo "🎉 Development servers started!"
echo ""
echo "📊 Services:"
echo "  - Backend API: http://localhost:4001"
echo "  - MySQL: localhost:3309"
echo ""
echo "📚 Documentation:"
echo "  - Backend API Docs: http://localhost:4001/api-docs"
echo "  - Customer Analytics: docs/CUSTOMER_ANALYTICS.md"
echo ""
echo "🔧 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
echo "  - Database migration: cd backend && npx prisma migrate dev"
echo ""
echo "🛑 To stop development servers, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Development servers stopped"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait 