FROM node:22-alpine

# Cài dependencies cho canvas và fonts
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    pixman-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    font-noto \
    font-noto-cjk \
    font-noto-cjk-extra \
    ttf-dejavu

# Tạo user non-root
RUN adduser -S nodejs

# Tạo thư mục app
WORKDIR /app

# Copy package files trước để cache layer install
COPY package.json ./
# COPY package-lock.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Copy font Roboto vào container (nếu bạn lưu font trong src/fonts)
COPY src/fonts ./src/fonts

# Chuyển quyền cho user non-root
RUN chown -R nodejs /app

# Dùng user non-root để chạy app
USER nodejs

EXPOSE 3000

# Mặc định chạy dev mode (watch)
CMD ["npm", "run", "dev"]