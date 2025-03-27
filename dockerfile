# Base image with Node and npm
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]
