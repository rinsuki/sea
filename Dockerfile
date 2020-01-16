FROM node:12-alpine as base

WORKDIR /app

# ---

FROM base as package-builder

RUN apk add --no-cache python2 make g++

COPY package.json yarn.lock ./
RUN yarn install

# ---

FROM package-builder as server-builder

COPY tsconfig.json ./
COPY src ./src
RUN yarn build:server

# ---

FROM package-builder as client-builder

ENV NODE_ENV production
COPY tsconfig.json webpack.config.ts ./
COPY src/client ./src/client
RUN yarn build:client

# ---

FROM base

RUN apk add --no-cache ffmpeg

COPY jest.config.js LICENSE ormconfig.js package.json yarn.lock tsconfig.json ./
COPY tests/ ./tests
COPY views ./views
COPY src ./src
COPY --from=package-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/dist ./dist
COPY --from=client-builder /app/dist/client/assets ./dist/client/assets

ENV PORT 3000
EXPOSE 3000

ENV NODE_ENV production

CMD [ "node", "/app/dist/index.js" ]