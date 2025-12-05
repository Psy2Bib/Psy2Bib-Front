# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Arguments de build (Vite remplace ces variables au moment du build)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Cache des dépendances
COPY package*.json ./
RUN npm ci

# Build de l'application
COPY . .
RUN npm run build

# Stage 2: Serveur Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
