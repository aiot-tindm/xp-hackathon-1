FROM python:3.9-slim

WORKDIR /app

# Cài đặt các dependencies
COPY ../requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy mã nguồn
COPY . .

# Expose port
EXPOSE 5000

# Chạy Flask server
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]