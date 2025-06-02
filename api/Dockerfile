# Stage 1: Build step (cài dependencies)
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package.json and package-lock.json (nếu có) rồi cài dependencies
COPY package.json package-lock.json* ./
RUN npm ci --production

# Stage 2: Copy toàn bộ source code và build (nếu bạn cần build TS hay tương tự)
FROM node:18-alpine AS builder
WORKDIR /app
# Copy dependencies từ stage trước
COPY --from=deps /app/node_modules ./node_modules
# Copy toàn bộ source code của backend
COPY . .

# Nếu bạn dùng Babel/ESM, thường không cần build; 
# nếu code thuần ESM hoặc đã ready thì bỏ qua step này.

# Stage 3: Runtime image gọn nhẹ
FROM node:18-alpine AS runner
WORKDIR /app

# Copy node_modules từ deps
COPY --from=deps /app/node_modules ./node_modules
# Copy toàn bộ source (hoặc chỉ file cần thiết)
COPY . .

# Thiết lập biến môi trường cho node (đảm bảo chạy ở production)
ENV NODE_ENV=production
ENV PORT=5000

# Expose port mà Express sẽ chạy
EXPOSE 5000

# Lệnh khởi động server
CMD [ "node", "server.js" ]
