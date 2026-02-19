# Use Debian-based Node 20 for better Prisma compatibility
FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace config files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy all package.json files
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/
COPY packages/db/package.json ./packages/db/
COPY packages/scraping/package.json ./packages/scraping/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client
WORKDIR /app/packages/db
RUN pnpm prisma generate

# Return to app directory
WORKDIR /app

# Build the application
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3000

# Start script that runs migrations and starts the server
CMD ["sh", "-c", "cd /app/packages/db && pnpm prisma migrate deploy && cd /app && pnpm --filter server exec tsx src/index.ts"]
