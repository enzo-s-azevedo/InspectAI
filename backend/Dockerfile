FROM node:20 AS deps
WORKDIR /app

# Sem apt-get! A imagem node:20 já tem tudo o que o Prisma precisa.
COPY package*.json ./
COPY prisma ./prisma
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci --no-audit
RUN npx prisma generate

FROM node:20 AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Novamente, sem apt-get aqui!
COPY --from=builder /app .
EXPOSE 3000

CMD ["sh", "-c", "npm run db:push && npm run db:seed && npm run start"]