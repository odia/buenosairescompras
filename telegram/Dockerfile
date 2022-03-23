FROM node:alpine as build
MAINTAINER Niv Sardi <x@filtra.me>
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json tsconfig.json ./
RUN npm install

COPY index.ts ./

CMD ts-node index.ts
