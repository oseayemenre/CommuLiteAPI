FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm build



FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json ./package.json

COPY --from=builder /usr/src/app/package-lock.json ./package-lock.json

COPY --from=builder /usr/src/app/prisma ./prisma

COPY --from=builder /usr/src/app/prisma ./prisma

COPY --from=builder /usr/src/app/dist ./dist

RUN npm install --only=production

USER node

ENV PORT 5000

EXPOSE $PORT

CMD ["npm", "start"]
