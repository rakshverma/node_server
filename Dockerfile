FROM node:22-alpine AS node-base

FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

FROM nginx:1.27-alpine

WORKDIR /app

COPY --from=node-base /usr/local/bin/node /usr/local/bin/node
COPY --from=node-base /usr/lib/libstdc++.so.6 /usr/lib/libstdc++.so.6
COPY --from=node-base /usr/lib/libgcc_s.so.1 /usr/lib/libgcc_s.so.1
COPY --from=deps /app /app
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_PORT=3000
ENV NGINX_PORT=8080
ENV PORT=3000

EXPOSE 8080

CMD ["docker-entrypoint.sh"]
