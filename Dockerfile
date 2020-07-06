FROM node:14-alpine as base

WORKDIR /app

# ---

FROM base as package-builder

RUN apk add --no-cache python2 make g++

COPY package.json yarn.lock ./
RUN yarn install

# ---

FROM package-builder as builder

COPY tsconfig.json ./
COPY src ./src
RUN yarn build

# ---

FROM base

RUN apk add --no-cache ffmpeg

COPY jest.config.js LICENSE ormconfig.js package.json yarn.lock tsconfig.json ./
COPY tests/ ./tests
COPY views ./views
COPY src ./src
COPY --from=package-builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV PORT 3000
EXPOSE 3000

ENV NODE_ENV production

CMD [ "node", "/app/dist/index.js" ]