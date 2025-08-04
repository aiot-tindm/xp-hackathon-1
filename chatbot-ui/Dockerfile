FROM node:20

WORKDIR /app

# Cài đặt tất cả dependencies (bao gồm devDependencies cho build)
COPY package*.json ./
RUN npm ci

# Copy mã nguồn
COPY . .

# Build ứng dụng
RUN npm run build

# Xóa devDependencies sau khi build để giảm kích thước image
RUN npm prune --production

# Expose port
EXPOSE 8082

# Chạy ứng dụng production
CMD ["npm", "run", "start"]