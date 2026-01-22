FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY tsoa.json ./

COPY src ./src

RUN npm run tsoa
RUN npx tsc

RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/src/app.js"]
