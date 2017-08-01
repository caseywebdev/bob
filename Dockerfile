FROM node:8.2.1

WORKDIR /code

ENV CONTAINERPILOT_VERSION 3.3.1
RUN apt-get update && \
    apt-get install -y software-properties-common && \
    curl -L https://nginx.org/keys/nginx_signing.key | apt-key add - && \
    add-apt-repository "deb http://nginx.org/packages/mainline/debian/ `lsb_release -cs` nginx" && \
    apt-get update && \
    apt-get install -y nginx && \
    curl -L https://github.com/joyent/containerpilot/releases/download/$CONTAINERPILOT_VERSION/containerpilot-$CONTAINERPILOT_VERSION.tar.gz | \
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
ENV BOB_URL http://localhost
RUN MINIFY=1 bin/build

COPY bin /code/bin
COPY etc /code/etc
COPY src /code/src

ENV POSTGRES_URL pg://postgres:postgres@postgres/postgres

EXPOSE 80

CMD ["bin/run"]
