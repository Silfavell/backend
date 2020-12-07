FROM node:10

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 3000

RUN npm run build