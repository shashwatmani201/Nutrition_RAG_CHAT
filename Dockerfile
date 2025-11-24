# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (use npm ci for reproducible installs)
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy source and build
COPY . .
RUN npm run build

# --- Production stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built next app and node modules
COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 3000

# Next.js start command
CMD ["npm", "run", "start"]
