FROM node:12-alpine

WORKDIR /app

RUN apk add --no-cache python2 make g++

COPY package.json yarn.lock ./
RUN yarn install

COPY src views ormconfig.js jest.config.js LICENSE README.md tsconfig.json /app/
RUN yarn build

ENV PORT 3000
EXPOSE 3000

ENV NODE_ENV production

CMD [ "node", "/app/dist/index.js" ]