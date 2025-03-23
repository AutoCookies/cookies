# Sử dụng Node.js 18 (Debian-based, tránh lỗi SWC)
FROM node:18

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . . 

# **Build ứng dụng trước khi chạy**
RUN npm run build

# Expose cổng 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]
