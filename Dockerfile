FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Remove dev dependencies
RUN yarn install --frozen-lockfile --production=true

# Expose port (Cloud Run uses PORT env variable, defaults to 8080)
EXPOSE 8080

# Start the application
CMD ["yarn", "start"]