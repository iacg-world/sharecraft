FROM node:20-alpine
RUN mkdir -p /usr/src/sharecraft
WORKDIR /usr/src/sharecraft
COPY ./ /usr/src/sharecraft
# RUN npm i pnpm@8 -g --registry=https://registry.npmmirror.com/
RUN npm install --registry=https://registry.npmmirror.com/
RUN npm run build:vite

FROM nginx:latest
RUN mkdir -p /app
COPY --from=0 /usr/src/sharecraft/dist /app
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 4433