FROM node:8.1.4

WORKDIR /code

RUN apt-get update && \
    apt-get install -y apt-transport-https software-properties-common && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - && \
    add-apt-repository \
      "deb [arch=amd64] https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" && \
    apt-get update && \
    apt-get install -y docker-ce

COPY package.json /code/package.json
RUN npm install

COPY bin /code/bin
COPY src /code/src

EXPOSE 80

CMD ["bin/run"]
