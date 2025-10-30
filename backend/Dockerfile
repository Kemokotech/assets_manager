FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads/images uploads/qrcodes

EXPOSE 5000

CMD ["sh", "-c", "npm run setup && npm start"]
