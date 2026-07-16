FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY prisma/ ./prisma/
RUN npm install --registry=https://registry.npmmirror.com
RUN npx prisma generate
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

FROM node:22-alpine
WORKDIR /app

# Install health check dependencies
RUN apk add --no-cache curl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -sf http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["node", "dist/index.js"]
