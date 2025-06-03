# Stage 1: Cài dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Chỉ copy package.json & package-lock.json rồi chạy npm ci
COPY package.json package-lock.json* ./
RUN npm ci --production

# Stage 2: Copy toàn bộ source code (nếu bạn có bước build TS/Babel, đặt vào đây)
FROM node:18-alpine AS builder
WORKDIR /app
# Copy node_modules từ stage deps
COPY --from=deps /app/node_modules ./node_modules
# Copy toàn bộ source code
COPY . .

# Nếu cần build (ví dụ TypeScript hoặc Babel), bạn thêm lệnh tại đây.
# Ví dụ (nếu có):
# RUN npm run build

# Stage 3: Runtime image
FROM node:18-alpine AS runner
WORKDIR /app

# Chỉ copy node_modules đã cài
COPY --from=deps /app/node_modules ./node_modules
# Copy lại toàn bộ source (hoặc chỉ file sản phẩm build)
COPY . .

# Mở port 3001 để host bên ngoài có thể map vào
EXPOSE 3001

# Khi chạy, server.js sẽ chạy Node, và code trong server.js/app.js sẽ đọc process.env.PORT
CMD [ "node", "server.js" ]
