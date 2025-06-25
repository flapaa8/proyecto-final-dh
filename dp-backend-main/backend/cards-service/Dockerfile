# backend/cards-service/Dockerfile

FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3602

CMD ["node", "index.js"]
