FROM node:alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src
COPY scripts ./scripts

EXPOSE 5000

CMD ["node", "src/server.js"]
