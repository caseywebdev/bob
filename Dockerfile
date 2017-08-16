FROM node:8.3.0-alpine

WORKDIR /code

ENV CONTAINERPILOT_VERSION='3.3.4'

RUN apk --no-cache add curl nginx && \
    curl -fLsS https://github.com/joyent/containerpilot/releases/download/$CONTAINERPILOT_VERSION/containerpilot-$CONTAINERPILOT_VERSION.tar.gz | \
      tar xz -C /usr/local/bin/

COPY package.json /code/package.json
RUN npm install --no-save

COPY .eslintrc /code/.eslintrc
COPY .stylelintrc /code/.stylelintrc
COPY bin/build /code/bin/build
COPY etc/cogs.js /code/etc/cogs.js
COPY etc/nginx.conf /code/etc/nginx.conf
COPY src/client /code/src/client
COPY src/shared /code/src/shared
ENV BOB_URL='http://localhost'
RUN MINIFY=1 bin/build

COPY bin /code/bin
COPY etc /code/etc
COPY src /code/src

ENV \
  CONSUL_SERVICE_NAME='bob' \
  CONSUL_SERVICE_TAGS='' \
  POSTGRES_URL='pg://postgres:postgres@postgres/postgres'

EXPOSE 80

CMD ["bin/run"]
