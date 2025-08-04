#!/usr/bin/env python3
"""
SQLAlchemy Models for Analytics System
Định nghĩa models cho hệ thống analytics
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Date, Boolean, Text, ForeignKey, text
from sqlalchemy.types import DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create base class
Base = declarative_base()

# Main tables
class Brand(Base):
    """Brand model"""
    __tablename__ = 'brands'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Category(Base):
    """Category model"""
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Item(Base):
    """Item model"""
    __tablename__ = 'items'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    sku = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    cost_price = Column(DECIMAL(10, 2), nullable=False, default=0)
    sale_price = Column(DECIMAL(10, 2), nullable=False)
    stock_quantity = Column(Integer, default=0)
    brand_id = Column(Integer, ForeignKey('brands.id'))
    category_id = Column(Integer, ForeignKey('categories.id'))
    is_active = Column(Boolean, default=True)
    is_adult_content = Column(Boolean)
    nudity_detection_score = Column(DECIMAL(3, 2))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    brand = relationship("Brand")
    category = relationship("Category")

class Batch(Base):
    """Batch model"""
    __tablename__ = 'batches'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    sku = Column(String(100), ForeignKey('items.sku'), nullable=False)
    import_date = Column(Date, nullable=False)
    total_quantity = Column(Integer, nullable=False, default=0)
    remain_quantity = Column(Integer, nullable=False, default=0)
    
    # Relationship
    item = relationship("Item")

class Order(Base):
    """Order model"""
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_code = Column(String(50), nullable=False, unique=True)
    customer_id = Column(Integer, nullable=False)
    shipping_location = Column(String(255))
    platform = Column(String(50), nullable=False)
    order_date = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=False)
    refund_reason = Column(String(255))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationship
    order_items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    """OrderItem model"""
    __tablename__ = 'order_items'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    item_id = Column(Integer, ForeignKey('items.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_per_unit = Column(DECIMAL(10, 2), nullable=False)
    discount_amount = Column(DECIMAL(10, 2), default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    item = relationship("Item")

# Summary tables for analytics results
from sqlalchemy import Enum, PrimaryKeyConstraint

# Update your model classes with composite primary keys
class TopSellingItem(Base):
    __tablename__ = 'top_selling_items'
    
    analysis_date = Column(Date, nullable=False)
    data_range = Column(Enum('1_day_ago', '7_days_ago', '1_month_ago', '3_months_ago', '6_months_ago', '1_year_ago', 'all_time'), nullable=False)
    sort_type = Column(Enum('revenue', 'profit', 'quantity'), nullable=False)
    sku = Column(String(100), nullable=False)
    item_name = Column(String(200), nullable=False)
    total_quantity_sold = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(10,2), default=0)
    total_profit = Column(DECIMAL(10,2), default=0)
    rank_position = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    __table_args__ = (
        PrimaryKeyConstraint('analysis_date', 'data_range', 'sort_type', 'sku'),
    )

class CategorySummary(Base):
    __tablename__ = 'category_summary'
    
    analysis_date = Column(Date, nullable=False)
    data_range = Column(Enum('1_day_ago', '7_days_ago', '1_month_ago', '3_months_ago', '6_months_ago', '1_year_ago', 'all_time'), nullable=False)
    sort_type = Column(Enum('revenue', 'quantity'), nullable=False)
    category_id = Column(Integer, nullable=False)
    category_name = Column(String(200), nullable=False)
    total_quantity_sold = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(10,2), default=0)
    total_profit = Column(DECIMAL(10,2), default=0)
    profit_margin = Column(DECIMAL(5,2), default=0)
    rank_position = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    __table_args__ = (
        PrimaryKeyConstraint('analysis_date', 'data_range', 'sort_type', 'category_id'),
    )

class BrandSummary(Base):
    __tablename__ = 'brand_summary'
    
    analysis_date = Column(Date, nullable=False)
    data_range = Column(Enum('1_day_ago', '7_days_ago', '1_month_ago', '3_months_ago', '6_months_ago', '1_year_ago', 'all_time'), nullable=False)
    sort_type = Column(Enum('revenue', 'quantity', 'profit'), nullable=False)
    brand_id = Column(Integer, nullable=False)
    brand_name = Column(String(200), nullable=False)
    total_quantity_sold = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(10,2), default=0)
    total_profit = Column(DECIMAL(10,2), default=0)
    profit_margin = Column(DECIMAL(5,2), default=0)
    rank_position = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    __table_args__ = (
        PrimaryKeyConstraint('analysis_date', 'data_range', 'sort_type', 'brand_id'),
    )

class RefundAnalysis(Base):
    __tablename__ = 'refund_analysis'
    
    analysis_date = Column(Date, nullable=False)
    data_range = Column(Enum('1_day_ago', '7_days_ago', '1_month_ago', '3_months_ago', '6_months_ago', '1_year_ago', 'all_time'), nullable=False)
    sort_type = Column(Enum('refund_count', 'refund_rate', 'refund_quantity', 'refund_reason'), nullable=False)
    sku = Column(String(100), nullable=False)
    item_name = Column(String(200))
    total_orders = Column(Integer, default=0)
    refund_orders = Column(Integer, default=0)
    refund_rate = Column(DECIMAL(5,2), default=0)
    refund_reason = Column(String(200))
    refund_quantity = Column(Integer, default=0)
    items_affected = Column(Integer, default=0)
    rank_position = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    __table_args__ = (
        PrimaryKeyConstraint('analysis_date', 'data_range', 'sort_type', 'sku'),
    )

class DailySalesSummary(Base):
    __tablename__ = 'daily_sales_summary'
    
    analysis_date = Column(Date, nullable=False)
    total_orders = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(10,2), default=0)
    total_profit = Column(DECIMAL(10,2), default=0)
    total_refunds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    __table_args__ = (
        PrimaryKeyConstraint('analysis_date'),
    )

class LowStockAlert(Base):
    __tablename__ = 'low_stock_alerts'
    
    analysis_date = Column(Date, nullable=False)
    sku = Column(String(100), nullable=False)
    item_name = Column(String(200), nullable=False)
    current_stock = Column(Integer, default=0)
    avg_daily_sales = Column(DECIMAL(10,2), default=0.00)
    days_left = Column(DECIMAL(10,2), default=0.00)
    alert_type = Column(Enum('out_of_stock', 'low_stock', 'expiring_soon'), default='low_stock')
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    __table_args__ = (
        PrimaryKeyConstraint('analysis_date', 'sku'),
    )

class SlowMovingItem(Base):
    """Model cho phân tích hàng bán ế"""
    __tablename__ = 'slow_moving_items'
    
    analysis_date = Column(Date, nullable=False)
    sort_type = Column(Enum('no_sales', 'low_sales', 'high_stock_low_sales', 'aging_stock'), nullable=False)
    sku = Column(String(100), nullable=False)
    item_name = Column(String(200), nullable=False)
    brand_name = Column(String(200))
    category_name = Column(String(200))
    current_stock = Column(Integer, default=0)
    total_quantity_sold = Column(Integer, default=0)
    total_revenue = Column(DECIMAL(15,2), default=0)
    total_profit = Column(DECIMAL(15,2), default=0)
    profit_margin = Column(DECIMAL(5,2), default=0)
    stock_to_sales_ratio = Column(DECIMAL(10,2), default=0)
    stock_value = Column(DECIMAL(10,2), default=0)
    potential_loss = Column(DECIMAL(10,2), default=0)
    cost_price = Column(DECIMAL(10,2), default=0)
    sale_price = Column(DECIMAL(10,2), default=0)
    days_in_stock = Column(Integer, default=0)
    rank_position = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    __table_args__ = (
        PrimaryKeyConstraint('analysis_date', 'sort_type', 'sku'),
    )

class RevenuePrediction(Base):
    """Model cho dự đoán doanh thu"""
    __tablename__ = 'revenue_predictions'
    
    analysis_date = Column(Date, nullable=False)
    prediction_period = Column(String(50), nullable=False)  # 'next_month', 'next_quarter', etc.
    prediction_days = Column(Integer, default=30)
    
    # Historical data
    total_historical_revenue = Column(DECIMAL(15,2), default=0)
    avg_daily_revenue = Column(DECIMAL(15,2), default=0)
    std_daily_revenue = Column(DECIMAL(15,2), default=0)
    data_days = Column(Integer, default=0)
    trend_percentage = Column(DECIMAL(5,2), default=0)
    r2_score = Column(DECIMAL(5,4), default=0)
    mape = Column(DECIMAL(5,2), default=0)
    
    # Predictions
    total_predicted_revenue = Column(DECIMAL(15,2), default=0)
    avg_daily_prediction = Column(DECIMAL(15,2), default=0)
    confidence_interval = Column(DECIMAL(15,2), default=0)
    lower_bound = Column(DECIMAL(15,2), default=0)
    upper_bound = Column(DECIMAL(15,2), default=0)
    
    # Model info
    algorithm = Column(String(100), default='Linear Regression')
    features_used = Column(Text)  # JSON string of features
    data_points = Column(Integer, default=0)
    confidence_level = Column(DECIMAL(5,2), default=0)
    
    # Risk assessment
    high_volatility = Column(Boolean, default=False)
    negative_trend = Column(Boolean, default=False)
    low_confidence = Column(Boolean, default=False)
    insufficient_data = Column(Boolean, default=False)
    
    # Daily predictions (stored as JSON)
    daily_predictions = Column(Text)  # JSON string of daily predictions
    weekday_analysis = Column(Text)   # JSON string of weekday analysis
    
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    __table_args__ = (
        PrimaryKeyConstraint('analysis_date', 'prediction_period'),
    )

# Database connection functions
def get_database_url():
    """Get database URL from environment variables"""
    host = os.getenv('DB_HOST', 'localhost')
    user = os.getenv('DB_USER', 'root')
    password = os.getenv('DB_PASSWORD', 'root')
    database = os.getenv('DB_NAME', 'inventory-sale-ai')
    port = os.getenv('DB_PORT', '3306')
    
    url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
    return url

def create_db_engine():
    """Create SQLAlchemy engine"""
    database_url = get_database_url()
    return create_engine(database_url)

def create_session():
    """Create database session"""
    engine = create_db_engine()
    Session = sessionmaker(bind=engine)
    return Session()