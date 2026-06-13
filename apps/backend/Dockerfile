FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm ci --workspaces

# Copy source
COPY apps/backend ./apps/backend
COPY packages ./packages

# Generate Prisma client
RUN cd apps/backend && npm run db:generate

# Build
RUN cd apps/backend && npm run build

WORKDIR /app/apps/backend

EXPOSE 3001

CMD ["npm", "start"]
