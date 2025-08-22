FROM node:lts-alpine AS builder
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:lts-alpine AS production
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/next.config.mjs ./next.config.mjs
ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["npm", "start"]
