FROM node:8.3.0-alpine

ENV CONTAINERPILOT_VERSION='3.3.4'

RUN \
  apk --no-cache add curl libc6-compat nginx && \
  mkdir -p /run/nginx && \
  curl -fLsS https://github.com/joyent/containerpilot/releases/download/$CONTAINERPILOT_VERSION/containerpilot-$CONTAINERPILOT_VERSION.tar.gz | \
    tar xz -C /usr/local/bin/

WORKDIR /code

COPY package.json ./
RUN npm install --no-save

COPY .eslintrc .stylelintrc ./
COPY bin/build bin/
COPY etc/cogs.js etc/
COPY etc/nginx.conf etc/
COPY src/client src/client
COPY src/shared src/shared
ENV BOB_URL='http://localhost'
RUN MINIFY=1 bin/build

COPY bin bin
COPY etc etc
COPY src src

ENV \
  CONSUL_SERVICE_NAME='bob' \
  CONSUL_SERVICE_TAGS='' \
  POSTGRES_URL='pg://postgres:postgres@postgres/postgres'

EXPOSE 80

CMD ["bin/run"]
