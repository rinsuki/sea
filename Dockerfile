FROM node:12-alpine as base

WORKDIR /app

# ---

FROM base as builder

RUN apk add --no-cache python2 make g++ ffmpeg

COPY package.json yarn.lock ./
RUN yarn install

COPY tsconfig.json ./
COPY src ./src
RUN yarn build

# ---

FROM base as production-modules-builder

RUN apk add --no-cache python2 make g++ ffmpeg
COPY package.json yarn.lock ./
RUN yarn install --prod

# ---

FROM base

RUN apk add --no-cache ffmpeg

COPY --from=production-modules-builder /app/node_modules ./node_modules
COPY jest.config.js LICENSE ormconfig.js ./
COPY tests/ ./tests
COPY views ./views
COPY --from=builder /app/dist ./dist

ENV PORT 3000
EXPOSE 3000

ENV NODE_ENV production

CMD [ "node", "/app/dist/index.js" ]