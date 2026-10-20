FROM node:20-bookworm

WORKDIR /app

COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm_config_build_from_source=true npm install --omit=dev

COPY client/package.json client/package-lock.json ./client/
# vite is a devDependency, so force dev deps even if the build env sets NODE_ENV=production
RUN cd client && npm ci --include=dev

COPY . .

RUN cd client && npm run build

EXPOSE 3000
CMD ["node", "server/index.js"]