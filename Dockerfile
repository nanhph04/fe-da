FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

ARG GATEWAY_INTERNAL_URL=http://api-gateway:4000
ARG NEXT_PUBLIC_APP_HOST_IP=localhost
ARG NEXT_PUBLIC_GATEWAY_URL=http://localhost:4000
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_AVATAR_STORAGE_URL=http://localhost:19000
ARG NEXT_PUBLIC_MEDIA_STORAGE_URL=http://localhost:19000

ENV GATEWAY_INTERNAL_URL=$GATEWAY_INTERNAL_URL
ENV NEXT_PUBLIC_APP_HOST_IP=$NEXT_PUBLIC_APP_HOST_IP
ENV NEXT_PUBLIC_GATEWAY_URL=$NEXT_PUBLIC_GATEWAY_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AVATAR_STORAGE_URL=$NEXT_PUBLIC_AVATAR_STORAGE_URL
ENV NEXT_PUBLIC_MEDIA_STORAGE_URL=$NEXT_PUBLIC_MEDIA_STORAGE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/src/i18n ./src/i18n
COPY --from=builder /app/src/proxy.ts ./src/proxy.ts

EXPOSE 3000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
