# syntax=docker/dockerfile:1

# Node image is configurable (see .env / NODE_VERSION); nothing is hardcoded.
ARG NODE_VERSION=20-alpine

# --- build stage: install everything and build client + server ---
FROM node:${NODE_VERSION} AS build
WORKDIR /app

# Manifests first for a cached install layer.
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci

# Sources, then build (client bundle + server compile), then drop dev deps.
COPY client ./client
COPY server ./server
RUN npm run build && npm prune --omit=dev

# --- runtime stage: only what is needed to serve ---
FROM node:${NODE_VERSION} AS runtime
WORKDIR /app

# Defaults — all overridable at runtime (docker-compose reads them from .env).
ENV NODE_ENV=production \
    PORT=8787 \
    DB_PATH=/data/bookclub.db

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist

# The SQLite file lives on a mounted volume; make its dir writable by the
# non-root user so a freshly created named volume inherits the ownership.
RUN mkdir -p /data && chown -R node:node /data
USER node

EXPOSE 8787
CMD ["node", "server/dist/index.js"]
