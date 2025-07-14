FROM node:lts-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN npx drizzle-kit generate

FROM node:lts-alpine AS production
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package-lock.json ./package-lock.json
COPY . .
EXPOSE 3000
USER node
CMD ["npm", "start"]