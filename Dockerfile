# syntax=docker/dockerfile:1.4
# AppVantix Web Builder - Production-Ready for Google Cloud Run

# Build stage
FROM node:22-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy package files for dependency caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with frozen lockfile
RUN --mount=type=cache,target=/root/.pnpm \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --production

# Base runtime stage
FROM node:22-slim AS base

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Development stage
FROM base AS bolt-ai-development

# Copy built application from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml* ./

# Copy source for development
COPY app ./app
COPY .env.example ./.env.example

ENV NODE_ENV=development
ENV PORT=5173

EXPOSE 5173

CMD ["pnpm", "run", "dev"]

# Production stage
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS bolt-ai-production

ENV NODE_ENV=production
ENV PORT=8080
ENV WRANGLER_SEND_METRICS=false

WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=nonroot:nonroot /app/build ./build
COPY --from=builder --chown=nonroot:nonroot /app/public ./public
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/package.json ./package.json

# Define environment variables with default values
ARG GROQ_API_KEY
ARG HuggingFace_API_KEY
ARG OPENAI_API_KEY
ARG ANTHROPIC_API_KEY
ARG OPEN_ROUTER_API_KEY
ARG GOOGLE_GENERATIVE_AI_API_KEY
ARG OLLAMA_API_BASE_URL
ARG XAI_API_KEY
ARG TOGETHER_API_KEY
ARG TOGETHER_API_BASE_URL
ARG AWS_BEDROCK_CONFIG
ARG VITE_LOG_LEVEL=info
ARG DEFAULT_NUM_CTX=32768
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG STRIPE_PUBLISHABLE_KEY

ENV GROQ_API_KEY=${GROQ_API_KEY} \
    HuggingFace_API_KEY=${HuggingFace_API_KEY} \
    OPENAI_API_KEY=${OPENAI_API_KEY} \
    ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY} \
    OPEN_ROUTER_API_KEY=${OPEN_ROUTER_API_KEY} \
    GOOGLE_GENERATIVE_AI_API_KEY=${GOOGLE_GENERATIVE_AI_API_KEY} \
    OLLAMA_API_BASE_URL=${OLLAMA_API_BASE_URL} \
    XAI_API_KEY=${XAI_API_KEY} \
    TOGETHER_API_KEY=${TOGETHER_API_KEY} \
    TOGETHER_API_BASE_URL=${TOGETHER_API_BASE_URL} \
    AWS_BEDROCK_CONFIG=${AWS_BEDROCK_CONFIG} \
    VITE_LOG_LEVEL=${VITE_LOG_LEVEL} \
    DEFAULT_NUM_CTX=${DEFAULT_NUM_CTX} \
    SUPABASE_URL=${SUPABASE_URL} \
    SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY} \
    STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD ["/nodejs/bin/node", "-e", "require('http').get({port:process.env.PORT,path:'/health',timeout:5000},res=>{process.exit(res.statusCode===200?0:1)}).on('error',()=>process.exit(1))"]

EXPOSE 8080

USER nonroot

CMD ["/nodejs/bin/node", "build/index.js"]
