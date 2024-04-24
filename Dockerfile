FROM node:20.12.2-alpine
WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .
