#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API Server cho Analytics System
Cung cấp API để lấy dữ liệu phân tích từ database
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, date
from sqlalchemy import and_, desc, asc
import sys
import os
# Thêm đường dẫn đến thư mục cha để có thể import package
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from package.models.models import (
    create_db_engine, create_session,
    DailySalesSummary, TopSellingItem, CategorySummary, 
    BrandSummary, RefundAnalysis, LowStockAlert, SlowMovingItem
)
import logging

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)
CORS(app)  # Cho phép CORS

# Tạo database engine
engine = create_db_engine()

@app.route('/')
def home():
    """Trang chủ API"""
    return jsonify({
        'message': 'Analytics API Server',
        'version': '1.0.0',
        'endpoints': {
            'daily_sales': '/api/daily-sales',
            'daily_sales_by_date': '/api/daily-sales/<date>',
            'daily_sales_by_period': '/api/daily-sales/period/<period>',
            'top_selling_items': '/api/top-selling-items',
            'category_summary': '/api/category-summary',
            'brand_summary': '/api/brand-summary',
            'refund_analysis': '/api/refund-analysis',
            'low_stock_alerts': '/api/low-stock-alerts',
            'batch_analysis': '/api/batch-analysis',
            'slow_moving_items': '/api/slow-moving-items',
            'summary_overview': '/api/summary/overview',
            'summary_all': '/api/summary/all',
            'available_periods': '/api/summary/periods',
            'available_dates': '/api/summary/dates'
        },
        'query_parameters': {
            'period': 'Khoảng thời gian (1_day_ago, 7_days_ago, 1_month_ago, 3_months_ago, 6_months_ago, 1_year_ago, all_time)',
            'sort_type': 'Loại sắp xếp (revenue, profit, quantity, refund_count, refund_rate, refund_quantity, refund_reason)',
            'date': 'Ngày phân tích (YYYY-MM-DD)',
            'limit': 'Số lượng kết quả trả về'
        }
    })

