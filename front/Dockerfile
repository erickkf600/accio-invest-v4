FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json eslint.config.mjs .postcssrc.json ./
RUN npm install

COPY front/ ./front/
COPY api/ ./api/

RUN npm exec nx run front:build --configuration=production

FROM nginx:alpine AS runtime
COPY --from=build /app/dist/front/browser /usr/share/nginx/html
COPY front/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
