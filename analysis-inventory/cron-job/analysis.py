#!/usr/bin/env python3
"""
Analytics Engine using Simple SQLAlchemy Models
Thực hiện phân tích dữ liệu và lưu vào các bảng summary
"""

import pandas as pd
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Tuple
import re
from decimal import Decimal
from sqlalchemy import func, and_, desc, asc, text, Enum, PrimaryKeyConstraint, Column, Date, String, Integer, DateTime
from sqlalchemy.orm import sessionmaker
import sys
import os

# Thêm đường dẫn đến thư mục cha để có thể import package
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from package.models.models import (
    create_db_engine, create_session, 
    Brand, Category, Item, Batch, Order, OrderItem, Base,
    DailySalesSummary, TopSellingItem, CategorySummary, 
    BrandSummary, RefundAnalysis, LowStockAlert, SlowMovingItem
)

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('analytics.log'),
        logging.StreamHandler()
    ]
)

class AnalyticsDataEngine:
    def __init__(self):
        """Khởi tạo Analytics Engine với Simple Models"""
        self.engine = create_db_engine()
        self.Session = sessionmaker(bind=self.engine)
        # self.today = datetime.now()
        self.today = datetime(2024, 6, 30)
        self.analysis_date = self.today.date()
        self.logger = logging.getLogger(__name__)
        
        # Load data từ database
        self._load_data_from_db()
        
    def _load_data_from_db(self):
        """Load dữ liệu từ database vào memory"""
        self.logger.info("Loading data from database...")
        session = self.get_session()
        try:
            # Load tất cả dữ liệu cần thiết với relationships
            from sqlalchemy.orm import joinedload
            
            # Load orders với order_items
            self.orders = session.query(Order).options(
                joinedload(Order.order_items)
            ).all()
            
            # Load order_items
            self.order_items = session.query(OrderItem).all()
            
            # Load items với relationships
            self.items = session.query(Item).options(
                joinedload(Item.brand),
                joinedload(Item.category)
            ).all()
            
            # Load categories
            self.categories = session.query(Category).all()
            
            # Load brands
            self.brands = session.query(Brand).all()
            
            # Load batches
            self.batches = session.query(Batch).all()
            
            self.logger.info(f"Loaded {len(self.orders)} orders, {len(self.order_items)} order items, "
                           f"{len(self.items)} items, {len(self.categories)} categories, "
                           f"{len(self.brands)} brands, {len(self.batches)} batches")
        finally:
            session.close()
        
    def get_session(self):
        """Tạo session mới"""
        return self.Session()
        
    def _filter_data_by_date_range(self, start_date: datetime, end_date: datetime = None):
        """Filter dữ liệu theo khoảng thời gian"""
        if end_date is None:
            end_date = self.today
            
        # Filter orders theo ngày
        filtered_orders = [order for order in self.orders 
                         if start_date <= order.order_date <= end_date]
        
        # Lấy order_ids từ filtered orders
        filtered_order_ids = {order.id for order in filtered_orders}
        
        # Filter order_items
        filtered_order_items = [item for item in self.order_items 
                              if item.order_id in filtered_order_ids]
        
        return filtered_orders, filtered_order_items
    
    def _get_time_periods(self):
        """Lấy các khoảng thời gian phân tích"""
        now = self.today
        return {
            '1_day_ago': (now - timedelta(days=1), now),
            '7_days_ago': (now - timedelta(days=7), now),
            '1_month_ago': (now - timedelta(days=30), now),
            '3_months_ago': (now - timedelta(days=90), now),
            '6_months_ago': (now - timedelta(days=180), now),
            '1_year_ago': (now - timedelta(days=365), now),
            'all_time': (datetime.min, now)
        }
        
    def group_refund_reasons(self, reason: str) -> str:
        """Gộp các lý do refund gần giống nhau"""
        if not reason:
            return 'Không xác định'
        
        reason = str(reason).lower().strip()
        
        # Nhóm "khách đổi ý"
        if any(keyword in reason for keyword in ['khách đổi ý', 'khách không cần', 'khách hủy', 'khách thay đổi']):
            return 'Khách đổi ý'
        
        # Nhóm "không đúng mô tả"
        if any(keyword in reason for keyword in ['không đúng mô tả', 'sai mô tả', 'không giống mô tả', 'khác mô tả']):
            return 'Không đúng mô tả'
        
        # Nhóm "hư hỏng"
        if any(keyword in reason for keyword in ['hư hỏng', 'bị hỏng', 'lỗi', 'defect', 'damaged']):
            return 'Hư hỏng'
        
        # Nhóm "giao hàng"
        if any(keyword in reason for keyword in ['giao hàng', 'vận chuyển', 'shipping', 'delivery']):
            return 'Vấn đề giao hàng'
        
        # Nhóm "chất lượng"
        if any(keyword in reason for keyword in ['chất lượng', 'quality', 'kém chất lượng']):
            return 'Chất lượng kém'
        
        # Nhóm "kích thước"
        if any(keyword in reason for keyword in ['kích thước', 'size', 'to nhỏ']):
            return 'Kích thước không phù hợp'
        
        # Nhóm "màu sắc"
        if any(keyword in reason for keyword in ['màu sắc', 'color', 'màu']):
            return 'Màu sắc không đúng'
        
        # Trả về lý do gốc nếu không match với nhóm nào
        return reason.title()

    def _calculate_date_range(self, data_range: str) -> Tuple[datetime, datetime]:
        """Tính toán start_date và end_date dựa trên data_range"""
        end_date = self.today
        
        if data_range == '1_day_ago':
            start_date = end_date - timedelta(days=1)
        elif data_range == '7_days_ago':
            start_date = end_date - timedelta(days=7)
        elif data_range == '1_month_ago':
            start_date = end_date - timedelta(days=30)
        elif data_range == '3_months_ago':
            start_date = end_date - timedelta(days=90)
        elif data_range == '6_months_ago':
            start_date = end_date - timedelta(days=180)
        elif data_range == '1_year_ago':
            start_date = end_date - timedelta(days=365)
        elif data_range == 'all_time':
            start_date = datetime.min
        else:
            raise ValueError(f"Data range không hợp lệ: {data_range}")
        
        return start_date, end_date

    def analyze_daily_sales(self) -> Dict:
        """Phân tích doanh số hàng ngày - chỉ lấy ngày hôm nay"""
        self.logger.info("Phân tích doanh số hàng ngày...")
        
        # Chỉ lấy dữ liệu của ngày hôm nay
        today = self.today
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        # Filter orders theo ngày hôm nay
        filtered_orders = [order for order in self.orders 
                         if today_start <= order.order_date <= today_end]
        
        # Lấy dữ liệu đơn hàng hợp lệ (không refund)
        valid_orders = [order for order in filtered_orders if order.status != 'refunded']
        
        print(f"DEBUG: Found {len(valid_orders)} valid orders")
        total_orders = len(valid_orders)
        total_revenue = 0
        
        # Tính lợi nhuận
        total_profit = 0
        for order in valid_orders:
            for item in order.order_items:
                # Lấy thông tin item
                item_info = next((i for i in self.items if i.id == item.item_id), None)
                if item_info:
                    revenue = float(item.price_per_unit) * item.quantity
                    total_revenue += revenue
                    profit_per_unit = float(item.price_per_unit) - float(item_info.cost_price)
                    total_profit += profit_per_unit * item.quantity
        
        # Tính tỉ lệ lợi nhuận
        profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
        
        # Phân tích refund
        refund_orders = [order for order in filtered_orders if order.status == 'refunded']
        total_refunds = len(refund_orders)
        refund_rate = (total_refunds / (total_orders + total_refunds) * 100) if (total_orders + total_refunds) > 0 else 0
        
        return {
            'analysis_date': self.analysis_date,
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'total_profit': float(total_profit),
            'total_refunds': total_refunds
        }

    def analyze_top_selling_items(self, limit: int = 10, data_range: str = 'all_time', sort_type: str = 'revenue') -> List[Dict]:
        """Phân tích top selling items theo khoảng thời gian và loại sắp xếp"""
        self.logger.info(f"Phân tích top {limit} selling items cho {data_range} theo {sort_type}...")
        
        # Tính toán start_date và end_date dựa trên data_range
        start_date, end_date = self._calculate_date_range(data_range)
        
        # Filter dữ liệu theo khoảng thời gian
        filtered_orders, filtered_order_items = self._filter_data_by_date_range(start_date, end_date)
        
        # Lấy dữ liệu bán hàng hợp lệ
        valid_order_items = [item for item in filtered_order_items 
                           if next((order for order in filtered_orders if order.id == item.order_id), None).status != 'refunded']
        
        # Nhóm theo item_id
        item_sales = {}
        for order_item in valid_order_items:
            item_id = order_item.item_id
            if item_id not in item_sales:
                item_sales[item_id] = {
                    'total_sold': 0,
                    'total_revenue': 0,
                    'total_profit': 0
                }
            
            item_sales[item_id]['total_sold'] += order_item.quantity
            revenue = float(order_item.price_per_unit) * order_item.quantity
            item_sales[item_id]['total_revenue'] += revenue
            
            # Tính lợi nhuận
            item_info = next((i for i in self.items if i.id == item_id), None)
            if item_info:
                profit_per_unit = float(order_item.price_per_unit) - float(item_info.cost_price)
                item_sales[item_id]['total_profit'] += profit_per_unit * order_item.quantity
        
        # Sắp xếp theo loại được chọn
        if sort_type == 'revenue':
            sorted_items = sorted(item_sales.items(), key=lambda x: x[1]['total_revenue'], reverse=True)[:limit]
        elif sort_type == 'profit':
            sorted_items = sorted(item_sales.items(), key=lambda x: x[1]['total_profit'], reverse=True)[:limit]
        elif sort_type == 'quantity':
            sorted_items = sorted(item_sales.items(), key=lambda x: x[1]['total_sold'], reverse=True)[:limit]
        else:
            raise ValueError(f"Sort type không hợp lệ: {sort_type}. Chỉ hỗ trợ: revenue, profit, quantity")
        
        results = []
        for rank, (item_id, data) in enumerate(sorted_items, 1):
            item_info = next((i for i in self.items if i.id == item_id), None)
            if item_info:
                profit_margin = (data['total_profit'] / data['total_revenue'] * 100) if data['total_revenue'] > 0 else 0
                
                results.append({
                    'analysis_date': self.analysis_date,
                    'data_range': data_range,
                    'sort_type': sort_type,
                    'sku': item_info.sku,
                    'item_name': item_info.name,
                    'total_sold': data['total_sold'],
                    'total_revenue': data['total_revenue'],
                    'total_profit': data['total_profit'],
                    'profit_margin': profit_margin,
                    'rank': rank
                })
        
        return results

    def analyze_top_category(self,limit: int = 10, data_range: str = 'all_time', sort_type: str = 'revenue') -> List[Dict]:
        """Phân tích hiệu suất theo category"""
        self.logger.info(f"Phân tích hiệu suất category cho {data_range} theo {sort_type} (top {limit})...")
        
        # Tính toán start_date và end_date dựa trên data_range
        start_date, end_date = self._calculate_date_range(data_range)
        
        # Filter dữ liệu theo khoảng thời gian
        filtered_orders, filtered_order_items = self._filter_data_by_date_range(start_date, end_date)
        
        # Lấy dữ liệu bán hàng hợp lệ với thông tin category
        valid_sales = []
        for order_item in filtered_order_items:
            order = next((o for o in filtered_orders if o.id == order_item.order_id), None)
            if order and order.status != 'refunded':
                item = next((i for i in self.items if i.id == order_item.item_id), None)
                if item:
                    category = next((c for c in self.categories if c.id == item.category_id), None)
                    if category:
                        valid_sales.append((order_item, item, category))
        
        # Nhóm theo category
        category_sales = {}
        for order_item, item, category in valid_sales:
            category_id = category.id
            if category_id not in category_sales:
                category_sales[category_id] = {
                    'category_name': category.name,
                    'total_sold': 0,
                    'total_revenue': 0,
                    'total_profit': 0
                }
            
            category_sales[category_id]['total_sold'] += order_item.quantity
            revenue = float(order_item.price_per_unit) * order_item.quantity
            category_sales[category_id]['total_revenue'] += revenue
            
            # Tính lợi nhuận
            profit_per_unit = float(order_item.price_per_unit) - float(item.cost_price)
            category_sales[category_id]['total_profit'] += profit_per_unit * order_item.quantity
        
        # Sắp xếp theo loại được chọn và lấy top categories
        if sort_type == 'revenue':
            sorted_categories = sorted(category_sales.items(), key=lambda x: x[1]['total_revenue'], reverse=True)[:limit]
        elif sort_type == 'quantity':
            sorted_categories = sorted(category_sales.items(), key=lambda x: x[1]['total_sold'], reverse=True)[:limit]
        else:
            raise ValueError(f"Sort type không hợp lệ: {sort_type}. Chỉ hỗ trợ: revenue, quantity")
        
        results = []
        for rank, (category_id, data) in enumerate(sorted_categories, 1):
            profit_margin = (data['total_profit'] / data['total_revenue'] * 100) if data['total_revenue'] > 0 else 0
            
            results.append({
                'analysis_date': self.analysis_date,
                'data_range': data_range,
                'sort_type': sort_type,
                'category_id': category_id,
                'category_name': data['category_name'],
                'total_sold': data['total_sold'],
                'total_revenue': data['total_revenue'],
                'total_profit': data['total_profit'],
                'profit_margin': profit_margin,
                'rank': rank
            })
        
        return results

    def analyze_top_brand(self, limit: int = 10, data_range: str = 'all_time', sort_type: str = 'revenue') -> List[Dict]:
        """Phân tích hiệu suất theo brand"""
        self.logger.info(f"Phân tích hiệu suất brand cho {data_range} theo {sort_type} (top {limit})...")
        
        # Tính toán start_date và end_date dựa trên data_range
        start_date, end_date = self._calculate_date_range(data_range)
        
        # Filter dữ liệu theo khoảng thời gian
        filtered_orders, filtered_order_items = self._filter_data_by_date_range(start_date, end_date)
        
        # Lấy dữ liệu bán hàng hợp lệ với thông tin brand
        valid_sales = []
        for order_item in filtered_order_items:
            order = next((o for o in filtered_orders if o.id == order_item.order_id), None)
            if order and order.status != 'refunded':
                item = next((i for i in self.items if i.id == order_item.item_id), None)
                if item:
                    brand = next((b for b in self.brands if b.id == item.brand_id), None)
                    if brand:
                        valid_sales.append((order_item, item, brand))
        
        # Nhóm theo brand
        brand_sales = {}
        for order_item, item, brand in valid_sales:
            brand_id = brand.id
            if brand_id not in brand_sales:
                brand_sales[brand_id] = {
                    'brand_name': brand.name,
                    'total_sold': 0,
                    'total_revenue': 0,
                    'total_profit': 0
                }
            
            brand_sales[brand_id]['total_sold'] += order_item.quantity
            revenue = float(order_item.price_per_unit) * order_item.quantity
            brand_sales[brand_id]['total_revenue'] += revenue
            
            # Tính lợi nhuận
            profit_per_unit = float(order_item.price_per_unit) - float(item.cost_price)
            brand_sales[brand_id]['total_profit'] += profit_per_unit * order_item.quantity
        
        # Sắp xếp theo loại được chọn và lấy top brands
        if sort_type == 'revenue':
            sorted_brands = sorted(brand_sales.items(), key=lambda x: x[1]['total_revenue'], reverse=True)[:limit]
        elif sort_type == 'quantity':
            sorted_brands = sorted(brand_sales.items(), key=lambda x: x[1]['total_sold'], reverse=True)[:limit]
        else:
            raise ValueError(f"Sort type không hợp lệ: {sort_type}. Chỉ hỗ trợ: revenue, quantity")
        
        results = []
        for rank, (brand_id, data) in enumerate(sorted_brands, 1):
            profit_margin = (data['total_profit'] / data['total_revenue'] * 100) if data['total_revenue'] > 0 else 0
            
            results.append({
                'analysis_date': self.analysis_date,
                'data_range': data_range,
                'sort_type': sort_type,
                'brand_id': brand_id,
                'brand_name': data['brand_name'],
                'total_sold': data['total_sold'],
                'total_revenue': data['total_revenue'],
                'total_profit': data['total_profit'],
                'profit_margin': profit_margin,
                'rank': rank
            })
        
        return results

    def analyze_refunds(self, limit: int = 10, data_range: str = 'all_time', sort_type: str = 'refund_count') -> List[Dict]:
        """Phân tích refund theo các tiêu chí khác nhau"""
        self.logger.info(f"Phân tích refund cho {data_range} theo {sort_type} (top {limit})...")
        
        # Tính toán start_date và end_date dựa trên data_range
        start_date, end_date = self._calculate_date_range(data_range)
        
        # Filter dữ liệu theo khoảng thời gian
        filtered_orders, filtered_order_items = self._filter_data_by_date_range(start_date, end_date)
        
        # Lấy tất cả đơn hàng refund
        refund_orders = [order for order in filtered_orders if order.status == 'refunded']
        
        # Nhóm theo item_id và lý do
        refund_analysis = {}
        for order in refund_orders:
            for order_item in order.order_items:
                item_id = order_item.item_id
                refund_reason = self.group_refund_reasons(order.refund_reason)
                
                key = (item_id, refund_reason)
                if key not in refund_analysis:
                    refund_analysis[key] = {
                        'total_orders': 0,
                        'refund_count': 0,
                        'refund_quantity': 0
                    }
                
                refund_analysis[key]['refund_count'] += 1
                refund_analysis[key]['refund_quantity'] += order_item.quantity
        
        # Tính tổng đơn hàng cho mỗi item_id trong khoảng thời gian
        total_orders_by_item = {}
        for order_item in filtered_order_items:
            order = next((o for o in filtered_orders if o.id == order_item.order_id), None)
            if order and order.status != 'refunded':
                item_id = order_item.item_id
                if item_id not in total_orders_by_item:
                    total_orders_by_item[item_id] = 0
                total_orders_by_item[item_id] += order_item.quantity
        
        # Tạo kết quả phân tích
        results = []
        for (item_id, refund_reason), data in refund_analysis.items():
            item_info = next((i for i in self.items if i.id == item_id), None)
            if item_info:
                total_orders = total_orders_by_item.get(item_id, 0)
                refund_rate = (data['refund_count'] / total_orders * 100) if total_orders > 0 else 0
                
                results.append({
                    'analysis_date': self.analysis_date,
                    'data_range': data_range,
                    'sort_type': sort_type,
                    'sku': item_info.sku,
                    'item_name': item_info.name,
                    'total_orders': total_orders,
                    'refund_count': data['refund_count'],
                    'refund_quantity': data['refund_quantity'],
                    'refund_rate': refund_rate,
                    'refund_reason': refund_reason
                })
        
        # Sắp xếp theo loại được chọn và lấy top results
        if sort_type == 'refund_count':
            # Hàng có số lượng bị refund nhiều nhất
            sorted_results = sorted(results, key=lambda x: x['refund_count'], reverse=True)[:limit]
        elif sort_type == 'refund_rate':
            # Hàng có tỉ lệ refund cao nhất
            sorted_results = sorted(results, key=lambda x: x['refund_rate'], reverse=True)[:limit]
        elif sort_type == 'refund_quantity':
            # Hàng có số lượng sản phẩm bị refund nhiều nhất
            sorted_results = sorted(results, key=lambda x: x['refund_quantity'], reverse=True)[:limit]
        elif sort_type == 'refund_reason':
            # Lý do bị refund nhiều nhất
            # Nhóm theo lý do refund
            reason_analysis = {}
            for result in results:
                reason = result['refund_reason']
                if reason not in reason_analysis:
                    reason_analysis[reason] = {
                        'refund_count': 0,
                        'refund_quantity': 0,
                        'total_orders': 0,
                        'items_affected': 0
                    }
                reason_analysis[reason]['refund_count'] += result['refund_count']
                reason_analysis[reason]['refund_quantity'] += result['refund_quantity']
                reason_analysis[reason]['total_orders'] += result['total_orders']
                reason_analysis[reason]['items_affected'] += 1
            
            # Tạo kết quả theo lý do
            reason_results = []
            for reason, data in reason_analysis.items():
                refund_rate = (data['refund_count'] / data['total_orders'] * 100) if data['total_orders'] > 0 else 0
                reason_results.append({
                    'analysis_date': self.analysis_date,
                    'data_range': data_range,
                    'sort_type': sort_type,
                    'refund_reason': reason,
                    'refund_count': data['refund_count'],
                    'refund_quantity': data['refund_quantity'],
                    'total_orders': data['total_orders'],
                    'refund_rate': refund_rate,
                    'items_affected': data['items_affected']
                })
            
            sorted_results = sorted(reason_results, key=lambda x: x['refund_count'], reverse=True)[:limit]
        else:
            raise ValueError(f"Sort type không hợp lệ: {sort_type}. Chỉ hỗ trợ: refund_count, refund_rate, refund_quantity, refund_reason")
        
        # Thêm rank cho kết quả
        for rank, result in enumerate(sorted_results, 1):
            result['rank'] = rank
        
        return sorted_results

    def analyze_low_stock_alerts(self) -> List[Dict]:
        """Phân tích cảnh báo tồn kho thấp"""
        self.logger.info("Phân tích cảnh báo tồn kho thấp...")
        
        # Lấy tất cả items có tồn kho
        items_with_stock = [item for item in self.items if item.stock_quantity > 0]
        
        results = []
        for item in items_with_stock:
            # Tính tốc độ bán trung bình trong 30 ngày gần nhất
            thirty_days_ago = self.today - timedelta(days=30)
            
            # Filter orders trong 30 ngày gần nhất
            recent_orders = [order for order in self.orders 
                           if order.order_date >= thirty_days_ago and order.status != 'refunded']
            
            # Tính tổng số lượng bán
            recent_sales = 0
            for order in recent_orders:
                for order_item in order.order_items:
                    if order_item.item_id == item.id:
                        recent_sales += order_item.quantity
            
            # Tính số ngày tồn kho còn lại
            avg_daily_sales = recent_sales / 30 if recent_sales > 0 else 0
            days_of_stock_left = int(item.stock_quantity / avg_daily_sales) if avg_daily_sales > 0 else 999
            
            # Xác định mức độ cảnh báo
            if days_of_stock_left <= 3:
                alert_level = 'URGENT'
            elif days_of_stock_left <= 7:
                alert_level = 'CRITICAL'
            elif days_of_stock_left <= 14:
                alert_level = 'WARNING'
            else:
                continue  # Không cảnh báo nếu còn nhiều hàng
            
            results.append({
                'analysis_date': self.analysis_date,
                'sku': item.sku,
                'item_name': item.name,
                'current_stock': item.stock_quantity,
                'days_of_stock_left': days_of_stock_left,
                'alert_level': alert_level,
                'avg_daily_sales': avg_daily_sales
            })
        
        return results

    def analyze_slow_moving_items(self, limit: int = 10, sort_type: str = 'no_sales') -> List[Dict]:
        """Phân tích hàng bán ế"""
        self.logger.info(f"Phân tích hàng bán ế theo {sort_type} (top {limit})...")
        
        # Lấy tất cả dữ liệu bán hàng hợp lệ (không refund)
        valid_order_items = []
        for order in self.orders:
            if order.status != 'refunded':
                for order_item in order.order_items:
                    valid_order_items.append(order_item)
        
        # Tìm ngày đơn hàng đầu tiên để tính total_days chính xác
        first_order_date = min(order.order_date for order in self.orders) if self.orders else self.today
        total_days = (self.today - first_order_date).days if total_days > 0 else 365
        
        # Phân tích từng item
        slow_moving_analysis = {}
        
        for item in self.items:
            if item.stock_quantity <= 0:
                continue  # Bỏ qua items hết hàng
                
            # Tính tổng số lượng bán trong toàn bộ thời gian
            total_sold = sum(oi.quantity for oi in valid_order_items if oi.item_id == item.id)
            
            # Tính trung bình bán hàng ngày (dựa trên thời gian thực tế)
            avg_daily_sales = total_sold / total_days if total_days > 0 else 0
            
            # Tính số ngày không bán được hàng
            days_without_sales = total_days - (total_sold if total_sold > 0 else 0)
            
            # Tính giá trị tồn kho
            stock_value = float(item.cost_price) * item.stock_quantity
            
            # Tính tiềm năng mất mát (nếu không bán được)
            potential_loss = stock_value if total_sold == 0 else stock_value * 0.5
            
            # Lấy thông tin brand và category
            brand_name = next((b.name for b in self.brands if b.id == item.brand_id), 'Unknown')
            category_name = next((c.name for c in self.categories if c.id == item.category_id), 'Unknown')
            
            slow_moving_analysis[item.id] = {
                'sku': item.sku,
                'item_name': item.name,
                'brand_name': brand_name,
                'category_name': category_name,
                'current_stock': item.stock_quantity,
                'total_quantity_sold': total_sold,
                'avg_daily_sales': avg_daily_sales,
                'days_without_sales': days_without_sales,
                'stock_value': stock_value,
                'potential_loss': potential_loss
            }
        
        # Lọc và sắp xếp theo loại được chọn
        results = []
        
        if sort_type == 'no_sales':
            # Hàng không bán được trong toàn bộ thời gian
            no_sales_items = {item_id: data for item_id, data in slow_moving_analysis.items() 
                             if data['total_quantity_sold'] == 0}
            sorted_items = sorted(no_sales_items.items(), 
                                key=lambda x: x[1]['stock_value'], reverse=True)[:limit]
            
        elif sort_type == 'low_sales':
            # Hàng bán ít (dưới 5% tồn kho)
            low_sales_items = {item_id: data for item_id, data in slow_moving_analysis.items() 
                              if data['total_quantity_sold'] > 0 and 
                              data['total_quantity_sold'] < data['current_stock'] * 0.05}
            sorted_items = sorted(low_sales_items.items(), 
                                key=lambda x: x[1]['potential_loss'], reverse=True)[:limit]
            
        elif sort_type == 'high_stock_low_sales':
            # Hàng có tồn kho cao nhưng bán ít
            high_stock_items = {item_id: data for item_id, data in slow_moving_analysis.items() 
                               if data['current_stock'] > 10 and 
                               data['avg_daily_sales'] < 1}
            sorted_items = sorted(high_stock_items.items(), 
                                key=lambda x: x[1]['stock_value'], reverse=True)[:limit]
            
        elif sort_type == 'aging_stock':
            # Hàng tồn kho lâu (không bán được trong 30+ ngày)
            aging_items = {item_id: data for item_id, data in slow_moving_analysis.items() 
                          if data['days_without_sales'] >= 30}
            sorted_items = sorted(aging_items.items(), 
                                key=lambda x: x[1]['days_without_sales'], reverse=True)[:limit]
            
        else:
            raise ValueError(f"Sort type không hợp lệ: {sort_type}. Chỉ hỗ trợ: no_sales, low_sales, high_stock_low_sales, aging_stock")
        
        # Tạo kết quả
        for rank, (item_id, data) in enumerate(sorted_items, 1):
            results.append({
                'analysis_date': self.analysis_date,
                'sort_type': sort_type,
                'sku': data['sku'],
                'item_name': data['item_name'],
                'brand_name': data['brand_name'],
                'category_name': data['category_name'],
                'current_stock': data['current_stock'],
                'total_quantity_sold': data['total_quantity_sold'],
                'avg_daily_sales': data['avg_daily_sales'],
                'days_without_sales': data['days_without_sales'],
                'stock_value': data['stock_value'],
                'potential_loss': data['potential_loss'],
                'rank': rank
            })
        
        return results

    def run_all_analysis(self):
        """Chạy phân tích cho tất cả các khoảng thời gian"""
        self.logger.info("Bắt đầu chạy analysis cho tất cả các khoảng thời gian...")
        print("\n🚀 BẮT ĐẦU PHÂN TÍCH DỮ LIỆU...")
        print("="*60)
        
        # Phân tích doanh số
        print("\n🔍 Phân tích doanh số hàng ngày...")
        daily_sales = self.analyze_daily_sales()
        self.save_daily_sales_summary(daily_sales)
        print(f"   ✅ Đã lưu doanh số: {daily_sales['total_orders']} đơn hàng, {daily_sales['total_revenue']:,.0f} VNĐ")

        # Cảnh báo tồn kho thấp
        print("\n🔍 Phân tích cảnh báo tồn kho thấp...")
        low_stock_alerts = self.analyze_low_stock_alerts()
        self.save_low_stock_alerts(low_stock_alerts)
        print(f"   ✅ Đã lưu {len(low_stock_alerts)} cảnh báo tồn kho")
        
        periods = self._get_time_periods()
        
        for period_name in periods.keys():
            print(f"\n🔍 PHÂN TÍCH CHO KHOẢNG THỜI GIAN: {period_name.upper()}")
            print("-" * 50)
            
            try:
                # Phân tích top selling items
                print(f"   🏆 Phân tích top selling items...")
                top_selling_items_limit = 10;
                top_selling_items_types = ['revenue', 'profit', 'quantity'];
                for top_selling_items_type in top_selling_items_types:
                    top_items = self.analyze_top_selling_items(top_selling_items_limit, period_name, top_selling_items_type)
                    self.save_top_selling_items(top_items, period_name, top_selling_items_type)
                    print(f"      ✅ {top_selling_items_type.title()}: {len(top_items)} items")
                
                # Phân tích category
                print(f"   📂 Phân tích hiệu suất category...")
                category_limit = 10
                category_types = ['revenue', 'quantity']
                for category_type in category_types:
                    category_summary = self.analyze_top_category(category_limit, period_name, category_type)
                    self.save_category_summary(category_summary, period_name, category_type)
                    print(f"      ✅ {category_type.title()}: {len(category_summary)} categories")
                
                # Phân tích brand
                print(f"   💾 Phân tích hiệu suất brand...")
                brand_limit = 10
                brand_types = ['revenue', 'quantity']
                for brand_type in brand_types:
                    brand_summary = self.analyze_top_brand(brand_limit, period_name, brand_type)
                    self.save_brand_summary(brand_summary, period_name, brand_type)
                    print(f"      ✅ {brand_type.title()}: {len(brand_summary)} brands")
                
                # Phân tích refund
                print(f"   ⚠️ Phân tích refund...")
                refund_limit = 10
                refund_types = ['refund_count', 'refund_rate', 'refund_quantity', 'refund_reason']
                for refund_type in refund_types:
                    refund_analysis = self.analyze_refunds(refund_limit, period_name, refund_type)
                    self.save_refund_analysis(refund_analysis, period_name, refund_type)
                    print(f"      ✅ {refund_type.replace('_', ' ').title()}: {len(refund_analysis)} items")

                # Phân tích hàng bán ế
                print(f"   📦 Phân tích hàng bán ế...")
                slow_moving_limit = 20
                slow_moving_types = ['no_sales', 'low_sales', 'high_stock_low_sales', 'aging_stock']
                for slow_moving_type in slow_moving_types:
                    slow_moving_analysis = self.analyze_slow_moving_items(slow_moving_limit, slow_moving_type)
                    self.save_slow_moving_items(slow_moving_analysis, slow_moving_type)
                    print(f"      ✅ {slow_moving_type.replace('_', ' ').title()}: {len(slow_moving_analysis)} items")

                print(f"   ✅ Hoàn thành phân tích cho {period_name}")
                
            except Exception as e:
                self.logger.error(f"Lỗi khi phân tích {period_name}: {e}")
                print(f"   ❌ Lỗi khi phân tích {period_name}: {e}")
        
        print("\n" + "="*60)
        print("🎉 HOÀN THÀNH TẤT CẢ PHÂN TÍCH!")
        print("="*60)

    # Save methods
    def save_daily_sales_summary(self, data: Dict):
        """Lưu daily sales summary"""
        session = self.get_session()
        try:
            # Kiểm tra xem đã có dữ liệu cho ngày này chưa
            existing = session.query(DailySalesSummary).filter(
                DailySalesSummary.analysis_date == data['analysis_date']
            ).first()
            
            if existing:
                # Cập nhật
                existing.total_orders = data['total_orders']
                existing.total_revenue = Decimal(str(data['total_revenue']))
                existing.total_profit = Decimal(str(data['total_profit']))
                existing.total_refunds = data['total_refunds']
            else:
                # Tạo mới
                summary = DailySalesSummary(
                    analysis_date=data['analysis_date'],
                    total_orders=data['total_orders'],
                    total_revenue=Decimal(str(data['total_revenue'])),
                    total_profit=Decimal(str(data['total_profit'])),
                    total_refunds=data['total_refunds']
                )
                session.add(summary)
            
            session.commit()
            self.logger.info(f"Đã lưu daily sales summary cho ngày {data['analysis_date']}")
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Lỗi lưu daily sales summary: {e}")
            raise
        finally:
            session.close()

    def save_top_selling_items(self, data: List[Dict], data_range: str = 'all_time', sort_type: str = 'revenue'):
        """Lưu top selling items"""
        session = self.get_session()
        try:
            # Xóa dữ liệu cũ cho ngày này, data_range và sort_type này
            session.query(TopSellingItem).filter(
                and_(
                    TopSellingItem.analysis_date == self.analysis_date,
                    TopSellingItem.data_range == data_range,
                    TopSellingItem.sort_type == sort_type
                )
            ).delete()
            
            # Thêm dữ liệu mới
            for item_data in data:
                summary = TopSellingItem(
                    analysis_date=item_data['analysis_date'],
                    data_range=item_data.get('data_range', data_range),
                    sort_type=item_data.get('sort_type', sort_type),
                    sku=item_data['sku'],
                    item_name=item_data['item_name'],
                    total_quantity_sold=item_data['total_sold'],
                    total_revenue=Decimal(str(item_data['total_revenue'])),
                    total_profit=Decimal(str(item_data['total_profit'])),
                    rank_position=item_data['rank']
                )
                session.add(summary)
            
            session.commit()
            self.logger.info(f"Đã lưu {len(data)} top selling items với data_range {data_range} và sort_type {sort_type}")
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Lỗi lưu top selling items: {e}")
            raise
        finally:
            session.close()

    def save_category_summary(self, data: List[Dict], data_range: str = 'all_time', sort_type: str = 'revenue'):
        """Lưu category summary"""
        session = self.get_session()
        try:
            # Xóa dữ liệu cũ cho ngày này, data_range và sort_type này
            session.query(CategorySummary).filter(
                and_(
                    CategorySummary.analysis_date == self.analysis_date,
                    CategorySummary.data_range == data_range,
                    CategorySummary.sort_type == sort_type
                )
            ).delete()
            
            # Thêm dữ liệu mới
            for category_data in data:
                summary = CategorySummary(
                    analysis_date=category_data['analysis_date'],
                    data_range=category_data.get('data_range', data_range),
                    sort_type=category_data.get('sort_type', sort_type),
                    category_id=category_data['category_id'],
                    category_name=category_data['category_name'],
                    total_quantity_sold=category_data['total_sold'],
                    total_revenue=Decimal(str(category_data['total_revenue'])),
                    total_profit=Decimal(str(category_data['total_profit'])),
                    profit_margin=Decimal(str(category_data['profit_margin'])),
                    rank_position=category_data['rank']
                )
                session.add(summary)
            
            session.commit()
            self.logger.info(f"Đã lưu {len(data)} category summaries với data_range {data_range} và sort_type {sort_type}")
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Lỗi lưu category summary: {e}")
            raise
        finally:
            session.close()

    def save_brand_summary(self, data: List[Dict], data_range: str = 'all_time', sort_type: str = 'revenue'):
        """Lưu brand summary"""
        session = self.get_session()
        try:
            # Xóa dữ liệu cũ cho ngày này, data_range và sort_type này
            session.query(BrandSummary).filter(
                and_(
                    BrandSummary.analysis_date == self.analysis_date,
                    BrandSummary.data_range == data_range,
                    BrandSummary.sort_type == sort_type
                )
            ).delete()
            
            # Thêm dữ liệu mới
            for brand_data in data:
                summary = BrandSummary(
                    analysis_date=brand_data['analysis_date'],
                    data_range=brand_data.get('data_range', data_range),
                    sort_type=brand_data.get('sort_type', sort_type),
                    brand_id=brand_data['brand_id'],
                    brand_name=brand_data['brand_name'],
                    total_quantity_sold=brand_data['total_sold'],
                    total_revenue=Decimal(str(brand_data['total_revenue'])),
                    total_profit=Decimal(str(brand_data['total_profit'])),
                    profit_margin=Decimal(str(brand_data['profit_margin'])),
                    rank_position=brand_data['rank']
                )
                session.add(summary)
            
            session.commit()
            self.logger.info(f"Đã lưu {len(data)} brand summaries với data_range {data_range} và sort_type {sort_type}")
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Lỗi lưu brand summary: {e}")
            raise
        finally:
            session.close()

    def save_refund_analysis(self, data: List[Dict], data_range: str = 'all_time', sort_type: str = 'refund_count'):
        """Lưu refund analysis"""
        session = self.get_session()
        try:
            # Xóa dữ liệu cũ cho ngày này, data_range và sort_type này
            session.query(RefundAnalysis).filter(
                and_(
                    RefundAnalysis.analysis_date == self.analysis_date,
                    RefundAnalysis.data_range == data_range,
                    RefundAnalysis.sort_type == sort_type
                )
            ).delete()
            
            # Thêm dữ liệu mới
            for refund_data in data:
                # Xử lý dữ liệu khác nhau cho refund_reason sort type
                if sort_type == 'refund_reason':
                    summary = RefundAnalysis(
                        analysis_date=refund_data['analysis_date'],
                        data_range=data_range,
                        sort_type=sort_type,
                        sku='',  # Không có SKU cho refund_reason analysis
                        item_name='',  # Không có item_name cho refund_reason analysis
                        total_orders=refund_data['total_orders'],
                        refund_orders=refund_data['refund_count'],
                        refund_rate=Decimal(str(refund_data['refund_rate'])),
                        refund_reason=refund_data['refund_reason'],
                        refund_quantity=refund_data.get('refund_quantity', 0),
                        items_affected=refund_data.get('items_affected', 0),
                        rank_position=refund_data.get('rank', 0)
                    )
                else:
                    summary = RefundAnalysis(
                        analysis_date=refund_data['analysis_date'],
                        data_range=data_range,
                        sort_type=sort_type,
                        sku=refund_data['sku'],
                        item_name=refund_data['item_name'],
                        total_orders=refund_data['total_orders'],
                        refund_orders=refund_data['refund_count'],
                        refund_rate=Decimal(str(refund_data['refund_rate'])),
                        refund_reason=refund_data['refund_reason'],
                        refund_quantity=refund_data.get('refund_quantity', 0),
                        rank_position=refund_data.get('rank', 0)
                    )
                session.add(summary)
            
            session.commit()
            self.logger.info(f"Đã lưu {len(data)} refund analyses với data_range {data_range} và sort_type {sort_type}")
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Lỗi lưu refund analysis: {e}")
            raise
        finally:
            session.close()

    def save_low_stock_alerts(self, data: List[Dict]):
        """Lưu low stock alerts"""
        session = self.get_session()
        try:
            # Xóa dữ liệu cũ cho ngày này
            session.query(LowStockAlert).filter(
                LowStockAlert.analysis_date == self.analysis_date
            ).delete()
            
            # Thêm dữ liệu mới
            for alert_data in data:
                # Xác định alert_type dựa trên days_of_stock_left
                days_left = alert_data['days_of_stock_left']
                if days_left <= 0:
                    alert_type = 'out_of_stock'
                elif days_left <= 3:
                    alert_type = 'low_stock'
                else:
                    alert_type = 'expiring_soon'
                
                summary = LowStockAlert(
                    analysis_date=alert_data['analysis_date'],
                    sku=alert_data['sku'],
                    item_name=alert_data['item_name'],
                    current_stock=alert_data['current_stock'],
                    avg_daily_sales=Decimal(str(alert_data.get('avg_daily_sales', 0))),
                    days_left=Decimal(str(days_left)),
                    alert_type=alert_type
                )
                session.add(summary)
            
            session.commit()
            self.logger.info(f"Đã lưu {len(data)} low stock alerts")
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Lỗi lưu low stock alerts: {e}")
            raise
        finally:
            session.close()

    def save_slow_moving_items(self, data: List[Dict], sort_type: str = 'no_sales'):
        """Lưu slow moving items analysis"""
        session = self.get_session()
        try:
            # Xóa dữ liệu cũ cho ngày này và sort_type này
            session.query(SlowMovingItem).filter(
                and_(
                    SlowMovingItem.analysis_date == self.analysis_date,
                    SlowMovingItem.sort_type == sort_type
                )
            ).delete()
            
            # Thêm dữ liệu mới
            for item_data in data:
                summary = SlowMovingItem(
                    analysis_date=item_data['analysis_date'],
                    sort_type=item_data.get('sort_type', sort_type),
                    sku=item_data['sku'],
                    item_name=item_data['item_name'],
                    brand_name=item_data.get('brand_name', ''),
                    category_name=item_data.get('category_name', ''),
                    current_stock=item_data['current_stock'],
                    total_quantity_sold=item_data['total_quantity_sold'],
                    avg_daily_sales=Decimal(str(item_data['avg_daily_sales'])),
                    days_without_sales=item_data['days_without_sales'],
                    stock_value=Decimal(str(item_data['stock_value'])),
                    potential_loss=Decimal(str(item_data['potential_loss'])),
                    rank_position=item_data['rank']
                )
                session.add(summary)
            
            session.commit()
            self.logger.info(f"Đã lưu {len(data)} slow moving items với sort_type {sort_type}")
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Lỗi lưu slow moving items: {e}")
            raise
        finally:
            session.close()

    def get_available_periods(self):
        """Lấy danh sách các khoảng thời gian có sẵn"""
        return list(self._get_time_periods().keys())

if __name__ == "__main__":
    engine = AnalyticsDataEngine()
    
    # Demo phân tích và lưu dữ liệu theo khoảng thời gian
    engine.run_all_analysis();
    
    print("\n🎉 HOÀN THÀNH TẤT CẢ PHÂN TÍCH!")