# Blaze Intelligence Platform - Multi-stage Docker Build
# Optimized for sports analytics with Node.js and Python capabilities

# Stage 1: Base Node.js setup
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 py3-pip curl git

# Stage 2: Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 3: Development dependencies (for build)
FROM base AS build-deps
COPY package*.json ./
RUN npm ci

# Stage 4: Build stage
FROM build-deps AS build
COPY . .
RUN npm run build

# Stage 5: Production runtime
FROM node:18-alpine AS runtime

# Install system dependencies for sports analytics
RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    git \
    imagemagick \
    && rm -rf /var/cache/apk/*

# Install Python dependencies for analytics
RUN pip3 install --no-cache-dir \
    pandas \
    numpy \
    requests \
    python-dotenv

WORKDIR /app

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Copy application files
COPY package*.json ./
COPY *.js ./
COPY *.md ./
COPY scripts/ ./scripts/
COPY schemas/ ./schemas/
COPY data/ ./data/
COPY austin-portfolio-deploy/ ./austin-portfolio-deploy/

# Create non-root user for security
RUN addgroup -g 1001 -S blazeapp && \
    adduser -S blazeapp -u 1001 -G blazeapp
USER blazeapp

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=8000
ENV PYTHONPATH=/app

EXPOSE 8000

# Default command
CMD ["npm", "run", "serve"]