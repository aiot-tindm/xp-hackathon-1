FROM node:20-alpine

WORKDIR /app

# Cài đặt các dependencies
# COPY package*.json ./
# RUN npm install

# Copy mã nguồn
COPY . .

# Build ứng dụng
# RUN npm run build

# Expose port
EXPOSE 8082

# Chạy ứng dụng
CMD ["npm", "run", "start"]