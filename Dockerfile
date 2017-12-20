FROM node:9.2.0-alpine

ENV \
  CONSUL_TEMPLATE_VERSION='0.19.4' \
  CONTAINERPILOT_VERSION='3.6.0'

RUN \
  apk --no-cache add curl libc6-compat nginx && \
  mkdir -p /run/nginx && \
  curl -fLsS https://releases.hashicorp.com/consul-template/$CONSUL_TEMPLATE_VERSION/consul-template_${CONSUL_TEMPLATE_VERSION}_linux_amd64.tgz | \
    tar xz -C /usr/local/bin && \
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
ENV BOB_URL='http://localhost'
RUN MINIFY=1 bin/build

COPY bin bin
COPY etc etc
COPY src src

ENV \
  CONSUL_SERVICE_NAME='bob' \
  CONSUL_SERVICE_TAGS='' \
  CONSUL_URL='' \
  CONTAINERPILOT='/code/etc/containerpilot.json5.gotmpl' \
  POSTGRES_URL='pg://postgres:postgres@postgres/postgres'

EXPOSE 80

CMD ["containerpilot"]
