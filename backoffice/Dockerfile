FROM node:20-alpine AS build
WORKDIR /app
COPY backoffice/package*.json ./backoffice/
WORKDIR /app/backoffice
RUN npm install
WORKDIR /app
RUN mkdir -p /app/frontend \
    && ln -s /app/backoffice/node_modules /app/node_modules \
    && ln -s /app/backoffice/node_modules /app/frontend/node_modules
COPY backoffice ./backoffice
COPY frontend/src ./frontend/src
WORKDIR /app/backoffice
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=build /app/backoffice/package*.json ./
COPY --from=build /app/backoffice/node_modules ./node_modules
COPY --from=build /app/backoffice/dist ./dist
EXPOSE 4174
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4174"]