@app.route('/api/daily-sales')
def get_daily_sales():
    """Lấy dữ liệu daily sales mới nhất"""
    try:
        session = create_session()
        
        # Lấy dữ liệu mới nhất
        latest_summary = session.query(DailySalesSummary).order_by(
            desc(DailySalesSummary.analysis_date)
        ).first()
        
        if not latest_summary:
            return jsonify({
                'success': False,
                'message': 'Không có dữ liệu daily sales'
            }), 404
        
        data = {
            'success': True,
            'data': {
                'analysis_date': latest_summary.analysis_date.isoformat(),
                'total_orders': latest_summary.total_orders,
                'total_revenue': float(latest_summary.total_revenue),
                'total_profit': float(latest_summary.total_profit),
                'total_refunds': latest_summary.total_refunds,
                'created_at': latest_summary.created_at.isoformat() if latest_summary.created_at else None,
                'updated_at': latest_summary.updated_at.isoformat() if latest_summary.updated_at else None
            }
        }
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy daily sales: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/daily-sales/<date_str>')
def get_daily_sales_by_date(date_str):
    """Lấy dữ liệu daily sales theo ngày cụ thể"""
    try:
        # Parse date string
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Định dạng ngày không hợp lệ. Sử dụng YYYY-MM-DD'
            }), 400
        
        session = create_session()
        
        # Lấy dữ liệu theo ngày
        summaries = session.query(DailySalesSummary).filter(
            DailySalesSummary.analysis_date == target_date
        ).order_by(desc(DailySalesSummary.data_range)).all()
        
        if not summaries:
            return jsonify({
                'success': False,
                'message': f'Không có dữ liệu cho ngày {date_str}'
            }), 404
        
        data = {
            'success': True,
            'date': date_str,
            'data': []
        }
        
        for summary in summaries:
            data['data'].append({
                'analysis_date': summary.analysis_date.isoformat(),
                'total_orders': summary.total_orders,
                'total_revenue': float(summary.total_revenue),
                'total_profit': float(summary.total_profit),
                'total_refunds': summary.total_refunds,
                'created_at': summary.created_at.isoformat() if summary.created_at else None,
                'updated_at': summary.updated_at.isoformat() if summary.updated_at else None
            })
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy daily sales theo ngày: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/daily-sales/period/<period>')
def get_daily_sales_by_period(period):
    """Lấy dữ liệu daily sales theo khoảng thời gian"""
    try:
        session = create_session()
        
        # Lấy dữ liệu theo period
        summaries = session.query(DailySalesSummary).filter(
            DailySalesSummary.data_range == period
        ).order_by(desc(DailySalesSummary.analysis_date)).all()
        
        if not summaries:
            return jsonify({
                'success': False,
                'message': f'Không có dữ liệu cho period {period}'
            }), 404
        
        data = {
            'success': True,
            'period': period,
            'data': []
        }
        
        for summary in summaries:
            data['data'].append({
                'analysis_date': summary.analysis_date.isoformat(),
                'data_range': summary.data_range,
                'total_orders': summary.total_orders,
                'total_revenue': float(summary.total_revenue),
                'total_profit': float(summary.total_profit),
                'total_refunds': summary.total_refunds,
                'created_at': summary.created_at.isoformat() if summary.created_at else None,
                'updated_at': summary.updated_at.isoformat() if summary.updated_at else None
            })
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy daily sales theo period: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/top-selling-items')
def get_top_selling_items():
    """Lấy dữ liệu top selling items"""
    try:
        # Lấy parameters từ query string
        period = request.args.get('period', 'all_time')
        sort_type = request.args.get('sort_type', 'revenue')
        limit = int(request.args.get('limit', 10))
        date_str = request.args.get('date')
        
        session = create_session()
        
        query = session.query(TopSellingItem)
        
        # Filter theo period và sort_type
        query = query.filter(
            and_(
                TopSellingItem.data_range == period,
                TopSellingItem.sort_type == sort_type
            )
        )
        
        # Filter theo date nếu có
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                query = query.filter(TopSellingItem.analysis_date == target_date)
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Định dạng ngày không hợp lệ. Sử dụng YYYY-MM-DD'
                }), 400
        
        # Lấy dữ liệu mới nhất nếu không có date
        if not date_str:
            latest_date = session.query(TopSellingItem.analysis_date).order_by(
                desc(TopSellingItem.analysis_date)
            ).first()
            if latest_date:
                query = query.filter(TopSellingItem.analysis_date == latest_date[0])
        
        items = query.order_by(TopSellingItem.rank_position).limit(limit).all()
        
        if not items:
            return jsonify({
                'success': False,
                'message': f'Không có dữ liệu top selling items cho period {period} và sort_type {sort_type}'
            }), 404
        
        data = {
            'success': True,
            'period': period,
            'sort_type': sort_type,
            'limit': limit,
            'data': []
        }
        
        for item in items:
            data['data'].append({
                'analysis_date': item.analysis_date.isoformat(),
                'data_range': item.data_range,
                'sort_type': item.sort_type,
                'sku': item.sku,
                'item_name': item.item_name,
                'total_quantity_sold': item.total_quantity_sold,
                'total_revenue': float(item.total_revenue),
                'total_profit': float(item.total_profit),
                'rank_position': item.rank_position,
                'created_at': item.created_at.isoformat() if item.created_at else None
            })
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy top selling items: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/category-summary')
def get_category_summary():
    """Lấy dữ liệu category summary"""
    try:
        period = request.args.get('period', 'all_time')
        sort_type = request.args.get('sort_type', 'revenue')
        date_str = request.args.get('date')
        
        session = create_session()
        
        query = session.query(CategorySummary).filter(
            and_(
                CategorySummary.data_range == period,
                CategorySummary.sort_type == sort_type
            )
        )
        
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                query = query.filter(CategorySummary.analysis_date == target_date)
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Định dạng ngày không hợp lệ'
                }), 400
        
        if not date_str:
            latest_date = session.query(CategorySummary.analysis_date).order_by(
                desc(CategorySummary.analysis_date)
            ).first()
            if latest_date:
                query = query.filter(CategorySummary.analysis_date == latest_date[0])
        
        categories = query.order_by(CategorySummary.rank_position).all()
        
        if not categories:
            return jsonify({
                'success': False,
                'message': f'Không có dữ liệu category summary cho period {period} và sort_type {sort_type}'
            }), 404
        
        data = {
            'success': True,
            'period': period,
            'sort_type': sort_type,
            'data': []
        }
        
        for category in categories:
            data['data'].append({
                'analysis_date': category.analysis_date.isoformat(),
                'data_range': category.data_range,
                'sort_type': category.sort_type,
                'category_id': category.category_id,
                'category_name': category.category_name,
                'total_quantity_sold': category.total_quantity_sold,
                'total_revenue': float(category.total_revenue),
                'total_profit': float(category.total_profit),
                'profit_margin': float(category.profit_margin),
                'rank_position': category.rank_position,
                'created_at': category.created_at.isoformat() if category.created_at else None
            })
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy category summary: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/brand-summary')
def get_brand_summary():
    """Lấy dữ liệu brand summary"""
    try:
        period = request.args.get('period', 'all_time')
        sort_type = request.args.get('sort_type', 'revenue')
        date_str = request.args.get('date')
        
        session = create_session()
        
        query = session.query(BrandSummary).filter(
            and_(
                BrandSummary.data_range == period,
                BrandSummary.sort_type == sort_type
            )
        )
        
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                query = query.filter(BrandSummary.analysis_date == target_date)
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Định dạng ngày không hợp lệ'
                }), 400
        
        if not date_str:
            latest_date = session.query(BrandSummary.analysis_date).order_by(
                desc(BrandSummary.analysis_date)
            ).first()
            if latest_date:
                query = query.filter(BrandSummary.analysis_date == latest_date[0])
        
        brands = query.order_by(BrandSummary.rank_position).all()
        
        if not brands:
            return jsonify({
                'success': False,
                'message': f'Không có dữ liệu brand summary cho period {period} và sort_type {sort_type}'
            }), 404
        
        data = {
            'success': True,
            'period': period,
            'sort_type': sort_type,
            'data': []
        }
        
        for brand in brands:
            data['data'].append({
                'analysis_date': brand.analysis_date.isoformat(),
                'data_range': brand.data_range,
                'sort_type': brand.sort_type,
                'brand_id': brand.brand_id,
                'brand_name': brand.brand_name,
                'total_quantity_sold': brand.total_quantity_sold,
                'total_revenue': float(brand.total_revenue),
                'total_profit': float(brand.total_profit),
                'profit_margin': float(brand.profit_margin),
                'rank_position': brand.rank_position,
                'created_at': brand.created_at.isoformat() if brand.created_at else None
            })
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy brand summary: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/refund-analysis')
def get_refund_analysis():
    """Lấy dữ liệu refund analysis"""
    try:
        period = request.args.get('period', 'all_time')
        sort_type = request.args.get('sort_type', 'refund_count')
        date_str = request.args.get('date')
        
        session = create_session()
        
        query = session.query(RefundAnalysis).filter(
            and_(
                RefundAnalysis.data_range == period,
                RefundAnalysis.sort_type == sort_type
            )
        )
        
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                query = query.filter(RefundAnalysis.analysis_date == target_date)
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Định dạng ngày không hợp lệ'
                }), 400
        
        if not date_str:
            latest_date = session.query(RefundAnalysis.analysis_date).order_by(
                desc(RefundAnalysis.analysis_date)
            ).first()
            if latest_date:
                query = query.filter(RefundAnalysis.analysis_date == latest_date[0])
        
        refunds = query.order_by(RefundAnalysis.rank_position).all()
        
        if not refunds:
            return jsonify({
                'success': False,
                'message': f'Không có dữ liệu refund analysis cho period {period} và sort_type {sort_type}'
            }), 404
        
        data = {
            'success': True,
            'period': period,
            'sort_type': sort_type,
            'data': []
        }
        
        for refund in refunds:
            data['data'].append({
                'analysis_date': refund.analysis_date.isoformat(),
                'data_range': refund.data_range,
                'sort_type': refund.sort_type,
                'sku': refund.sku,
                'item_name': refund.item_name,
                'total_orders': refund.total_orders,
                'refund_orders': refund.refund_orders,
                'refund_rate': float(refund.refund_rate),
                'refund_reason': refund.refund_reason,
                'refund_quantity': refund.refund_quantity,
                'items_affected': refund.items_affected,
                'rank_position': refund.rank_position,
                'created_at': refund.created_at.isoformat() if refund.created_at else None
            })
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy refund analysis: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/low-stock-alerts')
def get_low_stock_alerts():
    """Lấy dữ liệu low stock alerts"""
    try:
        date_str = request.args.get('date')
        
        session = create_session()
        
        query = session.query(LowStockAlert)
        
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                query = query.filter(LowStockAlert.analysis_date == target_date)
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Định dạng ngày không hợp lệ'
                }), 400
        
        if not date_str:
            latest_date = session.query(LowStockAlert.analysis_date).order_by(
                desc(LowStockAlert.analysis_date)
            ).first()
            if latest_date:
                query = query.filter(LowStockAlert.analysis_date == latest_date[0])
        
        alerts = query.order_by(asc(LowStockAlert.days_left)).all()
        
        if not alerts:
            return jsonify({
                'success': False,
                'message': 'Không có dữ liệu low stock alerts'
            }), 404
        
        data = {
            'success': True,
            'data': []
        }
        
        for alert in alerts:
            data['data'].append({
                'analysis_date': alert.analysis_date.isoformat(),
                'sku': alert.sku,
                'item_name': alert.item_name,
                'current_stock': alert.current_stock,
                'avg_daily_sales': float(alert.avg_daily_sales),
                'days_left': float(alert.days_left),
                'alert_type': alert.alert_type,
                'created_at': alert.created_at.isoformat() if alert.created_at else None
            })
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy low stock alerts: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/batch-analysis')
def get_batch_analysis():
    """Lấy dữ liệu batch analysis"""
    try:
        period = request.args.get('period', 'all_time')
        date_str = request.args.get('date')
        
        session = create_session()
        
        query = session.query(BatchAnalysis).filter(BatchAnalysis.data_range == period)
        
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                query = query.filter(BatchAnalysis.analysis_date == target_date)
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Định dạng ngày không hợp lệ'
                }), 400
        
        if not date_str:
            latest_date = session.query(BatchAnalysis.analysis_date).order_by(
                desc(BatchAnalysis.analysis_date)
            ).first()
            if latest_date:
                query = query.filter(BatchAnalysis.analysis_date == latest_date[0])
        
        batches = query.order_by(desc(BatchAnalysis.sell_through_rate)).all()
        
        if not batches:
            return jsonify({
                'success': False,
                'message': 'Không có dữ liệu batch analysis'
            }), 404
        
        data = {
            'success': True,
            'period': period,
            'data': []
        }
        
        for batch in batches:
            data['data'].append({
                'analysis_date': batch.analysis_date.isoformat(),
                'data_range': batch.data_range,
                'sku': batch.sku,
                'item_name': batch.item_name,
                'batch_id': batch.batch_id,
                'import_date': batch.import_date.isoformat(),
                'total_quantity': batch.total_quantity,
                'remain_quantity': batch.remain_quantity,
                'sold_quantity': batch.sold_quantity,
                'sell_through_rate': float(batch.sell_through_rate),
                'days_since_import': batch.days_since_import,
                'created_at': batch.created_at.isoformat() if batch.created_at else None
            })
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy batch analysis: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/slow-moving-items')
def get_slow_moving_items():
    """Lấy dữ liệu slow moving items"""
    try:
        sort_type = request.args.get('sort_type', 'no_sales')
        date_str = request.args.get('date')
        limit = request.args.get('limit', 20, type=int)
        
        session = create_session()
        
        query = session.query(SlowMovingItem).filter(
            SlowMovingItem.sort_type == sort_type
        )
        
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                query = query.filter(SlowMovingItem.analysis_date == target_date)
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Định dạng ngày không hợp lệ'
                }), 400
        
        if not date_str:
            latest_date = session.query(SlowMovingItem.analysis_date).order_by(
                desc(SlowMovingItem.analysis_date)
            ).first()
            if latest_date:
                query = query.filter(SlowMovingItem.analysis_date == latest_date[0])
        
        items = query.order_by(SlowMovingItem.rank_position).limit(limit).all()
        
        if not items:
            return jsonify({
                'success': False,
                'message': f'Không có dữ liệu slow moving items cho sort_type {sort_type}'
            }), 404
        
        data = {
            'success': True,
            'sort_type': sort_type,
            'data': []
        }
        
        for item in items:
            data['data'].append({
                'analysis_date': item.analysis_date.isoformat(),
                'sort_type': item.sort_type,
                'sku': item.sku,
                'item_name': item.item_name,
                'brand_name': item.brand_name,
                'category_name': item.category_name,
                'current_stock': item.current_stock,
                'total_quantity_sold': item.total_quantity_sold,
                'avg_daily_sales': float(item.avg_daily_sales),
                'days_without_sales': item.days_without_sales,
                'stock_value': float(item.stock_value),
                'potential_loss': float(item.potential_loss),
                'rank_position': item.rank_position,
                'created_at': item.created_at.isoformat() if item.created_at else None
            })
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy slow moving items: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/summary/overview')
def get_summary_overview():
    """Lấy tổng quan dữ liệu summary"""
    try:
        date_str = request.args.get('date')
        
        session = create_session()
        
        # Lấy ngày phân tích
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Định dạng ngày không hợp lệ. Sử dụng YYYY-MM-DD'
                }), 400
        else:
            # Lấy ngày mới nhất
            latest_date = session.query(DailySalesSummary.analysis_date).order_by(
                desc(DailySalesSummary.analysis_date)
            ).first()
            if not latest_date:
                return jsonify({
                    'success': False,
                    'message': 'Không có dữ liệu summary'
                }), 404
            target_date = latest_date[0]
        
        # Lấy daily sales summary
        daily_sales = session.query(DailySalesSummary).filter(
            DailySalesSummary.analysis_date == target_date
        ).first()
        
        # Lấy top selling items (revenue)
        top_items_revenue = session.query(TopSellingItem).filter(
            and_(
                TopSellingItem.analysis_date == target_date,
                TopSellingItem.data_range == 'all_time',
                TopSellingItem.sort_type == 'revenue'
            )
        ).order_by(TopSellingItem.rank_position).limit(5).all()
        
        # Lấy category summary (revenue)
        top_categories = session.query(CategorySummary).filter(
            and_(
                CategorySummary.analysis_date == target_date,
                CategorySummary.data_range == 'all_time',
                CategorySummary.sort_type == 'revenue'
            )
        ).order_by(CategorySummary.rank_position).limit(5).all()
        
        # Lấy brand summary (revenue)
        top_brands = session.query(BrandSummary).filter(
            and_(
                BrandSummary.analysis_date == target_date,
                BrandSummary.data_range == 'all_time',
                BrandSummary.sort_type == 'revenue'
            )
        ).order_by(BrandSummary.rank_position).limit(5).all()
        
        # Lấy low stock alerts
        low_stock_alerts = session.query(LowStockAlert).filter(
            LowStockAlert.analysis_date == target_date
        ).order_by(asc(LowStockAlert.days_left)).limit(10).all()
        
        data = {
            'success': True,
            'analysis_date': target_date.isoformat(),
            'daily_sales': {
                'total_orders': daily_sales.total_orders if daily_sales else 0,
                'total_revenue': float(daily_sales.total_revenue) if daily_sales else 0,
                'total_profit': float(daily_sales.total_profit) if daily_sales else 0,
                'total_refunds': daily_sales.total_refunds if daily_sales else 0
            },
            'top_selling_items': [
                {
                    'sku': item.sku,
                    'item_name': item.item_name,
                    'total_revenue': float(item.total_revenue),
                    'total_profit': float(item.total_profit),
                    'rank_position': item.rank_position
                } for item in top_items_revenue
            ],
            'top_categories': [
                {
                    'category_id': cat.category_id,
                    'category_name': cat.category_name,
                    'total_revenue': float(cat.total_revenue),
                    'total_profit': float(cat.total_profit),
                    'rank_position': cat.rank_position
                } for cat in top_categories
            ],
            'top_brands': [
                {
                    'brand_id': brand.brand_id,
                    'brand_name': brand.brand_name,
                    'total_revenue': float(brand.total_revenue),
                    'total_profit': float(brand.total_profit),
                    'rank_position': brand.rank_position
                } for brand in top_brands
            ],
            'low_stock_alerts': [
                {
                    'sku': alert.sku,
                    'item_name': alert.item_name,
                    'current_stock': alert.current_stock,
                    'days_left': float(alert.days_left),
                    'alert_type': alert.alert_type
                } for alert in low_stock_alerts
            ]
        }
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy summary overview: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/summary/periods')
def get_available_periods():
    """Lấy danh sách các khoảng thời gian có sẵn"""
    try:
        session = create_session()
        
        # Lấy tất cả data_range có sẵn
        periods = session.query(TopSellingItem.data_range).distinct().all()
        
        data = {
            'success': True,
            'periods': [period[0] for period in periods]
        }
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy available periods: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/summary/dates')
def get_available_dates():
    """Lấy danh sách các ngày phân tích có sẵn"""
    try:
        session = create_session()
        
        # Lấy tất cả analysis_date có sẵn
        dates = session.query(DailySalesSummary.analysis_date).distinct().order_by(
            desc(DailySalesSummary.analysis_date)
        ).all()
        
        data = {
            'success': True,
            'dates': [date[0].isoformat() for date in dates]
        }
        
        session.close()
        return jsonify(data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy available dates: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.route('/api/summary/all')
def get_comprehensive_summary():
    """Lấy tổng hợp tất cả data theo từng data range"""
    try:
        date_str = request.args.get('date')
        
        session = create_session()
        
        # Xử lý ngày phân tích
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Định dạng ngày không hợp lệ. Sử dụng YYYY-MM-DD'
                }), 400
        else:
            # Lấy ngày phân tích mới nhất nếu không có date parameter
            latest_date = session.query(DailySalesSummary.analysis_date).order_by(
                desc(DailySalesSummary.analysis_date)
            ).first()
            
            if not latest_date:
                return jsonify({
                    'success': False,
                    'message': 'Không có dữ liệu phân tích'
                }), 404
            
            target_date = latest_date[0]
        
        # Danh sách các data ranges
        data_ranges = [
            '1_day_ago', '7_days_ago', '1_month_ago', 
            '3_months_ago', '6_months_ago', '1_year_ago', 'all_time'
        ]
        
        # Khởi tạo response structure
        summary_data = {
            'success': True,
            'analysis_date': target_date.isoformat(),
            'data': {}
        }
        
        # Tổng hợp data cho từng data range
        for data_range in data_ranges:
            summary_data['data'][data_range] = {
                'daily_sales': {},
                'top_selling_items': {
                    'revenue': [],
                    'profit': [],
                    'quantity': []
                },
                'category_summary': {
                    'revenue': [],
                    'quantity': []
                },
                'brand_summary': {
                    'revenue': [],
                    'quantity': []
                },
                'refund_analysis': {
                    'refund_count': [],
                    'refund_rate': [],
                    'refund_quantity': [],
                    'refund_reason': []
                },
                'slow_moving_items': {
                    'no_sales': [],
                    'low_sales': [],
                    'high_stock_low_sales': [],
                    'aging_stock': []
                }
            }
            
            # 1. Daily Sales Summary
            daily_sales = session.query(DailySalesSummary).filter(
                DailySalesSummary.analysis_date == target_date
            ).first()
            
            if daily_sales:
                summary_data['data'][data_range]['daily_sales'] = {
                    'total_orders': daily_sales.total_orders,
                    'total_revenue': float(daily_sales.total_revenue),
                    'total_profit': float(daily_sales.total_profit),
                    'total_refunds': daily_sales.total_refunds
                }
            
            # 2. Top Selling Items
            for sort_type in ['revenue', 'profit', 'quantity']:
                top_items = session.query(TopSellingItem).filter(
                    and_(
                        TopSellingItem.analysis_date == target_date,
                        TopSellingItem.data_range == data_range,
                        TopSellingItem.sort_type == sort_type
                    )
                ).order_by(TopSellingItem.rank_position).limit(10).all()
                
                summary_data['data'][data_range]['top_selling_items'][sort_type] = [
                    {
                        'sku': item.sku,
                        'item_name': item.item_name,
                        'total_quantity_sold': item.total_quantity_sold,
                        'total_revenue': float(item.total_revenue),
                        'total_profit': float(item.total_profit),
                        'rank_position': item.rank_position
                    } for item in top_items
                ]
            
            # 3. Category Summary
            for sort_type in ['revenue', 'quantity']:
                categories = session.query(CategorySummary).filter(
                    and_(
                        CategorySummary.analysis_date == target_date,
                        CategorySummary.data_range == data_range,
                        CategorySummary.sort_type == sort_type
                    )
                ).order_by(CategorySummary.rank_position).limit(10).all()
                
                summary_data['data'][data_range]['category_summary'][sort_type] = [
                    {
                        'category_id': cat.category_id,
                        'category_name': cat.category_name,
                        'total_quantity_sold': cat.total_quantity_sold,
                        'total_revenue': float(cat.total_revenue),
                        'total_profit': float(cat.total_profit),
                        'profit_margin': float(cat.profit_margin),
                        'rank_position': cat.rank_position
                    } for cat in categories
                ]
            
            # 4. Brand Summary
            for sort_type in ['revenue', 'quantity']:
                brands = session.query(BrandSummary).filter(
                    and_(
                        BrandSummary.analysis_date == target_date,
                        BrandSummary.data_range == data_range,
                        BrandSummary.sort_type == sort_type
                    )
                ).order_by(BrandSummary.rank_position).limit(10).all()
                
                summary_data['data'][data_range]['brand_summary'][sort_type] = [
                    {
                        'brand_id': brand.brand_id,
                        'brand_name': brand.brand_name,
                        'total_quantity_sold': brand.total_quantity_sold,
                        'total_revenue': float(brand.total_revenue),
                        'total_profit': float(brand.total_profit),
                        'profit_margin': float(brand.profit_margin),
                        'rank_position': brand.rank_position
                    } for brand in brands
                ]
            
            # 5. Refund Analysis
            for sort_type in ['refund_count', 'refund_rate', 'refund_quantity', 'refund_reason']:
                refunds = session.query(RefundAnalysis).filter(
                    and_(
                        RefundAnalysis.analysis_date == target_date,
                        RefundAnalysis.data_range == data_range,
                        RefundAnalysis.sort_type == sort_type
                    )
                ).order_by(RefundAnalysis.rank_position).limit(10).all()
                
                summary_data['data'][data_range]['refund_analysis'][sort_type] = [
                    {
                        'sku': refund.sku,
                        'item_name': refund.item_name,
                        'total_orders': refund.total_orders,
                        'refund_orders': refund.refund_orders,
                        'refund_rate': float(refund.refund_rate),
                        'refund_reason': refund.refund_reason,
                        'refund_quantity': refund.refund_quantity,
                        'items_affected': refund.items_affected,
                        'rank_position': refund.rank_position
                    } for refund in refunds
                ]
            
            # 6. Slow Moving Items
            for sort_type in ['no_sales', 'low_sales', 'high_stock_low_sales', 'aging_stock']:
                slow_items = session.query(SlowMovingItem).filter(
                    and_(
                        SlowMovingItem.analysis_date == target_date,
                        SlowMovingItem.sort_type == sort_type
                    )
                ).order_by(SlowMovingItem.rank_position).limit(20).all()
                
                summary_data['data'][data_range]['slow_moving_items'][sort_type] = [
                    {
                        'sku': item.sku,
                        'item_name': item.item_name,
                        'brand_name': item.brand_name,
                        'category_name': item.category_name,
                        'current_stock': item.current_stock,
                        'total_quantity_sold': item.total_quantity_sold,
                        'avg_daily_sales': float(item.avg_daily_sales),
                        'days_without_sales': item.days_without_sales,
                        'stock_value': float(item.stock_value),
                        'potential_loss': float(item.potential_loss),
                        'rank_position': item.rank_position
                    } for item in slow_items
                ]
        
        session.close()
        return jsonify(summary_data)
        
    except Exception as e:
        logging.error(f"Lỗi khi lấy comprehensive summary: {e}")
        return jsonify({
            'success': False,
            'message': f'Lỗi server: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint không tồn tại'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Lỗi server nội bộ'
    }), 500

if __name__ == '__main__':
    print("🚀 Khởi động Analytics API Server...")
    print("📊 Các endpoints có sẵn:")
    print("   - GET /api/daily-sales")
    print("   - GET /api/daily-sales/<date>")
    print("   - GET /api/daily-sales/period/<period>")
    print("   - GET /api/top-selling-items")
    print("   - GET /api/category-summary")
    print("   - GET /api/brand-summary")
    print("   - GET /api/refund-analysis")
    print("   - GET /api/low-stock-alerts")
    print("   - GET /api/batch-analysis")
    print("   - GET /api/slow-moving-items")
    print("   - GET /api/summary/overview")
    print("   - GET /api/summary/all")
    print("   - GET /api/summary/periods")
    print("   - GET /api/summary/dates")
    print("\n Server đang chạy tại: http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
