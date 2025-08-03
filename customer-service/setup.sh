#!/bin/bash

echo "🚀 Setting up Customer Analytics & Inventory Management System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/logs
mkdir -p database/init
mkdir -p logs

# Copy environment file
echo "📝 Setting up environment variables..."
if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "✅ Environment file created. Please edit backend/.env with your configuration."
else
    echo "✅ Environment file already exists."
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Create database migration
echo "🗄️ Creating database migration..."
npx prisma migrate dev --name init

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check MySQL
if docker-compose exec mysql mysqladmin ping -h localhost -u root -proot123 &> /dev/null; then
    echo "✅ MySQL is healthy"
else
    echo "❌ MySQL is not healthy"
fi

echo ""
echo "🎉 First-time setup completed!"
echo ""
echo "📊 Services:"
echo "  - MySQL: localhost:3309"
echo ""
echo "🔧 Next steps:"
echo "  - Run './start.sh' to start development servers"
echo ""
echo "📚 Documentation:"
echo "  - README.md: Complete system documentation"
echo "  - docs/CUSTOMER_ANALYTICS.md: Customer Analytics API documentation"
echo ""
echo "🚀 Ready for development!" 