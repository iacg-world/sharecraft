FROM node:16-alpine
RUN mkdir -p /usr/src/sharecraft
WORKDIR /usr/src/sharecraft
COPY ./ /usr/src/sharecraft
RUN npm i pnpm -g --registry=https://registry.npm.taobao.org
RUN pnpm install --registry=https://registry.npm.taobao.org
RUN pnpm run build

FROM nginx
RUN mkdir -p /app
COPY --from=0 /usr/src/sharecraft/dist /app
COPY ./nginx.conf /etc/nginx/nginx.conf
WORKDIR /
COPY ./etc/nginx/cert/sharecraft.lc404.cn_nginx /etc/nginx/cert/sharecraft.lc404.cn_nginx
EXPOSE 80