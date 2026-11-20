FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npx next build

ENV NODE_ENV=production
ENV PORT=43123
EXPOSE 43123

# Runtime needs DATABASE_URL, DIRECT_URL, and AUTH_SECRET.
# Apply migrations on boot. Seed once with `npm run db:seed`, not on every start.
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -H 0.0.0.0 -p 43123"]
