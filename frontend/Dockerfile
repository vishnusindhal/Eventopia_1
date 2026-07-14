# Stage 1: Build Vite React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files for caching dependencies
COPY package*.json ./

# Install dependencies (need dev dependencies to build)
RUN npm ci

# Copy source files
COPY . .

# Pass VITE_API_URL as build argument (Vite bakes env vars at build time)
ARG VITE_API_URL=http://localhost/api
ENV VITE_API_URL=$VITE_API_URL

# Build the application for production
RUN npm run build

# Stage 2: Serve the build directory statically using Nginx
FROM nginx:1.25-alpine

# Copy custom Nginx configuration for single-page app support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx default public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx server port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
