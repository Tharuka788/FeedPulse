FROM node:20-alpine

WORKDIR /app

# Install dependencies separately for caching
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose backend port
EXPOSE 4000

# Start the application in development mode
CMD ["npm", "run", "dev"]
