# Stage 1: Build
FROM node:22.16.0-alpine AS builder

# Cài các gói cần thiết để build node-canvas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    pixman-dev \
    freetype-dev \
    libjpeg-turbo-dev

WORKDIR /app

# Copy package và cài đặt tất cả deps (dev + prod)
COPY package.json ./
RUN npm install

# Copy source code & build
COPY . .
RUN npm run build


# Stage 2: Runtime
FROM node:22.16.0-alpine AS production

# Cài các thư viện native cần cho chartjs-node-canvas khi runtime
RUN apk add --no-cache \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    pixman-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    g++ \
    make \
    musl-dev

# Tạo user không cần root
RUN adduser -S nodejs

WORKDIR /app

# Copy package và cài prod dependencies
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy dist folder từ builder
COPY --from=builder /app/dist ./dist

# Nếu cần, copy fonts
# COPY --from=builder /app/fonts ./fonts

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/index.js"]
