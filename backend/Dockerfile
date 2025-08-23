FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production --audit=false

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]