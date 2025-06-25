# backend/account-service/Dockerfile

FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3600

CMD ["node", "index.js"]
