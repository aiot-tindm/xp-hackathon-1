# 📊 Revenue Prediction Analysis - Documentation

## 🎯 Tổng quan

API `/api/revenue-prediction` cung cấp dự đoán doanh thu tháng tới sử dụng Machine Learning (Linear Regression) dựa trên dữ liệu lịch sử bán hàng.

## 📈 Cấu trúc dữ liệu

### 1. **Thông tin cơ bản**
```json
{
  "success": true,
  "analysis_date": "2024-06-30",        // Ngày thực hiện phân tích
  "prediction_period": "next_month",     // Khoảng thời gian dự đoán
  "prediction_days": 30,                 // Số ngày dự đoán (30 ngày)
  "created_at": "2025-08-04T10:14:06",  // Thời gian tạo dự đoán
  "updated_at": "2025-08-04T10:14:06"   // Thời gian cập nhật
}
```

### 2. **Phân tích dữ liệu lịch sử (Historical Analysis)**

```json
"historical_analysis": {
  "total_revenue": 3032473.62,      // Tổng doanh thu lịch sử
  "avg_daily_revenue": 19820.09,    // Trung bình doanh thu/ngày
  "std_daily_revenue": 15663.27,    // Độ lệch chuẩn doanh thu/ngày
  "data_days": 153,                 // Số ngày có dữ liệu
  "trend_percentage": 228.98,       // Tỷ lệ tăng trưởng (%)
  "r2_score": 0.6357,              // Độ chính xác model (0-1)
  "mape": 66.06                     // Mean Absolute Percentage Error (%)
}
```

**Giải thích:**
- **`total_revenue`**: Tổng doanh thu trong 153 ngày = 3,032,473 VNĐ
- **`avg_daily_revenue`**: Trung bình 19,820 VNĐ/ngày
- **`std_daily_revenue`**: Độ biến động cao (15,663 VNĐ) → Doanh thu không ổn định
- **`trend_percentage`**: Tăng trưởng 228.98% → Xu hướng tăng mạnh
- **`r2_score`**: 0.6357 → Model có độ chính xác trung bình (63.57%)
- **`mape`**: 66.06% → Sai số trung bình khá cao

### 3. **Dự đoán (Predictions)**

```json
"predictions": {
  "total_predicted_revenue": 1095604.21,    // Tổng doanh thu dự đoán
  "avg_daily_prediction": 36520.14,         // Trung bình dự đoán/ngày
  "confidence_interval": 168150.84,         // Khoảng tin cậy
  "lower_bound": 927453.37,                 // Giới hạn dưới
  "upper_bound": 1263755.05                 // Giới hạn trên
}
```

**Giải thích:**
- **Dự đoán tổng**: 1,095,604 VNĐ (tăng 84% so với trung bình lịch sử)
- **Trung bình/ngày**: 36,520 VNĐ (tăng 84% so với 19,820 VNĐ)
- **Khoảng tin cậy**: ±168,151 VNĐ (95% confidence)
- **Phạm vi dự đoán**: 927,453 - 1,263,755 VNĐ

### 4. **Thông tin Model (Model Info)**

```json
"model_info": {
  "algorithm": "Linear Regression",
  "features_used": [
    "weekday", "month", "day", "day_of_year",
    "ma_7", "ma_14", "ma_30", "growth_rate", "volatility"
  ],
  "data_points": 153,
  "confidence_level": 92.71
}
```

**Giải thích:**
- **Thuật toán**: Linear Regression (Hồi quy tuyến tính)
- **Features sử dụng**:
  - `weekday`: Ngày trong tuần (0-6)
  - `month`: Tháng (1-12)
  - `day`: Ngày trong tháng (1-31)
  - `day_of_year`: Ngày trong năm (1-365)
  - `ma_7/14/30`: Moving average 7/14/30 ngày
  - `growth_rate`: Tỷ lệ tăng trưởng
  - `volatility`: Độ biến động
- **Số điểm dữ liệu**: 153 ngày
- **Độ tin cậy**: 92.71% (rất cao)

### 5. **Đánh giá rủi ro (Risk Assessment)**

```json
"risk_assessment": {
  "high_volatility": true,      // Độ biến động cao
  "negative_trend": false,       // Xu hướng không giảm
  "low_confidence": false,       // Độ tin cậy không thấp
  "insufficient_data": false     // Dữ liệu đủ
}
```

**Giải thích:**
- ✅ **Xu hướng tích cực**: Không có xu hướng giảm
- ✅ **Độ tin cậy cao**: 92.71%
- ✅ **Dữ liệu đủ**: 153 ngày
- ⚠️ **Độ biến động cao**: Cần theo dõi sát sao

### 6. **Phân tích theo ngày trong tuần (Weekday Analysis)**

```json
"weekday_analysis": {
  "mean": {
    "0": 22375.70,  // Thứ 2: Cao nhất
    "1": 20604.17,  // Thứ 3
    "2": 19336.12,  // Thứ 4
    "3": 17978.52,  // Thứ 5: Thấp nhất
    "4": 18630.56,  // Thứ 6
    "5": 22874.99,  // Thứ 7: Cao nhất
    "6": 17056.72   // Chủ nhật: Thấp nhất
  },
  "std": {
    "0": 18860.99,  // Độ biến động thứ 2
    "1": 14895.87,  // Độ biến động thứ 3
    "2": 13447.65,  // Độ biến động thứ 4
    "3": 16256.63,  // Độ biến động thứ 5
    "4": 16226.88,  // Độ biến động thứ 6
    "5": 17768.23,  // Độ biến động thứ 7
    "6": 12677.68   // Độ biến động chủ nhật
  }
}
```

**Phân tích:**
- **Ngày bán tốt nhất**: Thứ 7 (22,875 VNĐ) và Thứ 2 (22,376 VNĐ)
- **Ngày bán kém nhất**: Chủ nhật (17,057 VNĐ) và Thứ 5 (17,979 VNĐ)
- **Độ biến động cao nhất**: Thứ 2 (18,861 VNĐ)
- **Độ biến động thấp nhất**: Chủ nhật (12,678 VNĐ)

### 7. **Dự đoán từng ngày (Daily Predictions)**

```json
"daily_predictions": [
  {
    "date": "2024-07-01",
    "predicted_revenue": 36191.30,
    "weekday": "Monday"
  },
  // ... 30 ngày
]
```

**Đặc điểm:**
- **Xu hướng tăng dần**: Từ 36,191 VNĐ (1/7) → 37,796 VNĐ (30/7)
- **Tăng trung bình**: ~55 VNĐ/ngày
- **Theo pattern tuần**: Cao vào đầu tuần, thấp vào cuối tuần

## 📊 Biểu đồ phân tích

### Xu hướng doanh thu dự đoán:
```
Tháng 7/2024: 36,191 → 37,796 VNĐ/ngày
Tăng trung bình: 55 VNĐ/ngày
Tổng dự đoán: 1,095,604 VNĐ
```

### So sánh với lịch sử:
```
Lịch sử (153 ngày):    19,820 VNĐ/ngày
Dự đoán (30 ngày):     36,520 VNĐ/ngày
Tăng trưởng:           +84%
```

## ⚠️ Cảnh báo và khuyến nghị

### 1. **Độ biến động cao**
- **Nguyên nhân**: `high_volatility: true`
- **Khuyến nghị**: Theo dõi sát sao, chuẩn bị kế hoạch dự phòng

### 2. **Sai số dự đoán**
- **MAPE**: 66.06% (khá cao)
- **Khuyến nghị**: Sử dụng dự đoán như tham khảo, không nên dựa hoàn toàn

### 3. **Xu hướng tích cực**
- **Trend**: +228.98% (rất tốt)
- **Khuyến nghị**: Tận dụng xu hướng tăng, tăng cường marketing

## 🎯 Kết luận

### Điểm tích cực:
- ✅ Xu hướng tăng trưởng mạnh (+228.98%)
- ✅ Độ tin cậy cao (92.71%)
- ✅ Dữ liệu đủ (153 ngày)
- ✅ Model sử dụng nhiều features phù hợp

### Điểm cần lưu ý:
- ⚠️ Độ biến động cao
- ⚠️ Sai số dự đoán khá lớn (66.06%)
- ⚠️ Cần theo dõi sát sao thực tế

### Khuyến nghị:
1. **Sử dụng dự đoán như tham khảo**, không dựa hoàn toàn
2. **Theo dõi sát sao** doanh thu thực tế
3. **Tăng cường marketing** vào thứ 7 và thứ 2
4. **Chuẩn bị kế hoạch dự phòng** do độ biến động cao
5. **Cập nhật model định kỳ** với dữ liệu mới

---

*📅 Cập nhật lần cuối: 04/08/2025*
*🔧 API Version: 1.0.0* 