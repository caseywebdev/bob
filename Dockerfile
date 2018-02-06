FROM node:9.5.0-alpine

ENV CONTAINERPILOT_VERSION='3.6.2'
RUN \
  apk --no-cache add curl libc6-compat nginx && \
  mkdir -p /run/nginx && \
  curl -fLsS https://github.com/joyent/containerpilot/releases/download/$CONTAINERPILOT_VERSION/containerpilot-$CONTAINERPILOT_VERSION.tar.gz | \
    tar xz -C /usr/local/bin

WORKDIR /code

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

ENV \
  BOB_URL='http://localhost' \
  CONSUL_SERVICE_NAME='bob' \
  CONSUL_SERVICE_TAGS='' \
  CONSUL_URL='' \
  CONTAINERPILOT='/code/etc/containerpilot.json5.gotmpl' \
  POSTGRES_URL='pg://postgres:postgres@postgres/postgres'

EXPOSE 80

CMD ["containerpilot"]
