FROM node:alpine as build
MAINTAINER Niv Sardi <x@filtra.me>
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json tsconfig.json run.sh ./
RUN chmod +x run.sh

RUN yarn

COPY src ./src
CMD ./run.sh
