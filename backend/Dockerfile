# ====== Development Stage ======
FROM node:24.11.1 AS development

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Expose port (optional, for clarity)
EXPOSE 3000

# Run the app in dev mode (adjust command as needed)
CMD ["npm", "run", "dev"]

# ====== Builder Stage ======
FROM node:24.11.1 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
COPY tsconfig.json ./
RUN npm run build  # produces dist/

# ====== Production Stage ======
FROM node:24.11.1-alpine AS production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --omit=dev
COPY --from=builder /app/dist ./dist
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]