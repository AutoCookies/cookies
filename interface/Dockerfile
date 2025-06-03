# Stage 1: cài dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: build Next.js (nhận NEXT_PUBLIC_API_ROUTE từ build-arg)
FROM node:18-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_ROUTE
ENV NEXT_PUBLIC_API_ROUTE=${NEXT_PUBLIC_API_ROUTE}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Stage 3: runtime
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]
