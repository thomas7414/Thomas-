FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies
RUN npm ci --workspaces

# Copy source
COPY apps/frontend ./apps/frontend
COPY packages ./packages

# Build
RUN cd apps/frontend && npm run build

WORKDIR /app/apps/frontend

EXPOSE 3000

CMD ["npm", "start"]
