FROM node:alpine as build
    MAINTAINER Niv Sardi <x@filtra.me>
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json tsconfig.json run.sh ./
COPY src ./src
RUN yarn
RUN chmod +x run.sh
CMD ./run.sh
