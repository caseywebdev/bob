FROM node:8.2.0

WORKDIR /code

RUN apt-get update && \
    apt-get install -y \
      apt-transport-https \
      software-properties-common && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | \
      apt-key add - && \
    add-apt-repository \
      "deb [arch=amd64] https://download.docker.com/linux/debian \
      $(lsb_release -cs) \
      stable" && \
    apt-get update && \
    apt-get install -y docker-ce

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
