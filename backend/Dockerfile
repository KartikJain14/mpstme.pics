# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Expose app port
EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]
