FROM node:10.4.0-alpine

WORKDIR /code

CMD ["containerpilot"]

EXPOSE 80

ENV \
  BOB_API_URL='http://localhost:8080' \
  BOB_CLIENT_URL='http://localhost' \
  CONSUL_SERVICE_NAME='bob' \
  CONSUL_SERVICE_TAGS='' \
  CONSUL_URL='' \
  CONTAINERPILOT='/code/etc/containerpilot.json5.gotmpl' \
  MAIL_ENABLED='0' \
  MAIL_FROM_ADDRESS='' \
  MAIL_FROM_NAME='' \
  MAIL_SMTP_URL='' \
  POSTGRES_URL='pg://postgres:postgres@postgres/postgres' \
  ROOT_EMAIL_ADDRESS='' \
  TOKEN_HASH_ALGORITHM='sha512' \
  TOKEN_SIZE='32' \
  TRUST_FORWARDED_FOR_INDEX='0'

RUN \
  apk --no-cache add curl nginx && \
  mkdir -p /run/nginx && \
  CONTAINERPILOT_VERSION='3.8.0' && \
  curl -fLsS https://github.com/joyent/containerpilot/releases/download/$CONTAINERPILOT_VERSION/containerpilot-$CONTAINERPILOT_VERSION.tar.gz | \
    tar xz -C /usr/local/bin

COPY package-lock.json package.json ./
RUN npm install

COPY .eslintrc .stylelintrc ./
COPY bin/build bin/
COPY etc/cogs.js etc/nginx.conf etc/
COPY src/client src/client
COPY src/shared src/shared
RUN MINIFY=1 bin/build

COPY bin bin
COPY etc etc
COPY src src
