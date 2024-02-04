FROM node:16-alpine
RUN mkdir -p /usr/src/sharecraft
WORKDIR /usr/src/sharecraft
COPY ./ /usr/src/sharecraft
RUN npm i pnpm -g --registry=https://registry.npmmirror.com/
RUN pnpm install --registry=https://registry.npmmirror.com/
RUN pnpm run build

FROM nginx:latest
RUN mkdir -p /app
COPY --from=0 /usr/src/sharecraft/dist /app
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80