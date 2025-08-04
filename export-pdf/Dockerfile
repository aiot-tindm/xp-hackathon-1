FROM node:22.16.0-alpine

# Cài đặt dependencies cần thiết
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

ENV PORT=3000

# Copy package files
COPY package.json ./

# Cài đặt dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Copy fonts directory
COPY --chown=nodejs src/fonts ./dist/fonts

# Tạo user không phải root
RUN adduser -S nodejs

# Chuyển ownership
RUN chown -R nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"] 