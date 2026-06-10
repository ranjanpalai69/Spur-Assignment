FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json backend/tsconfig.json ./
RUN npm ci
COPY backend/src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN mkdir -p data
EXPOSE 3001
CMD ["node", "dist/app.js"]
