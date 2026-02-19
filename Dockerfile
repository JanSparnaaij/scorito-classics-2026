# Use a Node.js base image
FROM node:18-alpine

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
RUN pnpm --filter db prisma generate

# Build the application
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3000

# Start the application with tsx to support TypeScript workspace packages
CMD ["pnpm", "--filter", "server", "exec", "tsx", "src/index.ts"]
