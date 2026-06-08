FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json eslint.config.mjs ./
RUN npm install

COPY api/ ./api/
COPY front/ ./front/

RUN npm exec nx run api:build

FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=build /app/dist/api ./
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/api/prisma ./prisma
COPY --from=build /app/api/prisma.config.ts ./prisma.config.ts
EXPOSE 3000

CMD ["node", "main.js"]
