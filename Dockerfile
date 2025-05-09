# Use an official Node.js runtime as a parent image (Debian-based for better compatibility)
FROM node:20-slim AS builder

# Set the working directory
WORKDIR /usr/src/app

# Install Prisma CLI globally (optional, but can be useful)
# RUN npm install -g prisma

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies using npm ci for cleaner installs
# Might need build-essential or python if some deps have native bindings
# RUN apt-get update && apt-get install -y --no-install-recommends build-essential python3 && npm ci && apt-get purge -y --auto-remove build-essential python3 && rm -rf /var/lib/apt/lists/*
RUN npm ci

# Copy the rest of the application code
COPY . .

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# --- Production Stage ---
FROM node:20-slim

WORKDIR /usr/src/app

# Install necessary runtime dependencies (specifically openssl for Prisma)
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy prisma schema and migrations for runtime access (e.g., migrate deploy)
COPY --from=builder /usr/src/app/prisma ./prisma

# Copy node_modules from builder stage (including Prisma client)
# Ensure Prisma client generated in the builder stage is copied
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Expose the port the app runs on (using the modified port)
EXPOSE 3001

# Define the command to run the app
# Use the correct path based on previous findings
CMD ["node", "dist/src/main.js"]
