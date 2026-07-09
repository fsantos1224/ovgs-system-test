FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install && npm cache clean --force
COPY src/ src/
COPY index.html vite.config.ts tsconfig*.json ./
RUN npm run build

# Frontend: nginx master precisa de root (bind em :80),
# mas os workers rodam como 'nginx' via diretiva user no nginx.conf.
FROM nginx:alpine
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]