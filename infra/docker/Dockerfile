FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/common/package.json ./packages/common/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/api/ ./apps/api
COPY packages/common/ ./packages/common
COPY apps/web/dist/ ./dist/

# Build common package if needed
# RUN pnpm --filter @repo/common build

ENV PORT=8000
EXPOSE ${PORT}

# Use node directly to run the compiled JavaScript
CMD ["node", "--experimental-wasm-modules", "apps/api/dist/index.js", "dist"]
