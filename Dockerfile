FROM node:8.2.0

WORKDIR /code

COPY package.json /code/package.json
RUN npm install

COPY .eslintrc /code/.eslintrc
COPY .stylelintrc /code/.stylelintrc
COPY bin/build /code/bin/build
COPY etc/cogs.js /code/etc/cogs.js
COPY src/client /code/src/client
COPY src/shared /code/src/shared
RUN MINIFY=1 bin/build

COPY bin /code/bin
COPY etc /code/etc
COPY src /code/src

EXPOSE 80

CMD ["bin/run"]
