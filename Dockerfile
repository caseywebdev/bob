FROM node:9.5.0-alpine

CMD ["containerpilot"]

EXPOSE 80

WORKDIR /code

ENV \
  BOB_URL='http://localhost' \
  CONSUL_SERVICE_NAME='bob' \
  CONSUL_SERVICE_TAGS='' \
  CONSUL_URL='' \
  CONTAINERPILOT_VERSION='3.6.2' \
  CONTAINERPILOT='/code/etc/containerpilot.json5.gotmpl' \
  POSTGRES_URL='pg://postgres:postgres@postgres/postgres'

RUN \
  apk --no-cache add curl g++ libc6-compat make nginx python && \
  mkdir -p /run/nginx && \
  curl -fLsS https://github.com/joyent/containerpilot/releases/download/$CONTAINERPILOT_VERSION/containerpilot-$CONTAINERPILOT_VERSION.tar.gz | \
    tar xz -C /usr/local/bin

COPY package.json ./
RUN npm install --no-save

COPY .eslintrc .stylelintrc ./
COPY bin/build bin/
COPY etc/cogs.js etc/nginx.conf etc/
COPY src/client src/client
COPY src/shared src/shared
RUN MINIFY=1 bin/build

COPY bin bin
COPY etc etc
COPY src src
