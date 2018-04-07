FROM node:9.11.1-alpine

WORKDIR /code

CMD ["containerpilot"]

EXPOSE 80

ENV \
  BOB_URL='http://localhost' \
  CONSUL_SERVICE_NAME='bob' \
  CONSUL_SERVICE_TAGS='' \
  CONSUL_URL='' \
  CONTAINERPILOT='/code/etc/containerpilot.json5.gotmpl' \
  MAIL_ENABLED='0' \
  MAIL_FROM_ADDRESS='' \
  MAIL_FROM_NAME='' \
  MAIL_SMTP_URL='' \
  PASSWORD_SALT_ROUNDS='10' \
  POSTGRES_URL='pg://postgres:postgres@postgres/postgres' \
  ROOT_EMAIL_ADDRESS='' \
  TOKEN_SALT_ROUNDS='4' \
  TOKEN_SIZE='32'

RUN \
  apk --no-cache add curl g++ libc6-compat make nginx python && \
  mkdir -p /run/nginx && \
  CONTAINERPILOT_VERSION='3.7.0' && \
  curl -fLsS https://github.com/joyent/containerpilot/releases/download/$CONTAINERPILOT_VERSION/containerpilot-$CONTAINERPILOT_VERSION.tar.gz | \
    tar xz -C /usr/local/bin

COPY package-lock.json package.json ./
RUN npm install --build-from-source=bcrypt

COPY .eslintrc .stylelintrc ./
COPY bin/build bin/
COPY etc/cogs.js etc/nginx.conf etc/
COPY src/client src/client
COPY src/shared src/shared
RUN MINIFY=1 bin/build

COPY bin bin
COPY etc etc
COPY src src
