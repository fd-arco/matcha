FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . .

RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

EXPOSE 3000

CMD ["sh", "-c", "node database/migrations/migrate.js && npm start"]