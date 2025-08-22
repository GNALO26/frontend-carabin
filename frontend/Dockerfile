FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --unsafe-perm

COPY . .

RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "build"]