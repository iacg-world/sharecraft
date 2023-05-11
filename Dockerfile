FROM node:16-alpine
RUN mkdir -p /usr/src/sharecraft
WORKDIR /usr/src/sharecraft
COPY ./ /usr/src/sharecraft/
RUN npm i pnpm -g
RUN pnpm install
RUN pnpm run build

FROM nginx
RUN mkdir -p /usr/src/sharecraft
COPY --from=0 /usr/src/sharecraft/dist /usr/src/sharecraft/dist
ADD ./nginx.conf /etc/nginx/nginx.conf