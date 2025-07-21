FROM caddy:alpine AS caddy

FROM node:16-alpine

COPY --from=caddy /usr/bin/caddy /usr/bin/caddy

ARG BUILD_PRODUCTION

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY src src
COPY public public

RUN if [ $BUILD_PRODUCTION ]; then npm run build; fi

COPY docker/Caddyfile /usr/src/app/Caddyfile
COPY docker/frontend_start.sh /frontend_start.sh

EXPOSE 3000

VOLUME /usr/src/app/src
VOLUME /usr/src/app/public
VOLUME /usr/src/app/exports

CMD ["/frontend_start.sh"]