FROM node:22-alpine
RUN mkdir -p /usr/src/sharecraft
WORKDIR /usr/src/sharecraft
COPY ./ /usr/src/sharecraft
RUN npm i pnpm -g
RUN pnpm install --registry=https://registry.npmmirror.com/
RUN pnpm run build:vite

FROM nginx:latest
RUN mkdir -p /app
COPY --from=0 /usr/src/sharecraft/dist /app
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 4433
