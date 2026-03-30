FROM node:20-alpine

WORKDIR /app

# Install dependencies separately for caching
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]
