FROM node:10

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

RUN npm run build